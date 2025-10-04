// /utils/updateRewardOnStatusChange.js
import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateRewardOnOrderConfirm } from "./updateRewardOnOrderConfirm";
import { deductRewardOnOrderCancel } from "./deductRewardOnOrderCancel";

export async function updateRewardOnStatusChange(orderId, status, userId) {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return console.error("Order not found!");

    const order = orderSnap.data();
    const reward = order.reward;
    if (!reward) return console.log("No reward data found for this order");

    const walletRef = doc(db, "users", userId, "wallet", "balance");
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) return console.log("Wallet not found");

    const wallet = walletSnap.data();

    // ---------- CONFIRM ----------
    if (status === "confirmed" && reward.status === "pending") {
      // Update wallet: move pending to confirmed
      await updateRewardOnOrderConfirm(orderId);

    }

    // ---------- CANCEL ----------
    if (status === "cancelled" && reward.status === "pending") {
      await deductRewardOnOrderCancel(orderId, userId);
      await updateDoc(walletRef, {
        pendingCoins: 0,
        pendingRupees: 0,
      });
      await updateDoc(orderRef, { "reward.status": "cancelled" });
    }

  } catch (error) {
    console.error("Reward update error:", error);
  }
}
