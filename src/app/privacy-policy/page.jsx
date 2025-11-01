"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {Josefin_Sans} from 'next/font/google';


const josefinSans = Josefin_Sans({ subsets: ['latin']});

export default function PrivacyPolicy() {
  return (
    <div className={`min-h-screen flex flex-col ${josefinSans.className}`}>
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Page Content */}
      <div className="flex-grow py-24">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4 text-indigo-600">Privacy Policy</h1>
          <p className="text-gray-500 mb-6">Last updated: November 2025</p>

          <p className="text-gray-700 mb-4 leading-relaxed">
            Welcome to <strong>Digital Bharat Menu</strong> (“we,” “our,” “us”). This Privacy Policy describes how we
            collect, use, and protect your personal information when you access or use our website, digital menu, and
            payment services.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Information We Collect</h2>
          <ul className="list-disc ml-6 text-gray-700 space-y-2 leading-relaxed">
            <li>Personal details (name, email, phone number) during registration or online payments.</li>
            <li>Payment data securely processed through Razorpay; we never store your card details.</li>
            <li>Device and usage information (browser type, IP address, and system logs).</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">How We Use Your Data</h2>
          <ul className="list-disc ml-6 text-gray-700 space-y-2 leading-relaxed">
            <li>To process your payments and manage your orders.</li>
            <li>To improve our services, website functionality, and customer experience.</li>
            <li>To communicate important updates, offers, or responses to inquiries.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We follow industry-standard security protocols to protect your personal data. All payment information is
            encrypted and processed securely through <strong>Razorpay</strong>. We do not store sensitive payment
            details on our servers.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed">
            We may use third-party tools (like Razorpay or analytics providers) to enhance our services. These tools
            operate under their own privacy policies.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Your Consent</h2>
          <p className="text-gray-700 leading-relaxed">
            By using our website, you consent to our Privacy Policy and agree to its terms.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have questions or concerns about this Privacy Policy, feel free to contact us:
          </p>

          <div className="mt-4 text-gray-700">
            <p><strong>Email:</strong> support@digitalbharatmenu.in</p>
            <p><strong>Phone:</strong> +91 7079666741</p>
            <p><strong>Address:</strong> [At Prem Nagar anathlya Road, Katihar, Bihar, 854105]</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
