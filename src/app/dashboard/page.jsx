"use client";
import { useState, useEffect } from "react";
import { auth } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import DashboardClient from "@/app/components/DashboardClient";
import { Josefin_Sans } from "next/font/google";
import Footer from "@/app/components/Footer";
// 

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function DashboardPage() {
  useFCM();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        {/* Loading Text */}
        <p className="mt-4 text-lg font-medium text-gray-600">Loading, please wait...</p>
      </div>
    );
  }

  return (
     <div className={`${josefinSans.className} flex flex-col min-h-screen`}>
      <div className="flex-grow">
        <DashboardClient />
      </div>
      <Footer />
    </div>
  );
}
