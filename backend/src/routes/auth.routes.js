import express from "express";
import {
  registerMember,
  loginMember,
  logoutMember,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerMember);
router.post("/login", loginMember);
router.post("/logout", logoutMember);

export default router;
