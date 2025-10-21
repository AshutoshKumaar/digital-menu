"use client";
import React from "react";
import {
  Trophy,
  Wallet,
  Info,
  Gift,
  Sparkles,
  Star,
  Rocket,
  Clock
} from "lucide-react";

const DashboardPage = ({ earning = { confirmed: 0, pending: 0 } }) => {
  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      {/* ---------------- HEADER ---------------- */}
      <div className="p-4 mb-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome to <span className="text-blue-600">WorkPage Partner</span> 🚀
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl leading-relaxed">
              Every visit, every client, and every effort helps you build your
              income and reputation. Let’s grow together — with trust,
              consistency, and performance.
            </p>
          </div>
          <div className="hidden sm:block bg-blue-50 p-4 rounded-full">
            <Rocket size={48} className="text-blue-600" />
          </div>
        </div>
      </div>

      {/* ---------------- EARNINGS OVERVIEW ---------------- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-12">
        <div className="flex items-center justify-between flex-wrap gap-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              Total Confirmed Earnings
            </h2>
            <p className="text-4xl font-extrabold text-blue-700 mb-2">
              ₹{earning.confirmed.toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm">
              ₹10 per verified visit + bonus per closed deal
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl">
            <Wallet size={60} className="text-blue-600" />
          </div>
        </div>
      </div>

      {/* ---------------- PENDING REWARDS ---------------- */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm my-4">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="text-yellow-600 w-6 h-6" />
          <h3 className="text-lg font-semibold text-yellow-700">Pending Rewards</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-800">
          ₹{earning.pending.toLocaleString()}
        </p>
        <p className="text-sm text-yellow-600 mt-1">
          These rewards will be added once verified by admin.
        </p>
      </div>
    

      {/* ---------------- REWARD STRUCTURE ---------------- */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Visit Reward */}
        <Card
          icon={<Trophy className="text-yellow-500" size={30} />}
          title="Per Visit Reward"
          text={
            <>
              For every verified visit you complete, earn{" "}
              <span className="font-semibold text-blue-600">₹10</span>.  
              Build your routine and grow consistently every day.
            </>
          }
          footer="*Visits must be verified via GPS or photo submission."
        />

        {/* Deal Commission */}
        <Card
          icon={<Gift className="text-pink-500" size={30} />}
          title="Deal Commission"
          text={
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>
                Sell <strong>₹799 package</strong> → Earn{" "}
                <span className="font-semibold text-blue-600">₹199</span>
              </li>
              <li>
                Sell <strong>₹399 package</strong> → Earn{" "}
                <span className="font-semibold text-blue-600">₹99</span>
              </li>
              <li>
                Sell <strong>₹199 package</strong> → Earn{" "}
                <span className="font-semibold text-blue-600">₹39</span>
              </li>
            </ul>
          }
          footer="Close more deals and unlock higher bonuses."
        />

        {/* Info Section */}
        <Card
          icon={<Info className="text-blue-500" size={30} />}
          title="Important Info"
          text={
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
              <li>Always mark your visit in the app after meeting clients.</li>
              <li>Upload proof for closed deals to receive commissions.</li>
              <li>Be punctual, professional, and polite with all clients.</li>
            </ul>
          }
          footer="💡 Consistency and clarity build lasting trust."
        />
      </div>

      {/* ---------------- PERFORMANCE MESSAGE ---------------- */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-3xl shadow-lg p-8 text-center relative overflow-hidden">
        <div className="absolute left-10 top-10 opacity-10">
          <Star size={100} />
        </div>
        <Sparkles size={36} className="mx-auto mb-3 text-yellow-300" />
        <h2 className="text-2xl font-bold mb-2 tracking-tight">
          Keep Growing, Our Trusted Partner 🌟
        </h2>
        <p className="text-blue-100 text-sm max-w-2xl mx-auto leading-relaxed">
          Each client visit brings new opportunities. Stay focused, close deals
          with honesty, and remember — your growth defines the WorkPage success story.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;

// ---------------- Reusable Card Component ----------------
function Card({ icon, title, text, footer }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-gray-50 p-2 rounded-lg">{icon}</div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <div className="text-gray-600 text-sm leading-relaxed">{text}</div>
      {footer && <p className="text-xs text-gray-400 mt-3">{footer}</p>}
    </div>
  );
}
