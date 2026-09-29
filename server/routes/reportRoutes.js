import express from "express";
import Invoice from "../models/Invoice.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const invoices = await Invoice.find(filter).sort({ date: -1 });

    const summary = invoices.reduce(
      (acc, inv) => {
        acc.totalSales += Number(inv.total || 0);
        acc.totalCollected += Number(inv.amountPaid || 0);
        acc.totalOutstanding += Number(inv.amountDue || 0);
        acc.totalGST += Number(inv.gstTotal || inv.gstAmount || 0);
        acc.invoiceCount += 1;
        if (inv.paymentStatus === "Paid") acc.paidCount += 1;
        else if (inv.paymentStatus === "Partial") acc.partialCount += 1;
        else acc.pendingCount += 1;
        return acc;
      },
      {
        totalSales: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        totalGST: 0,
        invoiceCount: 0,
        paidCount: 0,
        partialCount: 0,
        pendingCount: 0
      }
    );

    res.json({ summary, count: invoices.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
