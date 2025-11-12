"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function ThermalBillPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 🔹 Track logged-in user
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 🔹 Fetch user-specific orders
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

  // 🔹 Print function
  const handlePrint = (orderId) => {
    const printContent = document.getElementById(orderId);
    const WinPrint = window.open("", "", "width=300,height=600");

    WinPrint.document.write(`
      <html>
        <head>
          <title>Receipt #${orderId}</title>
          <style>
            body {
              font-family: monospace;
              width: 80mm;
              margin: 0;
              padding: 4px;
            }

            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              button { display: none; }
            }

            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #000; margin: 4px 0; }
            .item { display: flex; justify-content: space-between; }
            .total-line { font-weight: bold; }
            .small { font-size: 11px; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  if (loading)
    return (
      <div className="flex flex-col items-center text-gray-600 mt-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-800 mb-4"></div>
        <p className="text-lg font-medium">Loading Orders...</p>
      </div>
    );

  if (!user)
    return <p className="text-center mt-5 text-2xl">Please login to see bills.</p>;

  return (
    <div className="max-w-full sm:max-w-md mx-auto mt-6 px-4">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Thermal Receipts
      </h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-xl">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              id={order.id}
              className="bg-white rounded shadow p-3 border text-xs"
            >
              {/* ---------- HEADER ---------- */}
              <div className="text-center bold">
                <p className="bold text-base">OMG KFC Z-II</p>
                <p className="small">Address: New Market Road</p>
                <p className="small">Near Parkash Talkies</p>
                <p className="small">Phone: +918210707539</p>
                <p className="small">web: kfczaika@gmail.com</p>
              </div>
              <div className="border-b-2 my-2"></div>

              {/* ---------- ORDER DETAILS ---------- */}
              <div className="">
                <p>Bill No: default</p>
                <p>Order type: {order.orderType}</p>
              </div>
              <div className="border-b-2 my-2"></div>

              {/* ---------- ITEMS LIST ---------- */}
              {/* ---------- ITEMS LIST ---------- */}
{order.items?.length > 0 ? (
  <div>
    <div className="flex justify-between font-semibold border-b border-dashed border-black pb-1 mb-1 text-xs">
      <span style={{ width: "20%", textAlign: "left" }}>QTY</span>
      <span style={{ width: "60%", textAlign: "center" }}>ITEM</span>
      <span style={{ width: "20%", textAlign: "right" }}>PRICE</span>
    </div>

    {order.items.map((item, idx) => (
      <div
        key={idx}
        className="flex justify-between small border-b border-dashed border-black py-0.5"
        style={{ fontSize: "12px", marginBottom: "2px" }}
      >
        <span style={{ width: "20%", textAlign: "left" }}>{item.quantity}</span>
        <span style={{ width: "60%", textAlign: "center" }}>{item.name}</span>
        <span style={{ width: "20%", textAlign: "right" }}>
          ₹{item.totalPrice?.toFixed(2) ?? 0}
        </span>
      </div>
    ))}
  </div>
) : (
  <p className="small">No items found</p>
)}

              <div className="line my-2"></div>

              {/* ---------- TOTALS ---------- */}
              <div className="text-right">
                <span>Subtotal :- </span>
                <span>&nbsp;₹ &nbsp;{order.subtotal?.toFixed(2) ?? 0}</span>
              </div>
             <div className="text-right border-b border-dashed border-black py-0.5 mb-1">
                  <span>Delivery Charge&nbsp;:-</span>
                  <span>&nbsp;₹&nbsp;{order.deliveryCharge?.toFixed(2) ?? 0}</span>
                </div>
              <div className="text-right">
                <span>Total&nbsp;:-</span>
                <span>&nbsp;₹&nbsp;{order.total?.toFixed(2) ?? 0}</span>
              </div>

              

              <div className="border-b border-dashed border-black mb-1 py-0.5"></div>

              {/* ---------- FOOTER ---------- */}
              <div className="text-center my-2">
                <p className="text-sm font-bold">Thank You</p>
                <p className="text-[10px]">Visit Again !</p>
              </div>

              {/* ---------- PRINT BUTTON ---------- */}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => handlePrint(order.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                >
                  🖨 Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
