"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    // Firebase Auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false after auth state is determined
    });

    // Firestore real-time listener for orders
    let unsubscribeFirestore = () => {};

    if (user) {
      // Use onSnapshot for real-time updates
      const ordersQuery = query(
        collection(db, "orders"),
        // The field name was changed from "restaurantId" to "ownerId" to match the security rules.
        where("ownerId", "==", user.uid)
      );

      unsubscribeFirestore = onSnapshot(ordersQuery, (querySnapshot) => {
        const ordersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersList);
        setLoading(false); // Update loading state here too
      }, (error) => {
        console.error("Error fetching orders in real-time:", error);
        setLoading(false);
      });
    } else {
      setOrders([]);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, [user]); // Re-run effect when user changes

  const updateOrderStatus = async (orderId, status) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status });
      // The onSnapshot listener will automatically update the state, so no need to manually set it.
    } catch (error) {
      console.error(`Error updating order status to ${status}:`, error);
    }
  };

  const handleDelete = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      const orderRef = doc(db, "orders", orderToDelete);
      await deleteDoc(orderRef);
      // The onSnapshot listener will automatically update the state.
      setOrderToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const cancelDelete = () => {
    setOrderToDelete(null);
    setShowDeleteModal(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center text-slate-600">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-slate-800 mb-4"></div>
      <p className="text-lg font-medium">Loading Your Orders.......</p>
    </div>
  );

  if (!user) return <p className="text-center mt-5 text-2xl">Please login to see your orders.</p>;

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto mt-6">
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">Your Orders</h2>
      <p className="text-center text-gray-600 mb-2">Logged in as: <strong>{user.email}</strong></p>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-2xl">No orders found.</p>
      ) : (
       <div
  className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-2
    gap-6
  "
>
  {orders.map((order) => (
    <div
      key={order.id}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Order Info */}
      <div className="space-y-2 text-sm sm:text-base">
        <p className="text-gray-700">
          <span className="font-bold">👤 Customer Name:</span> {order.fullName || "N/A"}
        </p>
        <p className="text-gray-700">
          <span className="font-bold">📞 Phone:</span> {order.mobile || "N/A"}
        </p>
        <p className="text-gray-700">
          <span className="font-bold">🛒 Order Type:</span>{" "}
          {order.orderType
            ? order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)
            : "N/A"}
        </p>

        {order.orderType === "outside" && (
          <p className="text-gray-700">
            <span className="font-bold">🏠 Address:</span> {order.address || "N/A"}
          </p>
        )}
        {order.orderType === "inside" && (
          <p className="text-gray-700">
            <span className="font-bold">📍 Table Number:</span> {order.tableNumber || "N/A"}
          </p>
        )}

        {/* Item Info */}
        <div className="bg-gray-50 rounded-lg p-3 mt-3">
          <p className="text-lg font-semibold text-gray-800">
            Item:{" "}
            <span className="font-normal">
              {order.orderDetails?.items?.[0]?.name || "N/A"}
            </span>
          </p>
          <p className="text-gray-600">
            Quantity: {order.orderDetails?.items?.[0]?.quantity || "N/A"}
          </p>
          <p className="text-gray-700">
            Item Price: ₹{order.orderDetails?.items?.[0]?.totalPrice || 0}
          </p>
          <p className="text-gray-700">
            Delivery Charge: ₹{order.orderDetails?.deliveryCharge || 0}
          </p>
          <p className="text-green-600 font-bold mt-1">
            Total Price: ₹{order.orderDetails?.total || 0}
          </p>
        </div>

        {/* Status */}
        <div className="mt-3">
          <span className="font-bold">📌 Status:</span>{" "}
          <span
            className={`capitalize font-semibold px-2 py-1 rounded-full text-xs sm:text-sm
              ${
                order.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        {order.status === "pending" && (
          <>
            <button
              onClick={() => updateOrderStatus(order.id, "confirmed")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg shadow-sm transition cursor-pointer"
            >
              ✅ Confirm
            </button>
            <button
              onClick={() => updateOrderStatus(order.id, "cancelled")}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg shadow-sm transition cursor-pointer"
            >
              ❌ Cancel
            </button>
          </>
        )}
        <button
          onClick={() => handleDelete(order.id)}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg shadow-sm transition cursor-pointer"
          title="Delete order"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  ))}
</div>

      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl text-black space-y-4 text-center">
            <p className="text-lg font-bold">Are you sure you want to delete this order?</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-md transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
