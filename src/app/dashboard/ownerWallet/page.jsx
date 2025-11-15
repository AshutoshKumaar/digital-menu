"use client";

import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "../../firebase/config";
import Footer from "@/app/components/Footer";
import { ArrowLeft, LogOut, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { Mooli } from "next/font/google";

// Load Mooli font
const mooli = Mooli({
  weight: "400",
  subsets: ["latin"],
});

export default function OwnerWallet() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Track user login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  // Fetch wallet data
  useEffect(() => {
    if (!user) return;

    const walletRef = doc(db, "ownerWallet", user.uid);

    const unsub = onSnapshot(
      walletRef,
      (snap) => {
        if (snap.exists()) {
          setWallet(snap.data());
        } else {
          setWallet(null);
        }
        setLoading(false);
      },
      (err) => {
        console.log("Wallet Fetch Error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading)
    return (
      <div className="flex flex-col items-center mt-10 text-gray-600">
        <div className="animate-spin h-16 w-16 border-t-4 border-gray-800 rounded-full"></div>
        <p className="mt-2 text-lg">Loading Wallet...</p>
      </div>
    );

  if (!user)
    return (
      <p className="text-center mt-5 text-xl font-medium">
        Please login to view wallet.
      </p>
    );

  if (!wallet)
    return (
      <div className="text-center mt-10 text-gray-500">
        <p className="text-xl font-medium">No wallet found.</p>
      </div>
    );

  return (
    <div className={`${mooli.className} min-h-screen bg-gradient-to-br from-gray-100 to-gray-200`}>

      {/* ----------- NAVBAR ----------- */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-md sticky top-0 z-50">

        {/* Back Button Circular */}
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition shadow-sm"
        >
          <ArrowLeft size={22} />
        </button>

        <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">
          <Wallet size={26} className="text-green-600" />
          Owner Wallet
        </h1>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow hover:bg-red-600 transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </nav>

      {/* ----------- WALLET CARD UI ----------- */}
      <div className="max-w-lg mx-auto mt-10 p-4">

        <div className="bg-white rounded-3xl shadow-xl p-7 border border-gray-100 transform transition-all hover:scale-[1.01]">

          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            💼 Wallet Summary
          </h2>

          {/* Balance Card */}
          <div className="mb-6 text-center bg-green-50 p-5 rounded-2xl shadow-inner">
            <p className="text-gray-700 text-lg">Available Balance</p>
            <h3 className="text-5xl font-extrabold text-green-600 mt-2">
              ₹ {wallet.totalAmount?.toFixed(2) || 0}
            </h3>
          </div>

          {/* Inside Orders */}
          <div className="mt-6 border-t pt-4 flex justify-between">
            <p className="text-gray-700 text-md font-medium">Inside Orders Total</p>
            <p className="text-xl font-semibold text-gray-900">
              ₹ {wallet.insideTotal || 0}
            </p>
          </div>

          {/* Outside Orders */}
          <div className="mt-4 flex justify-between">
            <p className="text-gray-700 text-md font-medium">Outside Orders Total</p>
            <p className="text-xl font-semibold text-gray-900">
              ₹ {wallet.outsideTotal || 0}
            </p>
          </div>

          {/* Updated Time */}
          <div className="mt-6 text-sm text-gray-500 text-center">
            Last updated: {wallet.updatedAt || "—"}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
