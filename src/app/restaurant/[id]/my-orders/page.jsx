"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import BottomNav from "@/app/components/FixBottom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mooli } from "next/font/google";
import { useTranslation } from "@/app/i18n/LanguageContext";

const mooli = Mooli({ subsets: ["latin"], weight: ["400"] });

export default function UserOrdersPage({ params }) {
  const { id: ownerId } = React.use(params);
  const router = useRouter();
  const { t } = useTranslation(); // 🚀 Translation hook

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Load userId
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      setLoading(false);
      return;
    }
    setUserId(storedUserId);
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => {
          const d = doc.data();
          const createdAtDate = d.createdAt?.toDate() || new Date();

          return {
            id: doc.id,
            ...d,
            date: createdAtDate.toLocaleDateString(),
          };
        });

        setOrders(data);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center ${mooli.className}`}
      >
        {t("loading_orders")}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${mooli.className}`}>
      <header className="sticky top-0 bg-gray-900 border-b-2 py-4 px-6 z-10 border-yellow-400">
        <h1 className="text-3xl font-bold text-yellow-400">
          {t("my_orders")}
        </h1>
      </header>

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
            <h2 className="text-xl text-gray-300 mb-2">{t("no_orders_title")}</h2>
            <p className="text-gray-500">{t("no_orders_subtext")}</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-800 rounded-2xl p-4 shadow-lg hover:ring-2 hover:ring-yellow-400/40 transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-3">
                <p className="text-gray-400 text-sm">
                  {t("order_id")}: {order.id.slice(0, 8)}
                </p>
                <span className="text-yellow-400 text-sm">{order.date}</span>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <p className="text-gray-300">{item.name}</p>
                    <p className="text-gray-400">
                      {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* Delivery Charge */}
              <div className="flex justify-between mt-2 text-gray-400">
                <span>{t("delivery_charge")}</span>
                <span>₹{order.deliveryCharge || 0}</span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mt-4 border-t border-gray-700 pt-3">
                <p className="text-gray-300">{t("total")}</p>
                <p className="text-yellow-400 font-bold text-lg">
                  ₹{order.total}
                </p>
              </div>

              {/* Status */}
              <p className="mt-3 text-yellow-400 font-semibold capitalize">
                {t("status")}: {order.status || "Preparing"}
              </p>
            </div>
          ))
        )}
      </main>

      <BottomNav ownerId={ownerId} cart={[]} />
    </div>
  );
}
