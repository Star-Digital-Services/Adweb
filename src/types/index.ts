export interface User {
  id: string;
  email: string;
  purchasedSets: string[];
}

export interface Photo {
  id: string;
  title: string;
  signedUrl: string;
  expiresIn: number;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  setId: string;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
