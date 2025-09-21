"use client";
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function PaymentSection({ amount }) {
  const upiId = "9876543210@upi"; // Owner ka UPI ID
  const payeeName = "SRN Canteen";
  const transactionNote = `Order Payment ₹${amount}`;
  const currency = "INR";

  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}`;

  const handlePayment = () => {
    window.location.href = upiLink;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">
        Pay ₹{amount} via UPI
      </h2>

      {/* ✅ Correct QR Code */}
      <QRCodeCanvas value={upiLink} size={200} />

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
      >
        Pay Now
      </button>

      <p className="text-gray-500 text-sm">Scan QR or Click Pay Now</p>
    </div>
  );
}
