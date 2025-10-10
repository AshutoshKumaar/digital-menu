"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Home, Briefcase, Wallet, User } from "lucide-react";

import ProfilePage from "../components/ProfilePage";
import DashboardPage from "../components/DashboardPage";
import WalletPage from "../components/WalletPage";
import WorkPage from "../components/WorkPage";
import {Josefin_Sans} from 'next/font/google'


const josefin = Josefin_Sans({ subsets: ['latin'], weight: ['400', '700'] })

export default function StaffDashboard() {
  const [user, setUser] = useState(undefined); // undefined for loading state
  const [visits, setVisits] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const [plan, setPlan] = useState("");
  const [earning, setEarning] = useState(0);
  const [activePage, setActivePage] = useState("dashboard");

  // ---------------- Listen to Auth ----------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);
  console.log("Current User:", user);

  // ---------------- Fetch Staff Visits ----------------
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "workDetails"), where("staffId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setVisits(data);
      const total = data.reduce((sum, item) => sum + (item.earning || 0), 0);
      setEarning(total);
    });
    return () => unsub();
  }, [user]);

  // ---------------- Add Visit ----------------
  const handleAddVisit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("User not loaded yet. Please wait...");
      return;
    }

    let commission = 0;
    if (plan === "basic") commission = 50;
    else if (plan === "premium") commission = 100;
    else if (plan === "enterprise") commission = 200;

    const totalEarning = 10 + commission;

    await addDoc(collection(db, "workDetails"), {
      staffId: user.uid,
      restaurant,
      plan,
      earning: totalEarning,
      timestamp: serverTimestamp(),
    });

    setRestaurant("");
    setPlan("");
  };

  // ---------------- Loading Screen ----------------
  if (user === undefined) {
    return (
      <div className={`flex justify-center items-center h-screen bg-gray-100 ${josefin.className}`}>
        <p className="text-blue-600 font-semibold text-lg animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // ---------------- UI Layout ----------------
  return (
    <div className={`min-h-screen bg-gray-100 pb-24 p-5 ${josefin.className}`}>
      <h1 className="text-2xl font-bold mb-5">
        👋 Hello, <span className="text-blue-600">{user?.email || "Guest"}</span>
      </h1>

      {activePage === "dashboard" && <DashboardPage earning={earning} />}
      {activePage === "work" && (
        <WorkPage
          user={user}
        />
      )}
      {activePage === "wallet" && <WalletPage earning={earning} />}
      {activePage === "profile" && <ProfilePage user={user} />}

      {/* ---------------- Bottom Navbar ---------------- */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around py-3">
        <button
          onClick={() => setActivePage("dashboard")}
          className={`flex flex-col items-center text-sm ${
            activePage === "dashboard" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <Home className="w-5 h-5" />
          Dashboard
        </button>

        <button
          onClick={() => setActivePage("work")}
          className={`flex flex-col items-center text-sm ${
            activePage === "work" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <Briefcase className="w-5 h-5" />
          Work
        </button>

        <button
          onClick={() => setActivePage("wallet")}
          className={`flex flex-col items-center text-sm ${
            activePage === "wallet" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <Wallet className="w-5 h-5" />
          Wallet
        </button>

        <button
          onClick={() => setActivePage("profile")}
          className={`flex flex-col items-center text-sm ${
            activePage === "profile" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <User className="w-5 h-5" />
          Profile
        </button>
      </div>
    </div>
  );
}
