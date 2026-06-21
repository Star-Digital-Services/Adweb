"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { razorpayPublicKeyId } from "@/config/razorpay-public";
import type { RazorpayOrderResponse } from "@/types";
import { getSetById } from "@/config/sets";

export function useRazorpayCheckout(setId: string) {
  const { user, refreshUser } = useAuth();
  const [processing, setProcessing] = useState(false);

  const photoSet = getSetById(setId);

  const startCheckout = useCallback(async () => {
    if (!photoSet) throw new Error("Photo set not found");
    if (!user) throw new Error("You must be logged in to purchase access");
    if (user.purchasedSets.includes(setId)) {
      throw new Error("You already have access to this set");
    }

    setProcessing(true);

    try {
      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ setId }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const order: RazorpayOrderResponse = orderData;

      if (
        razorpayPublicKeyId &&
        order.keyId &&
        razorpayPublicKeyId !== order.keyId
      ) {
        throw new Error(
          "Payment configuration mismatch. Update Render env vars so KEY_ID matches on server and client."
        );
      }

      if (!window.Razorpay) {
        throw new Error("Payment gateway is still loading. Please try again.");
      }

      return new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Spicy Content Premium",
          description: photoSet.name,
          order_id: order.orderId,
          prefill: { email: user.email },
          theme: { color: "#7c3aed" },
          handler: async (response) => {
            try {
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(response),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(
                  verifyData.error || "Payment verification failed"
                );
              }

              await refreshUser();
              resolve();
            } catch (err) {
              reject(err);
            } finally {
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
              reject(new Error("Payment cancelled"));
            },
          },
        });

        rzp.on("payment.failed", (response) => {
          setProcessing(false);
          reject(new Error(response.error.description || "Payment failed"));
        });

        rzp.open();
      });
    } catch (err) {
      setProcessing(false);
      throw err;
    }
  }, [user, refreshUser, setId, photoSet]);

  return { startCheckout, processing };
}
