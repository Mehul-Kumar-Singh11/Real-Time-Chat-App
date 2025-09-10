import { Response, Request } from "express";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { publishToQueue } from "../config/rabbitMq.js";
import { User } from "../model/User.js";
import { generateToken } from "../config/generateToken.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";

export const loginUser = TryCatch(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Adding a rate limiter
  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);
  // If rateLimit is there, stop user from creating new OTPs
  if (rateLimit) {
    res.status(429).json({
      message: "Too many requests. Please wait before requesting new OTP",
    });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, otp, {
    EX: 300, // OTP expires after 5 minutes
  });

  await redisClient.set(rateLimitKey, "true", {
    EX: 60, // rateLimit for user expires after 1 minute
  });

  const message = {
    to: email,
    subject: "Your OTP code",
    body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  // Decoupling mail sending logic (great for scalability)
  await publishToQueue("send-otp", message);

  res.status(200).json({
    message: "OTP sent to your mail.",
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp: enteredOTP } = req.body;

  if (!email || !enteredOTP) {
    return res.status(400).json({
      message: "Email and OTP required",
    });
  }

  const otpKey = `otp:${email}`;
  const storedOTP = await redisClient.get(otpKey);

  if (!storedOTP || storedOTP != enteredOTP) {
    return res.status(400).json({
      message: "Invalid or expired OTP",
    });
  }

  await redisClient.del(otpKey);

  let user = await User.findOne({ email });

  // if user is not present in db, then will create a new user
  if (!user) {
    const name = email.slice(0, 8);
    user = await User.create({
      name,
      email,
    });
  }

  // create token
  const token = generateToken(user);

  res.json({
    message: "User Verified",
    user,
    token,
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userEmail = req.user?.email;
  const user = await User.findOne({ email: userEmail });
  res.json(user);
});

export const updateName = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({
      message: "Please login",
    });
    return;
  }

  const { name } = req.body;
  if (!name) {
    res.status(400).json({
      message: "Name is required",
    });
    return;
  }

  user.name = name;
  await user.save();

  const token = generateToken(user);

  res.json({
    message: "User Updated",
    user,
    token,
  });
});

export const getUser = TryCatch(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  res.json(user);
});

export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
  const users = await User.find();

  res.json(users);
});
