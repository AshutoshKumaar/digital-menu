import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const createOwnerWallet = onDocumentCreated("orders/{orderId}", async (event) => {
  const orderData = event.data.data();
  const ownerId = orderData.ownerId;
  const totalAmount = orderData.totalAmount || 0;
  const type = orderData.type; // "inside" or "outside"

  const walletRef = db.collection("ownerWallet").doc(ownerId);
  const walletSnap = await walletRef.get();

  if (!walletSnap.exists) {
    await walletRef.set({
      insideTotal: type === "inside" ? totalAmount : 0,
      outsideTotal: type === "outside" ? totalAmount : 0,
      totalAmount: totalAmount,
      updatedAt: new Date().toISOString(),
    });
  } else {
    const wallet = walletSnap.data();
    await walletRef.update({
      insideTotal: wallet.insideTotal + (type === "inside" ? totalAmount : 0),
      outsideTotal: wallet.outsideTotal + (type === "outside" ? totalAmount : 0),
      totalAmount: wallet.totalAmount + totalAmount,
      updatedAt: new Date().toISOString(),
    });
  }

  console.log(`✅ Wallet updated for owner: ${ownerId}`);
});
