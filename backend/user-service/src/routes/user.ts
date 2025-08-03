import express from "express";
import {
  getAllUsers,
  getUser,
  loginUser,
  myProfile,
  updateName,
  verifyUser,
} from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, myProfile);
router.put("/update/user", isAuth, updateName);
router.get("/user/:id", getUser);
router.get("/users/all", isAuth, getAllUsers);

export default router;
