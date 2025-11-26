"use client";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { useEffect, useState } from "react";

export default function OwnerOrderPermissions() {
  const [permissions, setPermissions] = useState({
    inside: true,
    outside: false,
  });

  const [ownerId, setOwnerId] = useState(null);

  // Load Owner & Permissions
  useEffect(() => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;
    setOwnerId(uid);

    const fetchPermissions = async () => {
      const docRef = doc(db, "owners", uid, "settings", "orderPermissions");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPermissions(docSnap.data());
      } else {
        // Default settings create karo
        await setDoc(docRef, {
          inside: true,
          outside: false,
        });
      }
    };

    fetchPermissions();
  }, []);

  // Toggle permission function
  const togglePermission = async (type) => {
    if (!ownerId) return;

    const updated = { ...permissions, [type]: !permissions[type] };
    setPermissions(updated);

    const docRef = doc(db, "owners", ownerId, "settings", "orderPermissions");
    await updateDoc(docRef, updated);
  };

  return (
    <div className="p-6 space-y-6  text-gray-400 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400 tracking-wide">
        Order Permissions
      </h2>

      {/* PERMISSION CARD */}
      <div className="space-y-5">
        {/* INSIDE ORDER */}
        <PermissionToggle
          title="Inside Ordering"
          active={permissions.inside}
          onToggle={() => togglePermission("inside")}
        />

        {/* OUTSIDE ORDER */}
        <PermissionToggle
          title="Outside / Delivery"
          active={permissions.outside}
          onToggle={() => togglePermission("outside")}
        />
      </div>

      <p className="text-gray-400 text-sm mt-6">
        Choose which order types your restaurant will accept. Customers will
        only see allowed options.
      </p>
    </div>
  );
}

// Component For Reusability
function PermissionToggle({ title, active, onToggle }) {
  return (
    <div className="p-4 rounded-xl border border-gray-700 shadow-lg flex items-center justify-between">
      <span className="text-lg font-medium">{title}</span>

      {/* Animated Toggle Button */}
      <button
        onClick={onToggle}
        className={`relative w-16 h-8 flex items-center rounded-full transition-all duration-300
          ${active ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}
        `}
      >
        <span
          className={`absolute w-7 h-7 bg-white rounded-full shadow transition-all duration-300 transform
            ${active ? "translate-x-8" : "translate-x-1"}
          `}
        ></span>
      </button>
    </div>
  );
}
