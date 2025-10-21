"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Home,
  Briefcase,
  Wallet,
  User,
  PlayCircle,
  Handshake,
} from "lucide-react";

import ProfilePage from "../components/ProfilePage";
import DashboardPage from "../components/DashboardPage";
import WalletPage from "../components/WalletPage";
import WorkPage from "../components/WorkPage";
import { Josefin_Sans } from "next/font/google";
import DigitalBharatMenuLogo from "@/app/components/DigitalBharatMenuLogo";
import Paymentpartner from "@/app/components/Paymentpartner";

const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export default function StaffDashboard() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [visits, setVisits] = useState([]);
  const [earning, setEarning] = useState({ confirmed: 0, pending: 0 });
  const [activePage, setActivePage] = useState("dashboard");

  // ---------------- Auth Listener ----------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Logged in user:", currentUser.uid);
        setUser(currentUser);
      } else {
        console.log("No user logged in");
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // ---------------- Fetch Work Details ----------------
  useEffect(() => {
  if (!user) return;

  const workQuery = query(
    collection(db, "workDetails"),
    where("staffId", "==", user.uid)
  );

  const unsubscribe = onSnapshot(workQuery, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVisits(data);

    // ✅ Confirmed rewards only for wallet
    const confirmedEarning = data
      .filter((item) => item.rewardStatus === "confirmed")
      .reduce((sum, item) => sum + (item.calculatedReward || 0), 0);
      console.log("Confirmed Earning:", confirmedEarning);

    // ✅ Pending rewards separately
    const pendingEarning = data
      .filter((item) => item.rewardStatus === "pending")
      .reduce((sum, item) => sum + (item.calculatedReward || 0), 0);

    setEarning({ confirmed: confirmedEarning, pending: pendingEarning });
  });

  return () => unsubscribe();
}, [user]);


  // ---------------- Loading State ----------------
  if (user === undefined) {
    return (
      <div className={`flex justify-center items-center h-screen bg-gray-100 ${josefin.className}`}>
        <p className="text-blue-600 font-semibold text-lg animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className={`flex justify-center items-center h-screen bg-gray-100 ${josefin.className}`}>
        <p className="text-red-600 font-semibold text-lg">
          You are not logged in.
        </p>
      </div>
    );
  }

  // ---------------- Layout ----------------
  return (
    <div className={`min-h-screen bg-gray-50 pb-24 ${josefin.className}`}>
      <header className="bg-white shadow-md sticky top-0 left-0 z-50 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <DigitalBharatMenuLogo />
        </div>
      </header>

      <main className="p-5 space-y-8">
        {activePage === "dashboard" && (
          <div>
            <DashboardPage earning={earning} visits={visits} />
            <YouTubeSection user={user} />
            <Paymentpartner />
          </div>
        )}
        {activePage === "work" && <WorkPage user={user} visits={visits} />}
        {activePage === "wallet" && <WalletPage earning={earning} />}
        {activePage === "profile" && <ProfilePage user={user} />}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around py-3">
        <BottomButton
          icon={<Home className="w-5 h-5" />}
          label="Dashboard"
          active={activePage === "dashboard"}
          onClick={() => setActivePage("dashboard")}
        />
        <BottomButton
          icon={<Briefcase className="w-5 h-5" />}
          label="Work"
          active={activePage === "work"}
          onClick={() => setActivePage("work")}
        />
        <BottomButton
          icon={<Wallet className="w-5 h-5" />}
          label="Wallet"
          active={activePage === "wallet"}
          onClick={() => setActivePage("wallet")}
        />
        <BottomButton
          icon={<User className="w-5 h-5" />}
          label="Profile"
          active={activePage === "profile"}
          onClick={() => setActivePage("profile")}
        />
      </nav>
    </div>
  );
}

// ---------------- COMPONENTS ----------------
function YouTubeSection({ user }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-sm p-5 border border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <PlayCircle className="w-7 h-7 text-red-500" />
        <h2 className="text-lg font-bold text-gray-800">
          Learn & Earn with Us
        </h2>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <p className="text-gray-700 text-sm">
          Hey <span className="font-semibold text-blue-700">{user?.displayName || user?.email?.split("@")[0]}</span>,  
          let’s grow together and achieve success!
        </p>
        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
          <Handshake className="w-4 h-4" />
          Stay Connected
        </div>
      </div>

      <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-md">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/3fumBcKC6RE"
          title="How to Earn from Our Platform"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function BottomButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-sm ${active ? "text-blue-600 font-semibold" : "text-gray-500"} transition-all`}
    >
      {icon}
      {label}
    </button>
  );
}
