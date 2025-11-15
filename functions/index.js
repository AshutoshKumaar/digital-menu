import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const updateOwnerWallet = onDocumentWritten("orders/{orderId}", async (event) => {
  const beforeSnap = event.data.before;
  const afterSnap = event.data.after;

  const beforeData = beforeSnap.exists ? beforeSnap.data() : null;
  const afterData = afterSnap.data();

  if (!afterData) return;

  const ownerId = afterData.ownerId;
  const orderType = (afterData.orderType || "").toLowerCase();
  const subtotal = Number(afterData.subtotal || 0); // ALWAYS USE SUBTOTAL ONLY

  if (!ownerId || !orderType || subtotal <= 0) return;

  const walletRef = db.collection("ownerWallet").doc(ownerId);

  const alreadyAdded = !!afterData.alreadyAdded;
  const cancelProcessed = !!afterData.cancelProcessed;

  // Update wallet helper
  const updateWallet = async (delta) => {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(walletRef);
      const wallet = snap.exists
        ? snap.data()
        : { insideTotal: 0, outsideTotal: 0, totalAmount: 0 };

      tx.set(
        walletRef, 
        {
          insideTotal: (wallet.insideTotal || 0) + (orderType === "inside" ? delta : 0),
          outsideTotal: (wallet.outsideTotal || 0) + (orderType === "outside" ? delta : 0),
          totalAmount: (wallet.totalAmount || 0) + delta,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    });
  };

  // ============================
  // 1) CREATE — Add subtotal ONCE
  // ============================
  const isCreate = beforeSnap.exists === false;

  if (isCreate && !alreadyAdded) {
    console.log("🟢 ORDER CREATED — ADD SUBTOTAL:", subtotal);

    await updateWallet(subtotal);

    await afterSnap.ref.set({ alreadyAdded: true }, { merge: true });

    return;
  }

  // ============================
  // 2) CONFIRMED — No wallet change
  // ============================
  const beforeStatus = beforeData?.status;
  const afterStatus = afterData.status;

  if (beforeStatus !== "confirmed" && afterStatus === "confirmed") {
    console.log("🟡 Confirm — No wallet action");
    return;
  }

  // ============================
  // 3) CANCELLED — subtract ONCE
  // ============================
  if (beforeStatus !== "cancelled" && afterStatus === "cancelled") {
    if (!alreadyAdded) {
      console.log("⚪ Cancel but not added originally — Skip");
      return;
    }

    if (cancelProcessed) {
      console.log("⛔ Cancel already processed — Skip");
      return;
    }

    console.log("🔴 ORDER CANCELLED — MINUS SUBTOTAL:", subtotal);

    await updateWallet(-subtotal);

    await afterSnap.ref.set({ cancelProcessed: true }, { merge: true });

    return;
  }

  console.log("⚪ No wallet update needed");
});
