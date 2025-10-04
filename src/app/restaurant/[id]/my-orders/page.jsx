"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Mooli } from "next/font/google";
import { useCart } from "@/app/hooks/CartContext";
import BottomNav from "@/app/components/FixBottom";
import React from "react";
const mooli = Mooli({ subsets: ["latin"], weight: ["400"] });

// Helper: fetch userId from localStorage (guest order ke liye)
const getUserId = () => {
  return localStorage.getItem("userId");
};

export default function UserOrdersPage({ params }) {
  const { id: ownerId } = React.use(params);
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart } = useCart();
  // console.log("UserOrdersPage rendered with userId:", orders);

  useEffect(() => {
    const uid = getUserId();
    if (!uid) {
      setLoading(false);
      return;
    }
    setUserId(uid);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        fetchedOrders.sort((a, b) =>
          b.createdAt?.toDate ? b.createdAt.toDate() - a.createdAt.toDate() : 0
        );
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  if (loading)
    return (
      <div
        className={`${mooli.className} flex justify-center items-center h-screen bg-black`}
      >
        <div className="flex flex-col items-center">
          <div className="loader border-4 border-yellow-400 border-t-transparent rounded-full w-12 h-12 animate-spin mb-4"></div>
          <p className="text-yellow-400 text-xl font-bold animate-pulse">
            Loading your orders...
          </p>
        </div>
      </div>
    );

  if (!userId)
    return (
      <div
        className={`relative flex flex-col items-center justify-center min-h-screen bg-black px-4 ${mooli.className}`}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-3 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
        >
          ← Back
        </button>
        <p className="text-yellow-400 text-base sm:text-lg md:text-xl font-bold text-center max-w-md leading-relaxed">
          User not found. Please login or set your userId.
        </p>
      </div>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "confirmed":
        return "text-green-400";
      case "canceled":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  return (
    <div
      className={`p-4 max-w-full min-h-screen bg-black font-mooli text-yellow-400 relative ${mooli.className}`}
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 px-3 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold my-10 text-center pt-3">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-lg mt-10">No orders yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order, idx) => (
            <div
              key={order.id || idx}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-yellow-400 rounded-2xl p-5 shadow-xl hover:shadow-yellow-500/30 hover:scale-105 transform transition-all duration-300 flex flex-col justify-between"
            >
              {/* Order Info */}
              <div className="mb-3">
                <p className="font-semibold mb-1 text-sm sm:text-base">
                  <span className="text-yellow-500">📅 Order Date:</span>{" "}
                  {order.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleString()
                    : "N/A"}
                </p>
                <p className="text-sm sm:text-base">
                  <span className="text-yellow-500">🛒 Order Type:</span>{" "}
                  {order.orderType || "N/A"}
                </p>
              </div>

              {/* Inside Order */}
              {order.orderType === "inside" && (
                <p className="text-sm sm:text-base">
                  <span className="text-yellow-500">📍 Table Number:</span>{" "}
                  {order.tableNumber || "N/A"}
                </p>
              )}

              {/* Outside Order */}
              {order.orderType === "outside" && (
                <div className="space-y-1 text-sm sm:text-base">
                  <p>
                    <span className="text-yellow-500">🏠 Address:</span>{" "}
                    {order.address || "N/A"}
                  </p>
                  <p>
                    <span className="text-yellow-500">📏 Distance:</span>{" "}
                    {order.distance || "N/A"} km
                  </p>
                  <p>
                    <span className="text-yellow-500">💰 Delivery Charge:</span>{" "}
                    ₹{order.orderDetails?.deliveryCharge ?? "0"}
                  </p>
                </div>
              )}

              {/* Items */}
              {/* Items */}
              <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
                <p className="font-semibold text-yellow-300 mb-2">🍽 Items:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
                  {order.items?.length > 0 ? (
                    order.items.map((item, i) => (
                      <li key={i}>
                        {item.name} x {item.quantity} = ₹{item.totalPrice}
                      </li>
                    ))
                  ) : (
                    <li>No items found</li>
                  )}
                </ul>
                <p className="font-bold mt-3 text-yellow-200 text-sm sm:text-lg">
                  Total: ₹{order.total ?? order.subtotal ?? "N/A"}
                </p>
              </div>

              {/* Status */}
              <div className="mt-3">
                <span className="text-yellow-500">📌 Status:</span>{" "}
                <span
                  className={`font-semibold px-2 py-1 rounded ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status || "pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Bottom Navigation */}
      <BottomNav ownerId={ownerId} cart={cart} />

      <style jsx>{`
        .loader {
          border-top-color: transparent;
        }
      `}</style>
    </div>
  );
}
