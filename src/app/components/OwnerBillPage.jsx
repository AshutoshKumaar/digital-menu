"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function ThermalBillPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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

  const handlePrint = (orderId) => {
    const printContent = document.getElementById(orderId);
    const WinPrint = window.open("", "", "width=300,height=600");

    WinPrint.document.write(`
      <html>
        <head>
          <title>Receipt #${orderId}</title>
          <style>
            /* Thermal receipt width */
            body {
              font-family: monospace;
              width: 80mm; /* default 80mm */
              margin: 0;
              padding: 5px 2mm;
            }

            @media print {
              body {
                width: 80mm;
                margin: 0;
                padding: 0;
              }
              @page {
                size: 80mm auto;
                margin: 0;
              }
              button {
                display: none; /* hide buttons in print */
              }
            }

            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 4px 0; }
            .total-line { font-weight: bold; }
            .barcode { margin-top: 10px; text-align: center; font-size: 10px; }
            .item { display: flex; justify-content: space-between; }
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
              {/* Header */}
              <div className="center">
                <p>************************</p>
                <p>RECEIPT</p>
                <p>************************</p>
              </div>

              <div className="flex justify-between mt-1">
                <p>Terminal#1</p>
                <p>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ""}</p>
              </div>
              <div className="line"></div>

              {/* Items */}
              {order.items?.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="item">
                    <span>{item.quantity} x {item.name}</span>
                    <span>${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p>No items found</p>
              )}
              <div className="line"></div>

              {/* Totals */}
              <div className="item total-line">
                <span>TOTAL AMOUNT</span>
                <span>${order.total?.toFixed(2) ?? 0}</span>
              </div>
              <div className="item">
                <span>CASH</span>
                <span>${(order.cashPaid ?? order.total)?.toFixed(2)}</span>
              </div>
              <div className="item">
                <span>CHANGE</span>
                <span>${((order.cashPaid ?? order.total) - (order.total ?? 0)).toFixed(2)}</span>
              </div>
              <div className="line"></div>

              {/* Footer */}
              <div className="center">
                <p>******** THANK YOU! ********</p>
                <p className="barcode">||||||||||||||||||||||</p>
              </div>

              {/* Print Button */}
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
