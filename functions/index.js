import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const updateOwnerWallet = onDocumentWritten("orders/{orderId}", async (event) => {
  const beforeData = event.data?.before?.data() || {};
  const afterData = event.data?.after?.data() || {};

  if (!afterData) return; // deleted order, ignore

  const ownerId = afterData.ownerId;
  const orderType = (afterData.orderType || "").toLowerCase();
  const totalAmount = Number(afterData.subtotal || 0);

  if (!ownerId || !orderType) return;

  const walletRef = db.collection("ownerWallet").doc(ownerId);
  const walletSnap = await walletRef.get();
  const wallet = walletSnap.exists
    ? walletSnap.data()
    : { insideTotal: 0, outsideTotal: 0, totalAmount: 0 };

  const beforeStatus = beforeData.status;
  const afterStatus = afterData.status;

  // 🛑 If already processed once → ignore
  if (afterData.walletUpdated === true) {
    console.log("⛔ Already processed. Skipping...");
    return;
  }

  // 🟢 Case: status becomes confirmed first time
  if (beforeStatus !== "confirmed" && afterStatus === "confirmed") {
    console.log("✅ Adding amount for confirmed order:", totalAmount);

    await walletRef.set(
      {
        insideTotal: wallet.insideTotal + (orderType === "inside" ? totalAmount : 0),
        outsideTotal: wallet.outsideTotal + (orderType === "outside" ? totalAmount : 0),
        totalAmount: wallet.totalAmount + totalAmount,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Mark order as processed
    await event.data?.after?.ref.set(
      {
        walletUpdated: true,
      },
      { merge: true }
    );
  }

  // 🟠 Case: cancelled (optional reverse logic)
  if (beforeStatus !== "cancelled" && afterStatus === "cancelled") {
    console.log("❌ Deducting for cancelled order:", totalAmount);

    await walletRef.set(
      {
        insideTotal: wallet.insideTotal - (orderType === "inside" ? totalAmount : 0),
        outsideTotal: wallet.outsideTotal - (orderType === "outside" ? totalAmount : 0),
        totalAmount: wallet.totalAmount - totalAmount,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Mark reverse processed
    await event.data?.after?.ref.set(
      {
        walletUpdated: true,
      },
      { merge: true }
    );
  }
});
