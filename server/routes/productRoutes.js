import express from "express";
import Product from "../models/Product.js";

const router = express.Router();
const getIO = (req) => req.app.get("io");

// GET all products
router.get("/", async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE product
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const io = getIO(req);
    if (io) io.emit("product:created", product);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const io = getIO(req);
    if (io) io.emit("product:updated", product);
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const io = getIO(req);
    if (io) io.emit("product:deleted", { id: req.params.id });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
