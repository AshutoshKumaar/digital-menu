"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MenuList from "./MenuList";
import { auth } from "../firebase/config";
import Orders from "./Orders";
import GenerateQR from "./GenerateQR";
import OurInfo from "./OurInfo";
import OwnerSystemToggle from "./PaymentSettings";
import OwnerBillPage from "./OwnerBillPage";

// Placeholder components (replace with real ones)
function OurMenu() {
    const ownerId = auth.currentUser?.uid;
 return ownerId 
    ? <div><MenuList ownerId={ownerId} /></div>
    : <div>Please log in to view menu</div>;
}
function OrdersSection() {
  return <div className="p-4 text-black"><Orders /></div>;
}
function GenerateQRCode() {
    const ownerId = auth.currentUser?.uid;
  return <div className="p-4 text-black"><GenerateQR ownerId={ownerId} /></div>;
}

function OurInfoSection() {
  const ownerId = auth.currentUser?.uid;
  return <div className="p-4 text-black"><OurInfo ownerId={ownerId} /></div>;
}

function PaymentSettingsSection() {
  const ownerId = auth.currentUser?.uid;
  return <div className="p-4 text-black"><OwnerSystemToggle  /></div>;
}
function BillsSection() {
  return <div className="p-4 text-black"><OwnerBillPage /></div>;
 }


export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("Our Menu");

  const tabs = [
    { label: "Our Menu", component: <OurMenu /> },
    { label: "Orders", component: <OrdersSection  /> },
    { label: "Generate QR", component: <GenerateQRCode /> },
    { label: "Our Info", component: <OurInfoSection /> },
    { label: "Settings", component: <OwnerSystemToggle /> },
    { label: "Bills", component: <OwnerBillPage /> }
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <section className="mb-6">
        <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
          <ul className="flex flex-wrap gap-4 justify-center">
            {tabs.map((tab, index) => (
              <li
                key={index}
                onClick={() => setActiveTab(tab.label)}
                className={`px-5 py-2 rounded-full font-medium cursor-pointer transform transition-all duration-200 shadow 
                  ${
                    activeTab === tab.label
                      ? "bg-yellow-500 text-gray-900 scale-105 shadow-lg"
                      : "bg-gray-700 text-white hover:bg-yellow-400 hover:text-gray-900 hover:scale-105"
                  }`}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Active Tab Content with Animation */}
      <div className="mt-4 min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {tabs.find((tab) => tab.label === activeTab)?.component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
