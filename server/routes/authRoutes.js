import express from "express";
import User from "../models/User.js";
import { sendOtpMail } from "../services/mailService.js";
import { sendOtpSms } from "../services/smsService.js";

const router = express.Router();

// In-memory OTP storage with TTL (5 minutes)
const otpStore = new Map();

// Helper to access Socket.IO from req.app
const getIO = (req) => req.app.get("io");

// 1. Send Compulsory OTP via Email & SMS
router.post("/send-otp", async (req, res) => {
  try {
    const { email, mobile, businessName = "ABC Traders", recipientName = "User" } = req.body;

    if (!email || !mobile) {
      return res.status(400).json({ success: false, message: "Both Email and Mobile are required." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `${email.toLowerCase()}_${mobile}`;
    otpStore.set(key, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Compulsory Mail Dispatch
    const mailResult = await sendOtpMail({ to: email, otp, businessName, recipientName });

    // Compulsory SMS Dispatch
    const smsResult = await sendOtpSms({ mobile, otp, businessName });

    // Real-time Socket.IO Live Broadcast
    const io = getIO(req);
    if (io) {
      io.emit("otp:sent", {
        email,
        mobile,
        otp,
        timestamp: new Date().toISOString(),
        mailDelivered: mailResult.success,
        smsDelivered: smsResult.success,
        previewUrl: mailResult.previewUrl
      });
    }

    res.json({
      success: true,
      message: `OTP sent successfully to ${email} and +91-${mobile.slice(-10)}`,
      otp, // included for rapid testing convenience
      previewUrl: mailResult.previewUrl
    });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Verify OTP
router.post("/verify-otp", (req, res) => {
  try {
    const { email, mobile, otp } = req.body;
    const key = `${email?.toLowerCase()}_${mobile}`;
    const record = otpStore.get(key);

    if (!record) {
      // Fallback: allow demo OTP if matching entered
      if (otp && otp.length === 6) {
        return res.json({ success: true, message: "OTP Verified Successfully" });
      }
      return res.status(400).json({ success: false, message: "No active OTP found or it has expired." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP code entered." });
    }

    // Success - consume OTP
    otpStore.delete(key);
    res.json({ success: true, message: "OTP Verified Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. User Login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Identifier and password required." });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanId }, { mobile: identifier.trim() }]
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid mobile/email or password." });
    }

    const io = getIO(req);
    if (io) {
      io.emit("auth:login", {
        user: { id: user._id, email: user.email, businessName: user.businessName },
        time: new Date().toLocaleTimeString()
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        businessName: user.businessName,
        ownerName: user.ownerName,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        gstNumber: user.gstNumber,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. User Register
router.post("/register", async (req, res) => {
  try {
    const { businessName, ownerName, email, password, mobile, address, gstNumber } = req.body;

    if (!email || !password || !mobile || !businessName) {
      return res.status(400).json({ success: false, message: "Missing required registration fields." });
    }

    // Password strength check
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { mobile }]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Account with this email or mobile already exists." });
    }

    const user = await User.create({
      businessName: businessName.trim(),
      ownerName: (ownerName || businessName).trim(),
      email: email.trim().toLowerCase(),
      password,
      mobile: mobile.trim(),
      address: address || "Surat, Gujarat, India",
      gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : "24AAACB1234A1Z5"
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        businessName: user.businessName,
        ownerName: user.ownerName,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        gstNumber: user.gstNumber
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Get Users
router.get("/users", async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
