"use client";
import React, { useState } from "react";
import {
  Wallet,
  Gift,
  TrendingUp,
  CheckCircle,
  X,
  Banknote,
  CreditCard,
  Send,
} from "lucide-react";
import { db, auth } from "@/app/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const WalletPage = ({ earning = { confirmed: 0, pending: 0 } }) => {
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState("upi");
  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
    amount: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const totalEarning = earning.confirmed + earning.pending;
  const confirmedAmount = earning.confirmed;
  const pendingAmount = earning.pending;

  const monthlySales = 18; // Replace with Firestore value later

  const offers = [
    {
      id: 1,
      title: "Sell 30 Q/R Menus this Month",
      reward: "₹4000 Bonus",
      progress: monthlySales,
      target: 30,
    },
    {
      id: 2,
      title: "Sell 50 Q/R Menus this Month",
      reward: "₹7000 Bonus + Certificate",
      progress: monthlySales,
      target: 50,
    },
    {
      id: 3,
      title: "Sell 100 Q/R Menus in 3 Months",
      reward: "₹15,000 Super Bonus",
      progress: monthlySales * 3,
      target: 100,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (form.amount <= 0 || form.amount > confirmedAmount) {
      alert(`You can withdraw up to ₹${confirmedAmount} only.`);
      return;
    }

    setSubmitted(true);

    try {
      await addDoc(collection(db, "withdrawRequests"), {
        staffId: auth.currentUser.uid,
        amount: form.amount,
        method,
        bankDetails:
          method === "bank"
            ? {
                bankName: form.bankName,
                accountNumber: form.accountNumber,
                ifsc: form.ifsc,
              }
            : null,
        upiDetails:
          method === "upi"
            ? {
                upiId: form.upiId,
                bankName: form.bankName,
              }
            : null,
        status: "pending",
        requestedAt: serverTimestamp(),
      });

      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
        setForm({ bankName: "", accountNumber: "", ifsc: "", upiId: "", amount: 0 });
        alert(
          "You will get your money within 24 hours. Thank you for your withdrawal request!"
        );
      }, 1500);
    } catch (err) {
      console.error(err);
      setSubmitted(false);
      alert("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-5 space-y-6 relative">
      {/* Wallet Overview */}
      <div className="bg-white p-6 rounded-2xl shadow text-center">
        <Wallet className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <h2 className="text-2xl font-semibold mb-2">Wallet Balance</h2>
        <p className="text-4xl font-bold text-green-700 mb-1">₹{totalEarning}</p>
        <p className="text-gray-500 text-sm">Updated in real-time</p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 p-3 rounded-xl">
            <p className="text-blue-800 font-medium">Pending Amount</p>
            <p className="text-xl font-bold text-blue-600">₹{pendingAmount}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl">
            <p className="text-green-800 font-medium">Confirmed Amount</p>
            <p className="text-xl font-bold text-green-600">₹{confirmedAmount}</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-6 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-md transition"
        >
          Withdraw Now
        </button>
      </div>

      {/* Exclusive Offers */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-6 h-6 text-pink-500" />
          <h3 className="text-lg font-semibold text-gray-800">Exclusive Offers</h3>
        </div>

        {offers.map((offer) => {
          const percent = Math.min((offer.progress / offer.target) * 100, 100);
          const completed = percent >= 100;
          return (
            <div
              key={offer.id}
              className={`p-4 border rounded-xl ${
                completed ? "border-green-400 bg-green-50" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">{offer.title}</h4>
                <span className={`text-sm font-medium ${completed ? "text-green-600" : "text-blue-600"}`}>
                  {completed ? "Completed" : `${offer.progress}/${offer.target}`}
                </span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${completed ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <p className="text-gray-600">Reward: {offer.reward}</p>
                {completed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <TrendingUp className="w-5 h-5 text-blue-500" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Withdraw Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-3">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">
              Withdraw Confirmed Balance
            </h3>

            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-green-600">Withdrawal Request Submitted!</p>
                <p className="text-sm text-gray-500">You will get your money within <b>24 hours.</b></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center gap-4 mb-2">
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${method === "upi" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300"}`}
                    onClick={() => setMethod("upi")}
                  >
                    <CreditCard className="w-5 h-5" />
                    UPI
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${method === "bank" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300"}`}
                    onClick={() => setMethod("bank")}
                  >
                    <Banknote className="w-5 h-5" />
                    Bank Transfer
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Withdraw (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={confirmedAmount}
                    value={form.amount || ""}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    placeholder={`Max ₹${confirmedAmount}`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can withdraw up to your confirmed balance only.</p>
                </div>

                {method === "bank" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={form.bankName}
                        onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        value={form.accountNumber}
                        onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={form.ifsc}
                        onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                      <input
                        type="text"
                        required
                        value={form.upiId}
                        onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Banking Name</label>
                      <input
                        type="text"
                        required
                        value={form.bankName}
                        onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;