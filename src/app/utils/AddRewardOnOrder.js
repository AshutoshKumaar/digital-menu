import { db } from "@/app/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getUserId } from "../utils/getUserId";

/**
 * Adds pending rewards (coins and rupees) for a new order.
 * @param {string} orderId - ID of the order.
 * @param {number} coins - Coins to add.
 * @param {number} rupees - Rupees to add.
 */
export async function addRewardOnOrder(orderId, coins = 10, rupees = 10) {
  try {
    const userIdRaw = await getUserId();
    if (!userIdRaw) throw new Error("User not logged in");

    const userId = String(userIdRaw);

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

    const rewardRef = doc(db, "users", userId, "rewards", String(orderId));
    await setDoc(rewardRef, { orderId, coins, rupees, status: "pending", createdAt: new Date() });

    console.log("✅ Reward added as pending successfully");

    // Return the reward for frontend use
    return { coins, rupees };
  } catch (error) {
    console.error("❌ Error in addRewardOnOrder:", error);
    return { coins: 0, rupees: 0 };
  }
}