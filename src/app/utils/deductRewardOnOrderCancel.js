import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

/**
 * Deducts pending rewards from wallet if order is canceled.
 * @param {string} orderId
 * @param {string} userId
 */
export async function deductRewardOnOrderCancel(orderId, userId) {
  try {
    const walletRef = doc(db, "users", userId, "wallet", "balance");
    const txnRef = collection(db, "users", userId, "transactions");

    const snap = await getDoc(walletRef);
    if (!snap.exists()) return console.log("Wallet not found");

    const data = snap.data();
    const pendingCoins = data.pendingCoins || 0;
    const pendingRupees = data.pendingRupees || 0;

    await updateDoc(walletRef, { pendingCoins: 0, pendingRupees: 0 });
    await updateDoc(doc(db, "orders", orderId), { "reward.status": "cancelled" });

    if (pendingCoins > 0) {
      await addDoc(txnRef, {
        type: "Deducted",
        amount: `-${pendingCoins} Coins`,
        reason: `Pending reward removed from cancelled Order ${orderId}`,
        date: serverTimestamp(),
      });
    }

    if (pendingRupees > 0) {
      await addDoc(txnRef, {
        type: "Deducted",
        amount: `-₹${pendingRupees}`,
        reason: `Pending cashback removed from cancelled Order ${orderId}`,
        date: serverTimestamp(),
      });
    }

    console.log("❌ Pending rewards removed after order cancel + transaction logged");
  } catch (error) {
    console.error("❌ Error in deductRewardOnOrderCancel:", error);
    throw error;
  }
}
