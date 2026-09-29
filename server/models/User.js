import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, default: "ABC Traders" },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, default: "Surat, Gujarat, India" },
    gstNumber: { type: String, default: "24AAACB1234A1Z5" },
    role: { type: String, default: "admin" },
    provider: { type: String, default: "local" }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
