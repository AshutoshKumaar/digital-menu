"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Josefin_Sans } from "next/font/google";
import { Mail, Phone, MapPin, Building2 } from "lucide-react";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function ContactPage() {
  return (
    <div className={`${josefin.className} min-h-screen bg-gray-50 flex flex-col`}>
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="flex-grow py-10 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-indigo-600">Contact Us</h1>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Have a question, feedback, or need support? We’d love to hear from you.  
            Get in touch using the contact details below or drop us a message anytime.
          </p>

          <div className="space-y-5 text-gray-700">
            <div className="flex items-center gap-3">
              <Building2 className="text-indigo-600" size={22} />
              <p>
                <strong>Business Name:</strong> Digital Bharat Menu
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-indigo-600" size={22} />
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:support@digitalbharatmenu.in"
                  className="text-indigo-600 hover:underline"
                >
                  support@digitalbharatmenu.in
                </a>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-indigo-600" size={22} />
              <p>
                <strong>Phone:</strong>{" "}
                <a
                  href="tel:+919876543210"
                  className="text-indigo-600 hover:underline"
                >
                  +91 7079666741
                </a>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-indigo-600" size={22} />
              <p>
                <strong>Address:</strong> [At Prem Nagar anathlya Road, Katihar, Bihar, 854105]
              </p>
            </div>
          </div>

          <p className="mt-8 text-gray-600 leading-relaxed">
            You can also reach out to us through our social media handles or by
            filling out the contact form available on our homepage.  
            Our team strives to respond within 24–48 hours.
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
