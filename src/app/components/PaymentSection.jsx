// PaymentSection.jsx
"use client";
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function PaymentSection({ amount, ownerData, onPaymentSuccess, onCOD }) {
  if (!ownerData) return <p>Loading payment options...</p>;

  const { upiId, payeeName, transactionNote, currency, paymentMode } = ownerData;

  if (!upiId && paymentMode !== "cod") return <p>Owner UPI details not configured.</p>;

  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}`;

  const handleUPIPayment = () => {
    // Here, ideally integrate UPI deep link + detect success
    window.location.href = upiLink;
    // After successful payment, call callback
    // For demo, assume payment success after user clicks:
    setTimeout(() => {
      onPaymentSuccess();
    }, 1000); // 👈 simulate payment success
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">Pay ₹{amount}</h2>

      {(paymentMode === "prepaid" || paymentMode === "both") && (
        <>
          <h3 className="text-md font-medium">Pay via UPI</h3>
          <QRCodeCanvas value={upiLink} size={200} className="mb-2" />
          <button
            onClick={handleUPIPayment}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
          >
            Pay Now
          </button>
        </>
      )}

      {(paymentMode === "cod" || paymentMode === "both") && (
        <button
          onClick={onCOD}
          className="px-5 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600"
        >
          Pay with Cash on Delivery
        </button>
      )}

      <p className="text-gray-500 text-sm">
        {paymentMode === "both"
          ? "Choose any payment method"
          : paymentMode === "prepaid"
          ? "Pay online via UPI"
          : "Cash on Delivery only"}
      </p>
    </div>
  );
}
