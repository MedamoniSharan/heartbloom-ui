import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

function toUserResponse(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
}

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user: toUserResponse(user), token });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: toUserResponse(user), token });
  } catch (e) {
    next(e);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ message: "Google OAuth not configured" });
    }
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    let user = await User.findOne({ email: payload.email });
    if (user) {
      if (!user.googleId) {
        user.googleId = payload.sub;
        if (payload.picture && !user.avatar) user.avatar = payload.picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        googleId: payload.sub,
        avatar: payload.picture || null,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: toUserResponse(user), token });
  } catch (e) {
    if (e.message?.includes("Token used too late") || e.message?.includes("Invalid token")) {
      return res.status(401).json({ message: "Invalid or expired Google token" });
    }
    next(e);
  }
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: toUserResponse(req.user) });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

export default router;
