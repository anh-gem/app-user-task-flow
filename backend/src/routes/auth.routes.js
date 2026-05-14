import express from "express";
import {
  registerMember,
  loginMember,
  logoutMember,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerMember);
router.post("/login", loginMember);
router.get("/check-auth", authMiddleware, (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: req.user,
  });
});
router.post("/logout", logoutMember);

export default router;
