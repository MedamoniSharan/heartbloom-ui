import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "name, email, subject and message required" });
    }
    await Contact.create({ name, email, subject, message });
    res.status(201).json({ message: "Message sent" });
  } catch (e) {
    next(e);
  }
});

export default router;
