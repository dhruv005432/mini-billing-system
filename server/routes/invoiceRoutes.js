import express from "express";
import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import Settings from "../models/Settings.js";
import { sendInvoiceMail } from "../services/mailService.js";
import { sendInvoiceSms } from "../services/smsService.js";

const router = express.Router();
const getIO = (req) => req.app.get("io");

// 1. GET all invoices
router.get("/", async (_req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET invoice by ID
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. CREATE invoice + Stock Deduction + Compulsory Mail & SMS + Socket.io Broadcast
router.post("/", async (req, res) => {
  try {
    const invoiceData = req.body;

    // Determine invoice number
    let invoiceNumber = invoiceData.invoiceNumber;
    if (!invoiceNumber) {
      const count = await Invoice.countDocuments();
      invoiceNumber = `INV-${1001 + count}`;
    }

    const total = Number(invoiceData.total || 0);
    const amountPaid = Number(
      invoiceData.amountPaid !== undefined
        ? invoiceData.amountPaid
        : invoiceData.paymentStatus === "Paid"
        ? total
        : 0
    );
    const amountDue =
      invoiceData.amountDue !== undefined
        ? Number(invoiceData.amountDue)
        : Math.max(total - amountPaid, 0);

    const initialHistory =
      Array.isArray(invoiceData.paymentHistory) && invoiceData.paymentHistory.length > 0
        ? invoiceData.paymentHistory
        : amountPaid > 0
        ? [
            {
              id: Date.now().toString(),
              amount: amountPaid,
              paymentMethod: invoiceData.paymentMethod || "Cash",
              date: invoiceData.date || new Date().toISOString().split("T")[0]
            }
          ]
        : [];

    const newInvoice = new Invoice({
      ...invoiceData,
      invoiceNumber,
      date: invoiceData.date || new Date().toISOString().split("T")[0],
      total,
      amountPaid,
      amountDue,
      paymentHistory: initialHistory
    });

    // Stock deduction for billed items
    if (newInvoice.items && newInvoice.items.length > 0) {
      for (const item of newInvoice.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -Number(item.quantity || 1) }
          });
        } else if (item.name) {
          await Product.findOneAndUpdate(
            { name: item.name },
            { $inc: { stock: -Number(item.quantity || 1) } }
          );
        }
      }
    }

    const savedInvoice = await newInvoice.save();

    // Fetch settings for business branding
    const settings = (await Settings.findOne()) || { businessName: "ABC Traders", currency: "₹" };

    // Compulsory Mail Delivery
    if (savedInvoice.customerEmail) {
      sendInvoiceMail({
        to: savedInvoice.customerEmail,
        invoice: savedInvoice,
        businessName: settings.businessName,
        currency: settings.currency
      }).catch((err) => console.warn("Invoice email background error:", err.message));
    }

    // Compulsory SMS Delivery
    if (savedInvoice.customerMobile) {
      sendInvoiceSms({
        mobile: savedInvoice.customerMobile,
        customerName: savedInvoice.customerName,
        invoiceNumber: savedInvoice.invoiceNumber,
        total: savedInvoice.total,
        due: savedInvoice.amountDue,
        businessName: settings.businessName,
        currency: settings.currency
      }).catch((err) => console.warn("Invoice SMS background error:", err.message));
    }

    // Socket.io Real-Time Broadcast
    const io = getIO(req);
    if (io) {
      io.emit("invoice:created", {
        invoice: savedInvoice,
        message: `New Invoice #${savedInvoice.invoiceNumber} created for ${savedInvoice.customerName}`
      });
    }

    res.status(201).json(savedInvoice);
  } catch (err) {
    console.error("Create invoice error:", err);
    res.status(400).json({ message: err.message });
  }
});

// 4. DELETE invoice + Automatic Stock Restoration + Socket.io Broadcast
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Automatic stock restoration
    if (invoice.items && invoice.items.length > 0) {
      for (const item of invoice.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: Number(item.quantity || 1) }
          });
        } else if (item.name) {
          await Product.findOneAndUpdate(
            { name: item.name },
            { $inc: { stock: Number(item.quantity || 1) } }
          );
        }
      }
    }

    await Invoice.findByIdAndDelete(req.params.id);

    // Socket.io Real-time Broadcast
    const io = getIO(req);
    if (io) {
      io.emit("invoice:deleted", {
        id: req.params.id,
        invoiceNumber: invoice.invoiceNumber,
        message: `Invoice #${invoice.invoiceNumber} deleted and stock restored.`
      });
    }

    res.json({ message: `Invoice #${invoice.invoiceNumber} deleted and stock restored.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
