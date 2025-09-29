"use client";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react"; // ✅ icon

export default function OrderSuccessModal({ show, onClose, message }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center relative">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
        <p className="text-gray-700 mb-4">{message || "Your order was successful."}</p>
        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          OK
        </button>
      </div>
    </div>
  );
}
