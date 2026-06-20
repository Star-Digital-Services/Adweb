import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { grantSetAccess } from "@/lib/access";

export async function grantAccessForPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<boolean> {
  await connectDB();

  const order = await Order.findOne({ razorpayOrderId });
  if (!order) return false;

  if (order.status === "paid") return true;

  order.status = "paid";
  order.razorpayPaymentId = razorpayPaymentId;
  order.updatedAt = new Date();
  await order.save();

  await grantSetAccess(order.userId.toString(), order.setId);
  return true;
}
