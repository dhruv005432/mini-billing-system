import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();
const getIO = (req) => req.app.get("io");

// GET settings
router.get("/", async (_req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        businessName: "ABC Traders",
        ownerName: "Admin",
        mobile: "9876543210",
        email: "contact@abctraders.com",
        address: "402, Ring Road, Surat, Gujarat - 395002",
        gstNumber: "24AAACB1234A1Z5"
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE settings
router.put("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
    } else {
      settings = await Settings.create(req.body);
    }

    const io = getIO(req);
    if (io) io.emit("settings:updated", settings);

    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
