"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {Mooli} from 'next/font/google';


const mooli = Mooli({
    subsets: ['latin'],
    weight: ['400']
})


export default function UserOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Auth state change hone par, user ko set karein
      if (!u) {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Agar user authenticated nahi hai, to aage na badhe
    if (!user) {
      setOrders([]);
      return;
    }

    const userId = user.uid;
    const ordersCollectionPath = `orders`;

    // 'orders' collection par real-time listener set karein
    const ordersQuery = query(
      collection(db, ordersCollectionPath),
      where('userId', '==', userId)
    );

    const unsubscribeSnapshot = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders = [];
      snapshot.forEach((doc) => {
        fetchedOrders.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      // Orders ko creation date ke hisaab se sort karein
      fetchedOrders.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    // Component unmount hone par listener ko clean up karein
    return () => unsubscribeSnapshot();
  }, [user]);

  if (loading)
    return (
      <div className={`${mooli.className} flex justify-center items-center h-screen bg-black`}>
        <div className="flex flex-col items-center">
          <div className="loader border-4 border-yellow-400 border-t-transparent rounded-full w-12 h-12 animate-spin mb-4"></div>
          <p className="text-yellow-400 text-xl font-bold animate-pulse">
            Loading your orders...
          </p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div
  className={`relative flex flex-col items-center justify-center min-h-screen bg-black px-4 ${mooli.className}`}
>
  {/* Back Button (Top-left on all screens) */}
  <button
    onClick={() => router.back()}
    className="absolute top-4 left-4 px-3 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
  >
    ← Back
  </button>

  {/* Message */}
  <p className="text-yellow-400 text-base sm:text-lg md:text-xl font-bold text-center max-w-md leading-relaxed">
    Please log in to view your orders.
  </p>
</div>
    );
  
  // Function to get a status-based color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'confirmed':
        return 'text-green-400';
      case 'canceled':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className={`p-4 max-w-full min-h-screen bg-black font-mooli text-yellow-400 relative ${mooli.className}`}>
      {/* Back Button */}
      <button
    onClick={() => router.back()}
    className="absolute top-4 left-4 px-3 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
  >
    ← Back
  </button>


      <h1 className="text-3xl font-bold my-10 text-center">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-lg mt-10">No orders yet.</p>
      ) : (
       <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {orders.map((order, idx) => (
    <div
      key={order.id || idx}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-yellow-400 rounded-2xl p-5 shadow-xl hover:shadow-yellow-500/30 hover:scale-105 transform transition-all duration-300 flex flex-col justify-between"
    >
      {/* Order Date */}
      <div className="mb-3">
        <p className="font-semibold mb-1 text-sm sm:text-base">
          <span className="text-yellow-500">📅 Order Date:</span>{" "}
          {order.createdAt && typeof order.createdAt.toDate === "function"
            ? order.createdAt.toDate().toLocaleString()
            : "N/A"}
        </p>
        <p className="text-sm sm:text-base">
          <span className="text-yellow-500">🛒 Order Type:</span> {order.orderType}
        </p>
      </div>

      {/* Inside Order */}
      {order.orderType === "inside" && (
        <p className="text-sm sm:text-base">
          <span className="text-yellow-500">📍 Table Number:</span> {order.tableNumber}
        </p>
      )}

      {/* Outside Order */}
      {order.orderType === "outside" && (
        <div className="space-y-1 text-sm sm:text-base">
          <p>
            <span className="text-yellow-500">🏠 Address:</span> {order.address}
          </p>
          <p>
            <span className="text-yellow-500">📏 Distance:</span> {order.distance} km
          </p>
          <p>
            <span className="text-yellow-500">💰 Delivery Charge:</span> ₹
            {order.orderDetails.deliveryCharge}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
        <p className="font-semibold text-yellow-300 mb-2">🍽 Items:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
          {order.orderDetails.items.map((item, i) => (
            <li key={i}>
              {item.name} x {item.quantity} = ₹{item.totalPrice}
            </li>
          ))}
        </ul>
        <p className="font-bold mt-3 text-yellow-200 text-sm sm:text-lg">
          Total: ₹{order.orderDetails.total}
        </p>
      </div>

      {/* Status */}
      <div className="mt-3">
        <span className="text-yellow-500">📌 Status:</span>{" "}
        <span
          className={`font-semibold px-2 py-1 rounded ${
            getStatusColor(order.status) || "bg-gray-700"
          }`}
        >
          {order.status}
        </span>
      </div>
    </div>
  ))}
</div>

      )}

      {/* Spinner Styles */}
      <style jsx>{`
        .loader {
          border-top-color: transparent;
        }
      `}</style>
    </div>
  );
}
