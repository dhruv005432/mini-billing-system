import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "ABC Traders" },
    ownerName: { type: String, default: "Admin" },
    mobile: { type: String, default: "9876543210" },
    email: { type: String, default: "contact@abctraders.com" },
    address: { type: String, default: "402, Ring Road, Surat, Gujarat - 395002" },
    gstNumber: { type: String, default: "24AAACB1234A1Z5" },
    invoicePrefix: { type: String, default: "INV" },
    startingNumber: { type: Number, default: 1001 },
    currency: { type: String, default: "₹" },
    gstMode: { type: String, default: "CGST + SGST" },
    invoiceFooter: {
      type: String,
      default: "Thank you for your business! Please visit again."
    }
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
