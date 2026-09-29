import express from "express";
import Customer from "../models/Customer.js";

const router = express.Router();
const getIO = (req) => req.app.get("io");

// GET all customers
router.get("/", async (_req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE customer
router.post("/", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    const io = getIO(req);
    if (io) io.emit("customer:created", customer);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE customer
router.put("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const io = getIO(req);
    if (io) io.emit("customer:updated", customer);
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE customer
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const io = getIO(req);
    if (io) io.emit("customer:deleted", { id: req.params.id });
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
