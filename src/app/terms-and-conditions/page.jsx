"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function TermsAndConditions() {
  return (
    <div className={`${josefin.className} min-h-screen`}>
       <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      <div className="max-w-4xl mx-auto py-16 mt-20">
        <h1 className="text-3xl font-bold mb-4 text-indigo-600">Terms & Conditions</h1>

        <p className="text-gray-700 mb-4">
          Welcome to <strong>Digital Bharat Menu</strong> (“we”, “our”, or “us”). 
          By accessing or using our platform, you agree to comply with the following Terms and Conditions. 
          Please read them carefully before using our services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Service Overview</h2>
        <p className="text-gray-700 mb-4">
          Digital Bharat Menu is a platform that provides restaurants, cafés, and food businesses with digital menu 
          solutions. Our service enables users to scan a QR code to view the restaurant’s menu, place orders easily, 
          and participate in reward programs. 
          We do not prepare, sell, or deliver any food or beverage products directly.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Platform Usage</h2>
        <p className="text-gray-700 mb-4">
          You agree to use our platform for lawful purposes only. Any misuse, attempt to hack, disrupt, or manipulate 
          the ordering or reward system will result in immediate termination of access.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Role of Restaurants</h2>
        <p className="text-gray-700 mb-4">
          All orders placed through the Digital Bharat Menu platform are fulfilled by the respective restaurants. 
          The restaurant is solely responsible for order accuracy, pricing, preparation, and delivery. 
          We are not liable for issues related to food quality, delivery delays, or customer service by restaurants.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Payments</h2>
        <p className="text-gray-700 mb-4">
          Payments for platform services are securely processed via <strong>Razorpay</strong>. 
          We do not store your payment credentials such as card numbers or CVV. 
          For restaurant orders, the payment process is between the customer and the restaurant, 
          and we act only as a facilitator through our platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Rewards Program</h2>
        <p className="text-gray-700 mb-4">
          Our reward system allows customers to earn points for eligible actions such as ordering or scanning menus. 
          Rewards are governed by our internal program rules and may change without prior notice. 
          Rewards have no cash value and cannot be exchanged for money.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Data & Privacy</h2>
        <p className="text-gray-700 mb-4">
          By using our platform, you consent to our data practices outlined in our{" "}
          <a href="/privacy-policy" className="text-indigo-600 underline">Privacy Policy</a>. 
          We use collected data only to enhance your experience and improve platform performance.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          Digital Bharat Menu shall not be liable for any indirect, incidental, or consequential damages 
          arising from the use or inability to use our platform or any restaurant’s service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Modifications</h2>
        <p className="text-gray-700 mb-4">
          We reserve the right to modify or update these Terms at any time. 
          Continued use of our services after changes constitutes acceptance of the revised terms.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">9. Governing Law</h2>
        <p className="text-gray-700">
          These Terms are governed by the laws of <strong>[Katihar, Bihar, India]</strong>. 
          All disputes shall be subject to the jurisdiction of local courts in that region.
        </p>
      </div>
      <Footer />
    </div>
  );
}
