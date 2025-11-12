import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const updateOwnerWallet = onDocumentWritten("orders/{orderId}", async (event) => {
  const beforeData = event.data?.before?.data() || {};
  const afterData = event.data?.after?.data() || {};

  // If no data (e.g., deleted document), exit
  if (!afterData && !beforeData) return;

  const ownerId = afterData?.ownerId || beforeData?.ownerId;
  const orderType = (afterData?.orderType || beforeData?.orderType || "").toLowerCase();
  const totalAmount = Number(afterData?.subtotal ?? beforeData?.subtotal ?? 0);

  if (!ownerId || !orderType) {
    console.log("⚠️ Missing ownerId/orderType, skipping update.");
    return;
  }

  const walletRef = db.collection("ownerWallet").doc(ownerId);
  const walletSnap = await walletRef.get();
  const wallet = walletSnap.exists ? walletSnap.data() : { insideTotal: 0, outsideTotal: 0, totalAmount: 0 };

  // Detect order status changes
  const beforeStatus = beforeData?.status;
  const afterStatus = afterData?.status;

  // Case 1️⃣: Order Confirmed → Add Amount
  if (beforeStatus !== "confirmed" && afterStatus === "confirmed") {
    console.log(`✅ Order confirmed: +${totalAmount}`);
    await walletRef.set(
      {
        insideTotal: wallet.insideTotal + (orderType === "inside" ? totalAmount : 0),
        outsideTotal: wallet.outsideTotal + (orderType === "outside" ? totalAmount : 0),
        totalAmount: wallet.totalAmount + totalAmount,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  // Case 2️⃣: Order Cancelled → Deduct Amount
  if (beforeStatus !== "cancelled" && afterStatus === "cancelled") {
    console.log(`❌ Order cancelled: -${totalAmount}`);
    await walletRef.set(
      {
        insideTotal: wallet.insideTotal - (orderType === "inside" ? totalAmount : 0),
        outsideTotal: wallet.outsideTotal - (orderType === "outside" ? totalAmount : 0),
        totalAmount: wallet.totalAmount - totalAmount,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  console.log(`💰 Wallet updated for owner: ${ownerId}`);
});
