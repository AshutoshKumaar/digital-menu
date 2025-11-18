"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, BadgeInfo } from "lucide-react";
import { useRouter } from "next/navigation";
import { Mooli } from "next/font/google";

const mooli = Mooli({
  weight: "400",
  subsets: ["latin"],
});

export default function OwnerWithdrawalRequests() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Track Login User
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Fetch withdrawal requests
  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "withdrawRequests");

    const q = query(
      ref,
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setRequests(arr);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (!user)
    return (
      <p className="text-center mt-10 text-xl">Please login to continue.</p>
    );

//   console.log("Requests:", requests);

  return (
    <div className={`${mooli.className} min-h-screen bg-gray-100`}>
      {/* CONTENT */}
      <div className="max-w-xl mx-auto mt-6 px-4 pb-10">
        <h2 className="text-center text-2xl font-bold mb-4 text-gray-800">
          Your Withdrawal Requests
        </h2>

        {loading ? (
          <div className="text-center mt-10">
            <div className="animate-spin h-10 w-10 border-4 border-t-gray-800 rounded-full mx-auto"></div>
            <p className="mt-3 text-gray-500">Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No withdrawal requests found.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl shadow border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-900">
                    ₹ {req.amount}
                  </p>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium 
                      ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {req.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  {req.note
                    ? req.note
                    : "We are processing your payment. Within 24 hours your money will be reflected in your account. Thank you for waiting."}
                </p>

                <p className="text-xs text-gray-500 mt-3">
                  Requested on: {req.createdAt}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
