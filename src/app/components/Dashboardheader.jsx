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
  const [outsideAmount, setOutsideAmount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔄 Real-time outsideTotal listener
  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(doc(db, "ownerWallet", userId), (docSnap) => {
      if (docSnap.exists()) {
        setOutsideAmount(docSnap.data().outsideTotal || 0);
      } else {
        setOutsideAmount(0);
      }
    });
    

    return () => unsub();
  }, [userId]);

  console.log("Outside Amount:", outsideAmount);

  // 🪙 Navigate to Wallet page
  const handleWalletClick = () => {
    router.push("/wallet");
    setMenuOpen(false);
  };

  // 🚪 Logout function
  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6 md:px-8 lg:px-10">
        {/* ✅ Logo Section */}
        <div
          className="w-32 md:w-40 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <DigitalBharatMenuLogo />
        </div>

        {/* ✅ Desktop Actions */}
        <div className="hidden sm:flex items-center space-x-4">
          {/* Wallet Button */}
          <button
            onClick={handleWalletClick}
            className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Wallet className="w-5 h-5 mr-2" />
            <span className="font-semibold">
              ₹{outsideAmount.toFixed(2)}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>

        {/* ✅ Mobile Menu Icon */}
        <div className="sm:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {menuOpen ? (
              <X className="w-7 h-7 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="w-7 h-7 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Dropdown Menu */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-gray-200 shadow-inner flex flex-col space-y-3 px-6 py-4">
          <button
            onClick={handleWalletClick}
            className="flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Wallet className="w-5 h-5 mr-2" />
            <span className="font-semibold">
              ₹{outsideAmount.toFixed(2)}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
