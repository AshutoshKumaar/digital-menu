"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getUserId } from "@/app/utils/getUserId";
import PhoneLinkModal from "@/app/components/PhoneLinkModal"; // ✅ added
import BottomNav from "@/app/components/FixBottom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mooli } from "next/font/google";

const mooli = Mooli({ subsets: ["latin"], weight: ["400"] });

export default function UserOrdersPage({ params }) {
  const { id: ownerId } = React.use(params);
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [userId, setUserId] = useState(null);

  // ✅ Fetch user orders from Firestore
  const fetchOrders = async (uid) => {
    console.log("Fetching orders for user:", uid);
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("userId", "==", uid), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().timestamp?.toDate()?.toLocaleDateString() || "",
      }));
      setOrders(data);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  console.log("User Orders Rendered", { userId, orders });

  // ✅ Check login status
  useEffect(() => {
    async function init() {
      setLoading(true);
      const userResult = await getUserId();

      if (!userResult || userResult.isAnonymous) {
        // Not logged in → show OTP modal
        setShowPhoneModal(true);
        setLoading(false);
        return;
      }

      setUserId(userResult.uid);
      fetchOrders(userResult.uid);
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center ${mooli.className}`}>
        Loading Orders...
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${mooli.className}`}>
      {/* ✅ Show login modal if not logged in */}
      <PhoneLinkModal
        show={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 bg-gray-900 border-b border-gray-800 py-4 px-6 z-10">
        <h1 className="text-3xl font-bold text-yellow-400">My Orders</h1>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 space-y-6">
        {orders.length === 0 ? (
          <div className="text-center mt-20">
            <Image
              src="/empty-order.png"
              alt="No Orders"
              width={120}
              height={120}
              className="mx-auto mb-4 opacity-70"
            />
            <h2 className="text-xl text-gray-300 mb-2">No Orders Yet</h2>
            <p className="text-gray-500">Place your first order and it will appear here after login.</p>
            <button
              onClick={() => router.push(`/restaurant/${ownerId}`)}
              className="mt-6 bg-yellow-500 text-gray-900 px-5 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-800 rounded-2xl p-4 shadow-lg hover:ring-2 hover:ring-yellow-400/40 transition"
            >
              <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-3">
                <p className="text-gray-400 text-sm">Order ID: {order.id.slice(0, 8)}</p>
                <span className="text-yellow-400 text-sm">{order.date}</span>
              </div>

              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <p className="text-gray-300">{item.name}</p>
                    <p className="text-gray-400">
                      {item.qty} × ₹{item.price}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-gray-700 pt-3">
                <p className="text-gray-300">Total</p>
                <p className="text-yellow-400 font-bold text-lg">₹{order.total}</p>
              </div>
            </div>
          ))
        )}
      </main>

      {/* FOOTER NAV */}
      <BottomNav ownerId={ownerId} cart={[]} />
    </div>
  );
}
