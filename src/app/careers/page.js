"use client";
import React, { useState } from "react";
import { Briefcase, Zap, Globe, Users, ArrowRight, X, Menu } from "lucide-react";
import DigitalBharatMenuLogo from "../components/DigitalBharatMenuLogo";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Josefin_Sans } from "next/font/google";

import Razorpay from "@/app/images/razorpay-icon.png";
import PhonePe from "@/app/images/phonepe-icon.png";
import Paytm from "@/app/images/paytm-icon.png";
import GPay from "@/app/images/google-pay-acceptance-mark-icon.png";
import BHIM from "@/app/images/bhim-app-icon.png";

const josefin = Josefin_Sans({ subsets: ["latin"], weight: "400" });

// ✅ Navbar Component (Single valid one)
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#benefits", label: "Benefits" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
    { href: "/careers", label: "Careers" },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-white bg-opacity-95 backdrop-blur-sm shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <a
          href="#"
          className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-wider transition duration-300 hover:text-indigo-900"
        >
          <DigitalBharatMenuLogo className="h-16" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-indigo-600 transition duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex space-x-4 items-center">
          <Link href="/login">
            <button className="text-indigo-600 font-bold border-2 border-transparent hover:border-indigo-600 px-4 py-2 rounded-lg transition duration-300">
              Login
            </button>
          </Link>

          <Link href="/register">
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-indigo-300/50 hover:shadow-indigo-400/70 transition duration-500 transform hover:scale-105">
              Register
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-indigo-700 p-2 rounded-lg hover:bg-gray-100 transition duration-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden ${
          isOpen ? "block" : "hidden"
        } absolute w-full bg-white bg-opacity-95 backdrop-blur-sm shadow-xl border-t border-gray-200`}
      >
        <nav className="flex flex-col space-y-4 p-4 text-center">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-2 text-gray-700 hover:text-indigo-600 border-b border-gray-100 transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link href="/login">
            <button className="text-indigo-600 font-bold px-4 py-2 mt-2 transition duration-300">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg mt-2 hover:opacity-90 transition duration-300">
              Register
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

// ✅ Careers Page
const CareersPage = () => {
  return (
    <div className={`min-h-screen bg-gray-50 font-sans ${josefin.className}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/digital-india-tech-bg.jpg')",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fadeInUp">
            Powering the{" "}
            <span className="text-orange-400">Digital Bharat Menu</span>{" "}
            Revolution.
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 opacity-90 animate-fadeInUp delay-200">
            Join the team building India’s most advanced online ordering
            platform. Your work will impact millions.
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a
              href="/staff-registration"
              className="group flex items-center justify-center px-8 py-3 bg-green-500 text-white font-bold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Become a Sales Partner{" "}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
            </a>

            <a
              href="/staff-registration/staff-login"
              className="group flex items-center justify-center px-8 py-3 bg-transparent border-2 border-white text-white font-bold text-lg rounded-full transition duration-300 transform hover:scale-105 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300"
            >
              Already have Sales Partner ID?
            </a>
          </div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">
            Why Partner with Digital Bharat Menu?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-blue-600 mb-3" />}
              title="Real Impact"
              desc="Shape the future of dining technology in a rapidly evolving market."
              color="blue"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-yellow-600 mb-3" />}
              title="Accelerated Growth"
              desc="Unmatched learning opportunities and career advancement in a scale-up environment."
              color="yellow"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-red-600 mb-3" />}
              title="Vibrant Culture"
              desc="A collaborative, inclusive, and fun workspace where ideas thrive."
              color="red"
            />
            <FeatureCard
              icon={<Briefcase className="w-8 h-8 text-green-600 mb-3" />}
              title="Cutting-Edge Tech"
              desc="Work with Next.js, AI, and modern cloud architecture."
              color="green"
            />
          </div>
        </div>
      </section>

      {/* Payment Partners */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
            Our Trusted Payment Partners
          </h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            We’ve partnered with India’s most reliable and secure payment
            providers to ensure smooth and safe transactions for every business.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center justify-center">
            <Image src={Razorpay} alt="Razorpay" className="w-30 h-auto mx-auto" />
            <Image src={PhonePe} alt="PhonePe" className="w-30 h-auto mx-auto" />
            <Image src={Paytm} alt="Paytm" className="w-30 h-auto mx-auto" />
            <Image src={GPay} alt="Google Pay" className="w-30 h-auto mx-auto" />
            <Image src={BHIM} alt="BHIM UPI" className="w-30 h-auto mx-auto" />
          </div>
        </div>
      </section>

      {/* Job Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
            Current Openings
          </h2>
          <p className="text-center text-gray-600 mb-8">
            If you are looking for a job as an employee, check out our latest
            vacancies.
          </p>

          <div className="space-y-4">
            <JobCard
              title="Marketing Manager"
              location="Remote"
              tags={["Branding", "Digital Marketing"]}
            />
            <JobCard
              title="Sales Associate (Employee)"
              location="Remote"
              tags={["B2B Sales", "Client Relations"]}
            />
          </div>

          <div className="text-center mt-10">
            <a
              href="/all-jobs"
              className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition duration-150 flex items-center justify-center"
            >
              See All Employee Vacancies <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// ✅ Reusable Feature Card Component
const FeatureCard = ({ icon, title, desc, color }) => (
  <div
    className={`p-6 bg-${color}-50/50 border-t-4 border-${color}-500 rounded-lg shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1`}
  >
    {icon}
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

// ✅ Job Card
const JobCard = ({ title, location, tags }) => (
  <div className="flex justify-between items-center p-5 bg-white rounded-xl shadow-lg border border-gray-100 hover:border-blue-300 transition duration-300">
    <div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{location}</p>
      <div className="mt-2 space-x-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
    <a
      href={`/jobs/${title.toLowerCase().replace(/ /g, "-")}`}
      className="text-blue-500 hover:text-blue-700 font-semibold flex items-center"
    >
      Apply <ArrowRight className="w-4 h-4 ml-1" />
    </a>
  </div>
);

export default CareersPage;
