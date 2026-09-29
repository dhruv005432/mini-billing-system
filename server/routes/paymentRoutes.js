import express from "express";
import Invoice from "../models/Invoice.js";
import Settings from "../models/Settings.js";
import NotificationLog from "../models/NotificationLog.js";
import { sendPaymentMail } from "../services/mailService.js";
import { sendPaymentSms } from "../services/smsService.js";

const router = express.Router();
const getIO = (req) => req.app.get("io");

// 1. Record Partial or Full Payment
router.post("/:invoiceId", async (req, res) => {
  try {
    const { amount, paymentMethod = "Cash" } = req.body;
    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount." });
    }

    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found." });

    const total = Number(invoice.total || 0);
    const newPaid = Number(invoice.amountPaid || 0) + paymentAmount;
    const newDue = Math.max(total - newPaid, 0);

    let newStatus = "Partial";
    if (newDue === 0) newStatus = "Paid";
    else if (newPaid === 0) newStatus = "Pending";

    const paymentEntry = {
      id: Date.now().toString(),
      amount: paymentAmount,
      paymentMethod,
      date: new Date().toISOString().split("T")[0]
    };

    invoice.amountPaid = newPaid;
    invoice.amountDue = newDue;
    invoice.paymentStatus = newStatus;
    invoice.paymentMethod = paymentMethod;
    invoice.paymentHistory.push(paymentEntry);

    const updatedInvoice = await invoice.save();

    // Fetch settings for branding
    const settings = (await Settings.findOne()) || { businessName: "ABC Traders", currency: "₹" };

    // Compulsory Mail Delivery
    if (updatedInvoice.customerEmail) {
      sendPaymentMail({
        to: updatedInvoice.customerEmail,
        invoice: updatedInvoice,
        paymentAmount,
        paymentMethod,
        businessName: settings.businessName,
        currency: settings.currency
      }).catch((err) => console.warn("Payment email warning:", err.message));
    }

    // Compulsory SMS Delivery
    if (updatedInvoice.customerMobile) {
      sendPaymentSms({
        mobile: updatedInvoice.customerMobile,
        customerName: updatedInvoice.customerName,
        invoiceNumber: updatedInvoice.invoiceNumber,
        amount: paymentAmount,
        due: updatedInvoice.amountDue,
        businessName: settings.businessName,
        currency: settings.currency
      }).catch((err) => console.warn("Payment SMS warning:", err.message));
    }

    // Socket.io Real-time Live Broadcast
    const io = getIO(req);
    if (io) {
      io.emit("payment:recorded", {
        invoice: updatedInvoice,
        payment: paymentEntry,
        message: `Payment of ${settings.currency}${paymentAmount} recorded for Invoice #${updatedInvoice.invoiceNumber}`
      });
    }

    res.json({
      success: true,
      invoice: updatedInvoice,
      message: `Payment of ${settings.currency}${paymentAmount} recorded successfully.`
    });
  } catch (err) {
    console.error("Payment recording error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 2. GET Notification / Audit Logs
router.get("/logs", async (_req, res) => {
  try {
    const logs = await NotificationLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
