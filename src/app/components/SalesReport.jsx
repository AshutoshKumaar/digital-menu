"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/config";

export default function SalesReport() {
  const [user, setUser] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "orders"), where("ownerId", "==", user.uid));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSalesData(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // PROCESS SALES DATA
  const dailySales = salesData.reduce((acc, order) => {
    const dateObj = order.createdAt?.toDate?.();
    const formattedDate = dateObj
      ? dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "Unknown";

    if (!acc[formattedDate]) {
      acc[formattedDate] = {
        inside: 0,
        outside: 0,
        cancelled: 0,
        total: 0,
        countConfirmed: 0,
        countCancelled: 0,
      };
    }

    const subtotal = order.subtotal ?? 0;

    // ===========================
    // CANCELLED ORDER — NO CHANGE IN TOTAL
    // ===========================
    if (order.status === "cancelled") {
      const negative = -Math.abs(subtotal);

      acc[formattedDate].cancelled += negative;
      // ⛔ TOTAL SHOULD NOT CHANGE
      // acc[formattedDate].total += negative;  // removed

      acc[formattedDate].countCancelled += 1;

      return acc;
    }

    // ===========================
    // CONFIRMED ORDERS
    // ===========================
    if (order.orderType === "inside") {
      acc[formattedDate].inside += subtotal;
    } else {
      acc[formattedDate].outside += subtotal;
    }

    // total only adds confirmed subtotal
    acc[formattedDate].total += subtotal;
    acc[formattedDate].countConfirmed += 1;

    return acc;
  }, {});

  if (loading)
    return (
      <div className="flex flex-col items-center mt-10 text-gray-600">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-800 mb-4"></div>
        <p className="text-lg font-medium">Loading Sales Report...</p>
      </div>
    );

  if (!user)
    return (
      <p className="text-center mt-5 text-2xl">Please login to see report.</p>
    );

  return (
    <div className="max-w-4xl mx-auto mt-8 p-2 sm:p-4">
      <h2 className="text-2xl font-semibold text-center mb-6">
        📊 Daily Sales Report
      </h2>

      {Object.keys(dailySales).length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No sales data available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left p-2">Date</th>
                <th className="text-center p-2">Inside (₹)</th>
                <th className="text-center p-2">Outside (₹)</th>
                <th className="text-center p-2 text-red-600">Cancelled (₹)</th>
                <th className="text-center p-2">Total (₹)</th>
                <th className="text-center p-2">Confirmed</th>
                <th className="text-center p-2 text-red-600">Cancelled</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(dailySales)
                .sort(
                  (a, b) =>
                    new Date(
                      b[0].split("/").reverse().join("-")
                    ) -
                    new Date(a[0].split("/").reverse().join("-"))
                )
                .map(([date, data]) => (
                  <tr key={date} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{date}</td>

                    <td className="text-center p-2">{data.inside.toFixed(2)}</td>

                    <td className="text-center p-2">{data.outside.toFixed(2)}</td>

                    <td className="text-center p-2 text-red-600 font-semibold">
                      {data.cancelled.toFixed(2)}
                    </td>

                    <td className="text-center font-semibold p-2">
                      {data.total.toFixed(2)}
                    </td>

                    <td className="text-center p-2">{data.countConfirmed}</td>

                    <td className="text-center text-red-600 p-2">
                      {data.countCancelled}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
