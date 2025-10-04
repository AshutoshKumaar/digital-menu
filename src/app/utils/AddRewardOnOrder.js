import { db } from "@/app/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getUserId } from "../utils/getUserId";

// Add pending reward on order placement
export async function addRewardOnOrder(orderId) {
  const userId = getUserId();
  const walletRef = doc(db, "users", userId, "wallet", "balance");

  // Fetch wallet
  const snap = await getDoc(walletRef);

  let coins = Math.floor(Math.random() * 20) + 1; // coins always 1–20
  let rupees = 0;
  const rand = Math.random();

  // First-time order bonus logic
  const userOrdersSnap = await getDoc(doc(db, "users", userId));
  const isFirstOrder = !userOrdersSnap.exists() || (userOrdersSnap.data()?.firstOrderDone !== true);

  if (isFirstOrder) {
    rupees = Math.floor(Math.random() * 11) + 10; // 10–20 rupees
  } else if (rand < 0.30) {
    rupees = Math.floor(Math.random() * 5) + 1;
  } else if (rand < 0.70) {
    rupees = Math.floor(Math.random() * 6) + 5;
  } else if (rand < 0.95) {
    rupees = 0;
  } else {
    rupees = Math.floor(Math.random() * 41) + 10;
  }

  // Update pending rewards in wallet
  if (snap.exists()) {
    const data = snap.data();
    await updateDoc(walletRef, {
      pendingCoins: (data.pendingCoins || 0) + coins,
      pendingRupees: (data.pendingRupees || 0) + rupees,
    });
  } else {
    await setDoc(walletRef, {
      coins: 0,
      rupees: 0,
      pendingCoins: coins,
      pendingRupees: rupees,
    });
  }

  // Save reward in order as pending
  await updateDoc(doc(db, "orders", orderId), {
    reward: { coins, rupees, status: "pending" },
    firstOrderApplied: isFirstOrder,
  });

  return { coins, rupees };
}
