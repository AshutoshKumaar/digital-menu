import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getUserId } from "../utils/getUserId";

export async function deductRewardOnOrderCancel(orderId) {
  const userId = getUserId();
  const walletRef = doc(db, "users", userId, "wallet", "balance");
  const txnRef = collection(db, "users", userId, "transactions");

  const snap = await getDoc(walletRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const pendingCoins = data.pendingCoins || 0;
  const pendingRupees = data.pendingRupees || 0;

  // Reset pending rewards
  await updateDoc(walletRef, {
    pendingCoins: 0,
    pendingRupees: 0,
  });

  // Update order reward status
  await updateDoc(doc(db, "orders", orderId), {
    "reward.status": "cancelled",
  });

  // Add transaction record for deducted coins
  if (pendingCoins > 0) {
    await addDoc(txnRef, {
      type: "Deducted",
      amount: `-${pendingCoins} Coins`,
      reason: `Pending reward removed from cancelled Order ${orderId}`,
      date: serverTimestamp(),
    });
  }

  // Add transaction record for deducted rupees
  if (pendingRupees > 0) {
    await addDoc(txnRef, {
      type: "Deducted",
      amount: `-₹${pendingRupees}`,
      reason: `Pending cashback removed from cancelled Order ${orderId}`,
      date: serverTimestamp(),
    });
  }

  console.log("❌ Pending rewards removed after order cancel + transaction logged");
}
