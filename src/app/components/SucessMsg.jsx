"use client";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessModal({ show, onClose, message, coins, rupees }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm animate-fadeIn p-5">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 text-center relative animate-scaleUp">
        <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold mb-2 text-green-600">Order Placed!</h2>
        <p className="text-gray-700 mb-4">{message}</p>

        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold shadow-inner transform hover:scale-105 transition">
            💰 Rupees: <span className="text-yellow-600 font-bold">₹&nbsp;{rupees}</span>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold shadow-inner transform hover:scale-105 transition">
            🪙 Coins: <span className="text-blue-600 font-bold">{coins}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-lg font-semibold transition transform hover:scale-105"
        >
          OK
        </button>
      </div>
    </div>
  );
}
