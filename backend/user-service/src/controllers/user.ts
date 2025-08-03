import { NextFunction, Response, Request } from "express";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { publishToQueue } from "../config/rabbitMq.js";

export const loginUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);
