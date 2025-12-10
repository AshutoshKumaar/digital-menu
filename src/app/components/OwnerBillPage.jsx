"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function ThermalBillPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null); // 🔵 For modal preview

  // TRACK LOGGED-IN USER
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // FETCH USER ORDERS
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

  // -------------------------------------
  // 🔵 PREMIUM PRINT FUNCTION
  // -------------------------------------
  const handlePrint = () => {
    const content = document.getElementById("bill-preview-content");

    if (!content) return alert("Nothing to print!");

    const printWindow = window.open("", "_blank", "width=300,height=600");
    const logoURL = "https://online.kfc.co.in/static/media/kfcLogo.492728c6.svg";

    printWindow.document.write(`
      <html>
      <head>
      <title>Print Bill</title>

      <style>
        body { font-family: monospace; width: 80mm; padding: 6px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 6px 0; }

        .row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 3px;
        }
        .item { width: 50%; font-weight: bold; }
        .qty { width: 15%; text-align: center; }
        .total { width: 25%; text-align: right; }

        img { max-width: 60px; margin-bottom: 4px; }

        @media print { 
            @page { size: 80mm auto; margin: 0; }
        }
      </style>

      </head>
      <body>
        ${content.innerHTML}

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 800);
          };
        </script>

      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // -------------------------------------
  // UI
  // -------------------------------------

  if (loading)
    return (
      <div className="flex flex-col items-center text-gray-600 mt-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-800 mb-4"></div>
        <p className="text-lg font-medium">Loading Orders...</p>
      </div>
    );

  if (!user)
    return (
      <p className="text-center mt-5 text-2xl">Please login to see bills.</p>
    );

  return (
    <div className="max-w-full sm:max-w-[90%] mx-auto mt-6 px-4">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Premium Thermal Bills
      </h2>

      {/* ------------------------
          PREMIUM PREVIEW MODAL
      ------------------------- */}
      {previewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-80 rounded-lg shadow-lg p-4">
            <h3 className="text-center font-bold text-lg mb-2">Bill Preview</h3>

            {/* Actual Bill Content (used for print also) */}
            <div id="bill-preview-content" className="text-xs">

              <div className="center">
                <img
                  src="https://online.kfc.co.in/static/media/kfcLogo.492728c6.svg"
                  className="w-16 mx-auto mb-2"
                />
              </div>

              <div className="center bold">OMG KFC Z-II</div>
              <div className="center">New Market Road</div>
              <div className="center">Near Parkash Talkies</div>
              <div className="center">Phone: +918210707539</div>

              <div className="line"></div>

              <p>Order Type: {previewOrder.orderType}</p>
              <p>
                Date:{" "}
                {new Date(
                  previewOrder.createdAt?.seconds * 1000
                ).toLocaleString("en-GB")}
              </p>

              <div className="line"></div>

              <div className="row bold">
                <span className="item">ITEM</span>
                <span className="qty">QTY</span>
                <span className="total">TOTAL</span>
              </div>

              {previewOrder.items?.map((item, i) => (
                <div key={i} className="row">
                  <span className="item">{item.name}</span>
                  <span className="qty">{item.quantity}</span>
                  <span className="total">₹{item.totalPrice}</span>
                </div>
              ))}

              <div className="line"></div>

              <div className="row bold">
                <span className="item">Subtotal</span>
                <span className="qty"></span>
                <span className="total">₹{previewOrder.subtotal}</span>
              </div>

              <div className="row bold">
                <span className="item">Delivery</span>
                <span className="qty"></span>
                <span className="total">₹{previewOrder.deliveryCharge}</span>
              </div>

              <div className="row bold text-lg">
                <span className="item">TOTAL</span>
                <span className="qty"></span>
                <span className="total">₹{previewOrder.total}</span>
              </div>

              <div className="line"></div>

              <div className="center bold">Thank You</div>
              <div className="center">Visit Again!</div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setPreviewOrder(null)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Close
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                🖨 Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------
              ORDERS LIST
      ------------------------- */}

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-xl">No orders found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded shadow p-3 border text-xs"
            >
              <div className="font-semibold text-sm sm:text-lg mb-2">Order Summary</div>

              <p>Order Type: {order.orderType}</p>
              <p>Total: ₹{order.total}</p>

              <div className="mt-3 flex justify-center sm:justify-end">
                <button
                  onClick={() => setPreviewOrder(order)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs"
                >
                  👁️ Preview Bill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
