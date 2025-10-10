import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getUserId } from "../utils/getUserId";

/**
 * Confirms pending rewards for an order and moves them to the wallet.
 * @param {string} orderId
 */
export async function updateRewardOnOrderConfirm(orderId) {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    const walletRef = doc(db, "users", userId, "wallet", "balance");
    const txnRef = collection(db, "users", userId, "transactions");

    const snap = await getDoc(walletRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const earnedCoins = data.pendingCoins || 0;
    const earnedRupees = data.pendingRupees || 0;

    await updateDoc(walletRef, {
      coins: (data.coins || 0) + earnedCoins,
      rupees: (data.rupees || 0) + earnedRupees,
      pendingCoins: 0,
      pendingRupees: 0,
    });

    await updateDoc(doc(db, "orders", orderId), { "reward.status": "confirmed" });

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

    console.log("✅ Pending rewards confirmed and added to wallet");
  } catch (error) {
    console.error("❌ Error in updateRewardOnOrderConfirm:", error);
    throw error;
  }
}
