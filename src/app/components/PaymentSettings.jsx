"use client";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { useEffect, useState } from "react";

export default function OwnerSystemToggle() {
  const [orderingEnabled, setOrderingEnabled] = useState(false);
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    setOwnerId(uid);

    const fetchStatus = async () => {
      const docRef = doc(db, "owners", uid, "settings", "systemStatus");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrderingEnabled(docSnap.data().orderingEnabled);
      } else {
        // Agar pehle save nahi hua toh default true
        await setDoc(docRef, { orderingEnabled: true });
        setOrderingEnabled(true);
      }
    };

    fetchStatus();
  }, []);

  const toggleOrdering = async () => {
    if (!ownerId) return;
    const docRef = doc(db, "owners", ownerId, "settings", "systemStatus");
    await updateDoc(docRef, { orderingEnabled: !orderingEnabled });
    setOrderingEnabled(!orderingEnabled);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Ordering System Status</h2>
      <button
        onClick={toggleOrdering}
        className={`px-4 py-2 rounded-lg font-semibold ${
          orderingEnabled ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        {orderingEnabled ? "Turn Off Orders" : "Turn On Orders"}
      </button>
      <p className="mt-2">
        {orderingEnabled
          ? "Users can order food now."
          : "Ordering is currently disabled. Users can only view the menu."}
      </p>
    </div>
  );
}
