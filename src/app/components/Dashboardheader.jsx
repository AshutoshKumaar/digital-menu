"use client";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { useRouter } from "next/navigation";
import { Wallet, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import DigitalBharatMenuLogo from "./DigitalBharatMenuLogo";

export default function DashboardHeader({ userId }) {
  const router = useRouter();
  const [walletAmount, setWalletAmount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(doc(db, "wallets", userId), (docSnap) => {
      if (docSnap.exists()) {
        setWalletAmount(docSnap.data().balance || 0);
      } else {
        setWalletAmount(0);
      }
    });

    return () => unsub();
  }, [userId]);

  const handleWalletClick = () => {
    router.push("/wallet");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    signOut(auth);
    setMenuOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6 md:px-8 lg:px-10">
        {/* ✅ Left: Logo */}
        <div
          className="w-32 md:w-40 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <DigitalBharatMenuLogo />
        </div>

        {/* ✅ Desktop Buttons */}
        <div className="hidden sm:flex items-center space-x-4">
          {/* Wallet Button */}
          <button
            onClick={handleWalletClick}
            className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Wallet className="w-5 h-5 mr-2" />
            <span className="font-semibold">₹{walletAmount.toFixed(2)}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>

        {/* ✅ Mobile Hamburger Menu */}
        <div className="sm:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 shadow-inner flex flex-col space-y-3 px-6 py-4 animate-slideDown">
          <button
            onClick={handleWalletClick}
            className="flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Wallet className="w-5 h-5 mr-2" />
            <span className="font-semibold">₹{walletAmount.toFixed(2)}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
