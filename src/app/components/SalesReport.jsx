"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/config";

export default function SalesReport() {
  const [user, setUser] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Track logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch orders for this owner
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
  console.log(salesData);
  // 🔹 Calculate per-day sales
  const dailySales = salesData.reduce((acc, order) => {
    const dateObj = order.createdAt?.toDate ? order.createdAt.toDate() : null;

    // ✅ Format date in DD/MM/YYYY (10/11/2025)
    const formattedDate = dateObj
      ? dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "Unknown";

    if (!acc[formattedDate]) {
      acc[formattedDate] = { inside: 0, outside: 0, total: 0, count: 0 };
    }

    const sale = order.total ?? 0;
    if (order.orderType === "inside") {
      acc[formattedDate].inside += sale;
    } else {
      acc[formattedDate].outside += sale;
    }
    acc[formattedDate].total += sale;
    acc[formattedDate].count += 1;

    return acc;
  }, {});

  // 🔹 Loading UI
  if (loading)
    return (
      <div className="flex flex-col items-center mt-10 text-gray-600">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-800 mb-4"></div>
        <p className="text-lg font-medium">Loading Sales Report...</p>
      </div>
    );

  // 🔹 Auth check
  if (!user)
    return (
      <p className="text-center mt-5 text-2xl">Please login to see report.</p>
    );

  // 🔹 Render Table
  return (
    <div className="max-w-3xl mx-auto mt-8 p-2 sm:p-4">
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
                <th className="text-center p-2">Inside Sales (₹)</th>
                <th className="text-center p-2">Outside Sales (₹)</th>
                <th className="text-center p-2">Total Sales (₹)</th>
                <th className="text-center p-2">Orders</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dailySales)
                .sort(
                  (a, b) =>
                    new Date(b[0].split("/").reverse().join("-")) -
                    new Date(a[0].split("/").reverse().join("-"))
                )
                .map(([date, data]) => (
                  <tr key={date} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{date}</td>
                    <td className="text-center p-2">
                      {data.inside.toFixed(2)}
                    </td>
                    <td className="text-center p-2">
                      {data.outside.toFixed(2)}
                    </td>
                    <td className="text-center font-semibold p-2">
                      {data.total.toFixed(2)}
                    </td>
                    <td className="text-center p-2">{data.count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
