import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    customerType: { type: String, default: "Retail" }
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
