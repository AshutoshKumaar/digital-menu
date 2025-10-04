import { db } from "@/app/firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getUserId } from "../utils/getUserId";

export async function updateRewardOnOrderConfirm(orderId) {
  const userId = getUserId();
  const walletRef = doc(db, "users", userId, "wallet", "balance");
  const txnRef = collection(db, "users", userId, "transactions");

  const snap = await getDoc(walletRef);
  if (!snap.exists()) return;

  const data = snap.data();

  const earnedCoins = data.pendingCoins || 0;
  const earnedRupees = data.pendingRupees || 0;

  const newCoins = (data.coins || 0) + earnedCoins;
  const newRupees = (data.rupees || 0) + earnedRupees;

  // Update wallet balance
  await updateDoc(walletRef, {
    coins: newCoins,
    rupees: newRupees,
    pendingCoins: 0,
    pendingRupees: 0,
  });

  // Update order reward status
  await updateDoc(doc(db, "orders", orderId), {
    "reward.status": "confirmed",
  });

  // Add transaction record (Coins)
  if (earnedCoins > 0) {
    await addDoc(txnRef, {
      type: "Added",
      amount: `+${earnedCoins} Coins`,
      reason: `Reward credited from Order ${orderId}`,
      date: serverTimestamp(),
    });
  }

  // Add transaction record (Rupees)
  if (earnedRupees > 0) {
    await addDoc(txnRef, {
      type: "Added",
      amount: `+₹${earnedRupees}`,
      reason: `Cashback credited from Order ${orderId}`,
      date: serverTimestamp(),
    });
  }

  console.log("✅ Reward confirmed and added to wallet + transaction logged");
}
