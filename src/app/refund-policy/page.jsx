"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RefundPolicy() {
  return (
    <div className={`${josefin.className} min-h-screen flex flex-col`}>
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Page Content */}
      <main className="flex-grow py-24">
        <div className="max-w-4xl mx-auto  p-8  mt-4">
          <h1 className="text-3xl font-bold mb-4 text-indigo-600">
            Refund & Cancellation Policy
          </h1>

          <p className="text-gray-700 mb-4 leading-relaxed">
            At <strong>Digital Bharat Menu</strong>, we aim to provide our customers with a smooth and reliable ordering
            experience. Please take a moment to review our refund and cancellation policies carefully before making a
            purchase.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
            Order Cancellation
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Orders once confirmed cannot be cancelled once the payment has been successfully processed. In case of
            duplicate payments or technical errors, you can contact our support team for assistance.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Refunds</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Refunds are issued only for duplicate transactions or verified technical errors. Once approved, refunds are
            processed within <strong>7–10 business days</strong> and credited back to your original mode of payment.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
            Non-Refundable Cases
          </h2>
          <ul className="list-disc ml-6 text-gray-700 space-y-2 leading-relaxed">
            <li>Orders placed successfully and delivered cannot be refunded.</li>
            <li>Delays caused due to network or third-party issues are not eligible for refunds.</li>
            <li>Incorrect payment details provided by the customer.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
            Contact for Refund
          </h2>
          <p className="text-gray-700 leading-relaxed">
            For refund or payment-related queries, please reach out to us:
          </p>

          <div className="mt-4 text-gray-700">
            <p>
              <strong>Email:</strong> support@digitalbharatmenu.in
            </p>
            <p>
              <strong>Phone:</strong> +91 7079666741
            </p>
            <p>
              <strong>Address:</strong> [At Prem Nagar anathlya Road, Katihar, Bihar, 854105]
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            *This policy is subject to change without prior notice. Please check this page periodically for updates.
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
