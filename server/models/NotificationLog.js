import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["mail", "sms", "socket", "system"], required: true },
    recipient: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["sent", "delivered", "failed"], default: "sent" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("NotificationLog", notificationLogSchema);
