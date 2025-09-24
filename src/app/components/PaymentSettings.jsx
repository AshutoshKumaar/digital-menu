"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function PaymentSettings({ ownerId }) {
  const [settings, setSettings] = useState([
    { payeeName: "", upiId: "", currency: "INR", transactionNote: "", paymentMode: "cod" },
  ]);
  const [loading, setLoading] = useState(false);
  const [editable, setEditable] = useState(true); // input editable flag

  // Load existing data
  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "owners", ownerId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings(
          data.paymentSettings || [
            { payeeName: "", upiId: "", currency: "INR", transactionNote: "", paymentMode: "cod" },
          ]
        );
        setEditable(false); // disable inputs if data exists
      }
    };
    fetchSettings();
  }, [ownerId]);

  // Handle input change
  const handleChange = (index, field, value) => {
    const newSettings = [...settings];
    newSettings[index][field] = value;
    setSettings(newSettings);
  };

  // Save data
  const handleSave = async () => {
    setLoading(true);
    const docRef = doc(db, "owners", ownerId);
    await setDoc(
      docRef,
      { paymentSettings: settings }, // save as array of objects
      { merge: true }
    );
    setLoading(false);
    setEditable(false);
    alert("Payment settings saved!");
  };

  // Enable edit
  const handleEdit = () => {
    setEditable(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Payment Settings</h2>

      {settings.map((item, index) => (
        <div
          key={index}
          className={`p-4 mb-6 bg-white rounded-xl shadow-md border-l-4 ${
            editable ? "border-green-500" : "border-gray-300"
          }`}
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Payment Option #{index + 1}</h3>

          <label className="block mb-1 text-sm font-medium text-gray-600">Shop / Payee Name</label>
          <input
            type="text"
            value={item.payeeName}
            disabled={!editable}
            onChange={(e) => handleChange(index, "payeeName", e.target.value)}
            placeholder="SRN Canteen"
            className={`w-full px-3 py-2 mb-3 border rounded-lg ${
              editable ? "border-gray-300" : "bg-gray-100 cursor-not-allowed"
            }`}
          />

          <label className="block mb-1 text-sm font-medium text-gray-600">UPI ID</label>
          <input
            type="text"
            value={item.upiId}
            disabled={!editable}
            onChange={(e) => handleChange(index, "upiId", e.target.value)}
            placeholder="example@upi"
            className={`w-full px-3 py-2 mb-3 border rounded-lg ${
              editable ? "border-gray-300" : "bg-gray-100 cursor-not-allowed"
            }`}
          />

          <label className="block mb-1 text-sm font-medium text-gray-600">Currency</label>
          <input
            type="text"
            value={item.currency}
            disabled={!editable}
            onChange={(e) => handleChange(index, "currency", e.target.value)}
            placeholder="INR"
            className={`w-full px-3 py-2 mb-3 border rounded-lg ${
              editable ? "border-gray-300" : "bg-gray-100 cursor-not-allowed"
            }`}
          />

          <label className="block mb-1 text-sm font-medium text-gray-600">Transaction Note</label>
          <input
            type="text"
            value={item.transactionNote}
            disabled={!editable}
            onChange={(e) => handleChange(index, "transactionNote", e.target.value)}
            placeholder="Order Payment #101"
            className={`w-full px-3 py-2 mb-3 border rounded-lg ${
              editable ? "border-gray-300" : "bg-gray-100 cursor-not-allowed"
            }`}
          />

          <label className="block mb-1 text-sm font-medium text-gray-600">Payment Mode</label>
          <select
            value={item.paymentMode}
            disabled={!editable}
            onChange={(e) => handleChange(index, "paymentMode", e.target.value)}
            className={`w-full px-3 py-2 mb-3 border rounded-lg ${
              editable ? "border-gray-300" : "bg-gray-100 cursor-not-allowed"
            }`}
          >
            <option value="cod">Cash on Delivery</option>
            <option value="prepaid">Prepaid (UPI)</option>
            <option value="both">Both</option>
          </select>
        </div>
      ))}

      <div className="flex justify-between gap-4">
        {editable ? (
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        ) : (
          <button
            onClick={handleEdit}
            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Change Settings
          </button>
        )}
      </div>
    </div>
  );
}
