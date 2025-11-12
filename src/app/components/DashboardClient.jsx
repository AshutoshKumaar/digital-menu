"use client";
import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import AddMenuItem from "../components/AddMenuItem";
import DashboardTabs from "./DashboardTabs";
import DashboardHeader from "./Dashboardheader";

export default function DashboardClient() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, [router]);

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Header */}
      <DashboardHeader userId={user.uid} />

      {/* ✅ Main Dashboard Content */}
      <div className="p-6 max-w-5xl mx-auto">
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Add Menu Item</h2>
          <AddMenuItem ownerId={user.uid} />
        </section>

        <section className="mb-6">
          <DashboardTabs />
        </section>
      </div>
    </div>
  );
}
