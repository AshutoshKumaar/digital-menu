"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import AddMenuItem from "../components/AddMenuItem";
import DashboardTabs from "./DashboardTabs";


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

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div>
          <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Add Menu Item</h2>
        <AddMenuItem ownerId={user.uid} />
      </section>
      {/* Add a sidebar to link of  */}
      <section className="mb-6">
        <DashboardTabs />
      </section>
     
      
      

      
    </div>
  );
}
