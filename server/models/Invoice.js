import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    productId: { type: String },
    name: { type: String, required: true },
    sku: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    taxable: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  { _id: false }
);

const paymentHistorySchema = new mongoose.Schema(
  {
    id: { type: String, default: () => Date.now().toString() },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: "Cash" },
    date: { type: String, default: () => new Date().toISOString().split("T")[0] }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    customerId: { type: String, default: null },
    customerName: { type: String, required: true },
    customerMobile: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerAddress: { type: String, default: "" },
    customerGst: { type: String, default: "" },
    items: [invoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Paid"
    },
    paymentMethod: { type: String, default: "Cash" },
    paymentHistory: [paymentHistorySchema],
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
