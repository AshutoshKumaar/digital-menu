"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function CheckoutClient({ ownerId }) {
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    async function fetchOwner() {
      const docSnap = await getDoc(doc(db, "owners", ownerId));
      if (docSnap.exists()) setOwner(docSnap.data());
    }
    if (ownerId) fetchOwner();
  }, [ownerId]);

  if (!owner) return <p>Loading...</p>;

  return (
    <div>
      <h1>Checkout for {owner.restaurantName}</h1>
      <p>Contact: {owner.ownerMobile}</p>
      {/* Rest of checkout form */}
    </div>
  );
}
