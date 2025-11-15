import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const updateOwnerWallet = onDocumentWritten("orders/{orderId}", async (event) => {
  const beforeData = event.data?.before?.data() || null;
  const afterData = event.data?.after?.data() || null;

  if (!afterData) return; // deleted order ignore

  const ownerId = afterData.ownerId;
  const orderType = (afterData.orderType || "").toLowerCase();
  const subtotal = Number(afterData.subtotal || 0);  // ✅ ONLY SUBTOTAL

  if (!ownerId || !orderType) return;

  const walletRef = db.collection("ownerWallet").doc(ownerId);
  const walletSnap = await walletRef.get();

  const wallet = walletSnap.exists
    ? walletSnap.data()
    : { insideTotal: 0, outsideTotal: 0, totalAmount: 0 };

  const beforeStatus = beforeData?.status || "";
  const afterStatus = afterData?.status || "";

  // 🛑 Already processed → Skip
  if (afterData.walletUpdated === true) {
    console.log("⛔ Wallet already updated. Skipping...");
    return;
  }

  // 🟢 STATUS: confirmed → Add subtotal (only once)
  if (beforeStatus !== "confirmed" && afterStatus === "confirmed") {
    console.log("✅ Adding SUBTOTAL:", subtotal);

    await walletRef.set(
      {
        insideTotal: wallet.insideTotal + (orderType === "inside" ? subtotal : 0),
        outsideTotal: wallet.outsideTotal + (orderType === "outside" ? subtotal : 0),
        totalAmount: wallet.totalAmount + subtotal, // ✅ ONLY SUBTOTAL
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Mark as processed so it doesn't double add
    await event.data?.after?.ref.set(
      { walletUpdated: true },
      { merge: true }
    );
  }

  // ❌ STATUS: cancelled → Subtotal reverse
  if (beforeStatus !== "cancelled" && afterStatus === "cancelled") {
    console.log("❌ CANCELLING ORDER, subtracting:", subtotal);

    await walletRef.set(
      {
        insideTotal: wallet.insideTotal - (orderType === "inside" ? subtotal : 0),
        outsideTotal: wallet.outsideTotal - (orderType === "outside" ? subtotal : 0),
        totalAmount: wallet.totalAmount - subtotal, // ⚠ Only subtract subtotal
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Prevent double processing
    await event.data?.after?.ref.set(
      { walletUpdated: true },
      { merge: true }
    );
  }
});
