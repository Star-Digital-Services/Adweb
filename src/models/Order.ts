import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed";

export interface IOrder extends Document {
  userId: Types.ObjectId;
  setId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  status: OrderStatus;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    setId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

OrderSchema.index({ userId: 1, setId: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
