"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { updateRewardOnOrderConfirm } from "../utils/updateRewardOnOrderConfirm";
import { deductRewardOnOrderCancel } from "../utils/deductRewardOnOrderCancel";

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const ordersQuery = query(
      collection(db, "orders"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateOrderStatus = async (orderId, status, userId) => {
    try {
      if (!userId) {
        console.error("Cannot update reward: Customer userId is missing.");
      }

      const orderRef = doc(db, "orders", orderId);

      await updateDoc(orderRef, { status });

      if (userId) {
        if (status === "confirmed") {
          await updateRewardOnOrderConfirm(orderId, userId);
          console.log(`✅ Order ${orderId} confirmed. Rewards transferred.`);
        } else if (status === "cancelled") {
          await deductRewardOnOrderCancel(orderId, userId);
          console.log(`❌ Order ${orderId} cancelled. Pending rewards removed.`);
        }
      }
    } catch (error) {
      console.error(`Error processing status update for order ${orderId}:`, error);
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

  if (loading)
    return (
      <div className="flex flex-col items-center text-gray-600 mt-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-800 mb-4"></div>
        <p className="text-lg font-medium">Loading Orders...</p>
      </div>
    );

  if (!user)
    return (
      <p className="text-center mt-5 text-2xl">Please login to see orders.</p>
    );

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto mt-6 px-4">
      <h2 className="text-3xl font-semibold text-center mb-6">Owner Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-2xl">No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {orders.map((order) => {
            const subtotal = order.total ?? order.subtotal ?? 0;
            const deliveryCharge = order.deliveryCharge ?? 0;
            const finalTotal = subtotal + deliveryCharge;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-lg border p-5 flex flex-col justify-between hover:shadow-2xl transition"
              >
                {console.log("Rendering order:", order)}
                {/* Customer Info */}
                <div className="space-y-1 text-sm sm:text-base">
                  <p>
                    <strong>👤 Name:</strong> {order.fullName || "N/A"}
                  </p>
                  <p>
                    <strong>🛒 Type:</strong> {order.orderType || "N/A"}
                  </p>
                  {order.orderType === "inside" && (
                    <p>
                      <strong>📍 Table:</strong> {order.tableNumber || "N/A"}
                    </p>
                  )}
                  {order.orderType === "outside" && (
                    <div>
                       <p>
                    <strong>📞 Phone:</strong> {order.mobile || "N/A"}
                  </p>
                    <p>
                      <strong>🏠 Address:</strong> {order.address || "N/A"}
                    </p>
                    </div>
                  )}
                  <p>
                    <strong>📅 Date:</strong>{" "}
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                {/* Items */}
                <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-1">🍽 Items:</p>
                  <ul className="list-disc pl-5">
                    {order.items?.length > 0 ? (
                      order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} x {item.quantity} = ₹{item.totalPrice}
                        </li>
                      ))
                    ) : (
                      <li>No items found</li>
                    )}
                  </ul>
                  <p className="mt-1 font-bold text-green-600">
                    Delivery Charge: ₹{deliveryCharge}
                  </p>

                  {/* ✅ Delivery Charge and Final Total Added Here */}
                  <p className="mt-2 font-bold text-green-600">
                    Subtotal: ₹{subtotal}
                  </p>
                </div>

                {/* Status */}
                <div className="mt-3">
                  <span className="font-bold">📌 Status: </span>
                  <span
                    className={`capitalize px-2 py-1 rounded-full text-xs sm:text-sm ${
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

                {/* Actions */}
                <div className="mt-4 flex flex-col md:flex-row gap-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "confirmed", order.userId)
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
                      >
                        ✅ Confirm
                      </button>

                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "cancelled", order.userId)
                        }
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl text-center">
            <p className="text-lg font-bold">
              Are you sure you want to delete this order?
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-md"
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
