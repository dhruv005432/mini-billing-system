import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, default: "General" },
    price: { type: Number, required: true, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    gst: { type: Number, required: true, default: 18 },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "Pcs" },
    minStock: { type: Number, default: 5 }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
