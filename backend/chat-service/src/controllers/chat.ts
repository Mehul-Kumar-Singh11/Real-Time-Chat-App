import axios, { Axios, AxiosHeaders } from "axios";
import TryCatch from "../config/TryCatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/chat.js";
import { Messages } from "../models/messages.js";

export const createNewChat = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      res.status(400).json({
        message: "Receiver Id is required",
      });
      return;
    }

    const existingChat = await Chat.findOne({
      users: { $all: [userId, receiverId], $size: 2 },
    });

    if (existingChat) {
      res.json({
        message: "Chat already exists",
        chatId: existingChat._id,
      });
      return;
    }

    const newChat = await Chat.create({
      users: [userId, receiverId],
    });
    res.status(201).json({
      message: "New Chat Created",
      chatId: newChat._id,
    });
  }
);

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(400).json({
      message: "User Id missing",
    });
    return;
  }

  const chats = await Chat.find({
    users: userId,
  }).sort({ updatedAt: -1 });

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const receiverId = chat.users.find((id) => id != userId);

      const unseenCount = await Messages.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      });

      try {
        const { data } = await axios.get(
          `${process.env.USER_SERVICE}/api/v1/user/${receiverId}`
        );

        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      } catch (err) {
        console.error(err);
        return {
          user: {
            _id: receiverId,
            name: "Unknown user",
          },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      }
    })
  );

  res.json({
    chats: chatWithUserData,
  });
});

export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;

  // to upload a file, using multer and cloudinary
  const imageFile = req.file;

  if (!senderId) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  if (!chatId) {
    res.status(400).json({
      message: "Chat Id required",
    });
    return;
  }

  if (!text && !imageFile) {
    res.status(400).json({
      message: "Either text or message is required",
    });
    return;
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404).json({
      message: "Chat Not Found",
    });
    return;
  }

  // anyone cannot message in the specific chat
  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  );

  if (!isUserInChat) {
    res.status(403).json({
      message: "You are not a participant of this chat",
    });
    return;
  }

  const receiverId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString()
  );

  if (!receiverId) {
    res.status(401).json({
      message: "No Receiver Id",
    });
    return;
  }

  // Socket Setup

  let messageData: any = {
    chatId: chatId,
    sender: senderId,
    seen: false,
    seenAt: undefined,
  };

  if (imageFile) {
    messageData.image = {
      url: imageFile.path,
      publicId: imageFile.filename,
    };
    messageData.messageType = "image";
    messageData.text = text || "";
  } else {
    messageData.text = text;
    messageData.messageType = "text";
  }

  const message = new Messages(messageData);

  const savedMessage = await message.save();

  const latestMessageText = imageFile ? "📷 Image" : text;

  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMessage: {
        type: latestMessageText,
        sender: senderId,
      },
      updatedAt: new Date(),
    },
    {
      new: true,
    }
  );

  // emit to sockets

  res.status(201).json({
    message: "Message sent successfully",
    data: savedMessage,
    sender: senderId,
  });
});

export const getMessagesByChat = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    if (!chatId) {
      res.status(400).json({
        message: "Chat Id required",
      });
      return;
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404).json({
        message: "Chat Not Found",
      });
      return;
    }

    // anyone cannot message in the specific chat
    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === userId.toString()
    );

    if (!isUserInChat) {
      res.status(403).json({
        message: "You are not a participant of this chat",
      });
      return;
    }

    // have to mark all the messages of chat as seen
    const messagesToMarkSeen = await Messages.find({
      chatId: chatId,
      sender: { $ne: userId },
      seen: false,
    });

    await Messages.updateMany(
      {
        chatId: chatId,
        sender: { $ne: userId },
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      }
    );

    const messages = await Messages.find({
      chatId: chatId,
    }).sort({ createdAt: 1 });

    const receiverId = chat.users.find((id) => id !== userId);

    try {
      const { data } = await axios.get(
        `${process.env.USER_SERVICE}/api/v1/user/${receiverId}`
      );

      if (!receiverId) {
        res.status(400).json({
          message: "No Receiver Id",
        });
        return;
      }

      // socket work

      res.json({
        message: messages,
        user: data,
      });
    } catch (err) {
      console.error(err);
      res.json({
        message: messages,
        user: { _id: receiverId, name: "Unknown User" },
      });
    }
  }
);
