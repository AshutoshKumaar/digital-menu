// utils/AddRewardOnOrder.js
import { db } from "@/app/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getUserId } from "../utils/getUserId";

/**
 * Adds pending rewards (coins and rupees) for a new order using the authenticated/anonymous userId.
 * @param {string} orderId - ID of the order.
 * @param {number} coins - Coins to add.
 * @param {number} rupees - Rupees to add.
 * @returns {Promise<{coins: number, rupees: number}>} The awarded amounts.
 */
export async function addRewardOnOrder(orderId, coins = 10, rupees = 10) {
  try {
    const userIdRaw = await getUserId();
    // Safely extract UID, handling the case where getUserId returns null (SSR) or the object
    const userId = userIdRaw?.uid ? String(userIdRaw.uid) : null;
    
    if (!userId) {
      console.error("User ID missing or SSR environment.");
      return { coins: 0, rupees: 0 };
    }

    // 1. Update Wallet (Pending Balance)
    const walletRef = doc(db, "users", userId, "wallet", "balance");
    const walletSnap = await getDoc(walletRef);

    const walletData = walletSnap.exists()
      ? walletSnap.data()
      : { coins: 0, pendingCoins: 0, rupees: 0, pendingRupees: 0 };

    const updatedWallet = {
      coins: walletData.coins || 0,
      pendingCoins: (walletData.pendingCoins || 0) + coins,
      rupees: walletData.rupees || 0,
      pendingRupees: (walletData.pendingRupees || 0) + rupees,
    };

    await setDoc(walletRef, updatedWallet, { merge: true });

    // 2. Log Order-Specific Reward History
    const rewardRef = doc(db, "users", userId, "rewards", String(orderId));
    await setDoc(rewardRef, { orderId, coins, rupees, status: "pending", createdAt: new Date() });

    console.log(`✅ Reward added as pending successfully for user ${userId}.`);

    return { coins, rupees };
  } catch (error) {
    console.error("❌ Error in addRewardOnOrder:", error);
    return { coins: 0, rupees: 0 };
  }
}