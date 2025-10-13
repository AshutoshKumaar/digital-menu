// utils/UpdateRewardOnOrderConfirm.js
import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

/**
 * Confirms pending rewards for an order and moves them to the permanent wallet balance.
 * Note: This function requires userId (customerId) and orderId to be known, typically done on the backend or owner dashboard.
 * @param {string} orderId
 * @param {string} userId - The customer's UID
 */
export async function updateRewardOnOrderConfirm(orderId, userId) {
  // NOTE: Assuming userId is passed correctly here, usually from the order data on the server/owner side.
  if (!userId) throw new Error("User ID (Customer ID) must be provided to confirm reward.");

  try {
    const walletRef = doc(db, "users", userId, "wallet", "balance");
    const txnRef = collection(db, "users", userId, "transactions");

    const snap = await getDoc(walletRef);
    if (!snap.exists()) return console.log(`Wallet not found for user: ${userId}`);

    const data = snap.data();
    const earnedCoins = data.pendingCoins || 0;
    const earnedRupees = data.pendingRupees || 0;

    // 1. Move pending to permanent balance and reset pending fields
    await updateDoc(walletRef, {
      coins: (data.coins || 0) + earnedCoins,
      rupees: (data.rupees || 0) + earnedRupees,
      pendingCoins: 0,
      pendingRupees: 0,
    });

    // 2. Update Order Reward Status
    await updateDoc(doc(db, "orders", orderId), { "reward.status": "confirmed" });

    // 3. Log additions
    if (earnedCoins > 0) {
      await addDoc(txnRef, {
        type: "Added",
        amount: `+${earnedCoins} Coins`,
        reason: `Reward credited from Order ${orderId}`,
        date: serverTimestamp(),
      });
    }

    if (earnedRupees > 0) {
      await addDoc(txnRef, {
        type: "Added",
        amount: `+₹${earnedRupees}`,
        reason: `Cashback credited from Order ${orderId}`,
        date: serverTimestamp(),
      });
    }

    console.log(`✅ Pending rewards confirmed for user ${userId} and added to wallet.`);
  } catch (error) {
    console.error("❌ Error in updateRewardOnOrderConfirm:", error);
    throw error;
  }
}