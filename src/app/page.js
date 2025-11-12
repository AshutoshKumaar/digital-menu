"use client";
import { CheckCircle, Phone, Mail, Globe, Settings, DollarSign, Zap, Clock, TrendingUp, Users, Menu, X } from "lucide-react";
import { useState } from 'react'; 
import Link from 'next/link';
import DigitalBharatMenuLogo from "./components/DigitalBharatMenuLogo";
import Image from "next/image";
import HeroSlider from "./components/HeroSlider";


import { Josefin_Sans } from "next/font/google";

// Font
const josefin = Josefin_Sans({ subsets: ["latin"], weight: "400" });

// ---------------------------------------------------
// SVG Graphics Placeholders (Optional: Replace with actual SVG code)
// ---------------------------------------------------
const SvgQrCode = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h.01"/><path d="M12 7h.01"/><path d="M17 7h.01"/><path d="M7 12h.01"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 17h.01"/><path d="M12 17h.01"/><path d="M17 17h.01"/></svg>;

// ---------------------------------------------------
// Components
// ---------------------------------------------------

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { href: "/privacy-policy", label: "Our Policy" },
        { href: "/refund-policy", label: "Refund" },
        { href: "/terms-and-conditions", label: "T & C" },
        { href: "/contact", label: "Contact" },
        { href: "/careers", label: "Careers" },
    ];

    return (
        <header className="sticky top-0 z-[100] bg-white bg-opacity-95 backdrop-blur-sm shadow-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href= "/" className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-wider transition duration-300 hover:text-indigo-900">
                    <DigitalBharatMenuLogo  className="h-16"  />
                   
                </Link>
                
                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
                    {navLinks.map((link) => (
                        <a key={link.href} href={link.href} className="hover:text-indigo-600 transition duration-300">{link.label}</a>
                    ))}
                </nav>

                {/* Desktop Action Buttons */}
                 <div className="hidden md:flex space-x-4 items-center">
                    
                    
                    <Link href="/login"> 
                        <button 
                            // as="a" अब legacyBehavior का हिस्सा है, इसे हटा दिया गया है
                            className="text-indigo-600 font-bold border-2 border-transparent hover:border-indigo-600 px-4 py-2 rounded-lg transition duration-300"
                        >
                            Login
                        </button>
                    </Link>

                    {/* 👇 Register Button - Link के साथ */}
                    <Link href="/register">
                        <button 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-indigo-300/50 hover:shadow-indigo-400/70 transition duration-500 transform hover:scale-105"
                        >
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

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} absolute w-full bg-white bg-opacity-95 backdrop-blur-sm shadow-xl border-t border-gray-200`}>
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

const Footer = () => (
    <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
            {/* Column 1: Company Info */}
            <div className="col-span-2 md:col-span-1">
                <DigitalBharatMenuLogo className="h-12 mb-4" />
                <p className="text-sm text-gray-400 mb-6">Modern, Simple & Smart Ordering System</p>
                <h4 className="font-semibold mb-3 border-b border-indigo-400/30 pb-1">Terms & Conditions</h4>
                <ul className="text-xs space-y-2 text-gray-400">
                    <li><CheckCircle className="w-3 h-3 inline mr-2 text-green-400"/>Monthly subscription is non-refundable</li>
                    <li><CheckCircle className="w-3 h-3 inline mr-2 text-green-400"/>One-time setup fee required before activation</li>
                    <li><Clock className="w-3 h-3 inline mr-2 text-yellow-400"/>Support: Mon–Sat, 10AM–7PM</li>
                </ul>
            </div>

            {/* Column 2: Contact Info */}
            <div id="contact">
                <h3 className="text-xl font-bold mb-4 text-indigo-400">Contact Us</h3>
                <ul className="space-y-4">
                    <li className="flex items-center hover:text-white transition duration-300">
                        <Phone className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                        <a href="tel:+917079666741">+91-7079666741</a>
                    </li>
                    <li className="flex items-center hover:text-white transition duration-300">
                        <Mail className="w-5 h-5 mr-3 text-red-400 flex-shrink-0" />
                        <a href="mailto:support@digitalmenu.com">support@digitalmenu.com</a>
                    </li>
                    <li className="flex items-center hover:text-white transition duration-300">
                        <Globe className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                        <a href="https://digital-menu-ivory-gamma.vercel.app/login" target="_blank" rel="noopener noreferrer">digitalmenu.com</a>
                    </li>
                </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div>
                <h3 className="text-xl font-bold mb-4 text-indigo-400">Quick Links</h3>
                <ul className="space-y-2 text-gray-400">
                    <li><a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a></li>
                    <li><a href="/refund-policy" className="hover:text-white transition">Refund Policy</a></li>
                    <li><a href="/terms-and-conditions" className="hover:text-white transition">Terms and Conditions</a></li>
                    <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                </ul>
            </div>
            
             {/* Column 4: Newsletter/CTA */}
             <div className="text-left">
                <h3 className="text-xl font-bold mb-4 text-indigo-400">Ready to Upgrade?</h3>
                <p className="text-sm text-gray-400 mb-4">Start your trial today and revolutionize your service.</p>
                <button className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold shadow-md hover:bg-yellow-500 transition duration-300">
                    Get Started
                </button>
            </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-xs sm:text-sm text-gray-500">
            &copy; 2025 MenuQR Solution. All rights reserved.
        </div>
    </footer>
);

// ---------------------------------------------------
// Main Landing Page
// ---------------------------------------------------

export default function LandingPage() {
    const plans = [
        {
            name: "Basic",
            price: "₹199/month",
            features: [
                "QR Menu, Unlimited Updates",
                "Basic Dashboard (Reports)",
                "Order Booking (without payment)",
            ],
            icon: Settings,
            color: "text-green-500",
        },
        {
            name: "Standard",
            price: "₹399/month",
            features: [
                "Everything in Basic",
                "Online Payments Integration",
                "Live Order Tracking",
                "Analytics + Customer Feedback",
            ],
            icon: DollarSign,
            color: "text-indigo-600",
            popular: true
        },
        {
            name: "Premium",
            price: "₹799/month",
            features: [
                "Everything in Standard",
                "Advanced Sales Reports",
                "Multi-Branch Support",
                "Offers & Discount Coupons",
                "Priority Support",
            ],
            icon: Zap,
            color: "text-yellow-500",
        },
    ];

    return (
        <div className ={` font-josefin antialiased ${josefin.className}`}>
            <Navbar />

            {/* 1. Hero Section (Slide 1) */}
            <HeroSlider />
          

            {/* 2. Problem & Solution (Slide 2 & 3) */}
            <section className="py-16 sm:py-24 bg-white" id="problem-solution">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    {/* Problem Column (Left) */}
                    <div className="p-4 md:p-8 border-r-0 md:border-r-4 border-red-100">
                        <span className="text-sm font-bold uppercase text-red-600 tracking-wider">The Challenge</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold mt-3 mb-6 text-gray-900">Stop Wasting Resources on Outdated Systems.</h2>
                        <ul className="space-y-4 text-base md:text-lg text-gray-700">
                            <li className="flex items-start transition duration-500 hover:text-red-600"><Zap className="w-5 h-5 mr-4 mt-1 text-red-500 flex-shrink-0" /> **High Costs & Outdated Data:** Reprints are expensive and slow.</li>
                            <li className="flex items-start transition duration-500 hover:text-red-600"><Clock className="w-5 h-5 mr-4 mt-1 text-red-500 flex-shrink-0" /> **Customer Friction:** Delays in ordering and long payment queues.</li>
                            <li className="flex items-start transition duration-500 hover:text-red-600"><Users className="w-5 h-5 mr-4 mt-1 text-red-500 flex-shrink-0" /> **Human Error:** Manual processes lead to confusion and incorrect orders.</li>
                            <li className="flex items-start transition duration-500 hover:text-red-600"><TrendingUp className="w-5 h-5 mr-4 mt-1 text-red-500 flex-shrink-0" /> **Zero Visibility:** No proper sales data or tracking for optimization.</li>
                        </ul>
                    </div>
                    
                    {/* Solution Column (Right) */}
                    <div className="p-8 md:p-10 bg-indigo-50 rounded-2xl shadow-2xl transform hover:scale-[1.02] transition duration-500">
                        <span className="text-sm font-bold uppercase text-indigo-600 tracking-wider">The MenuQR Solution</span>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-6 md:mb-8">Scan. Order. Pay. Simply.</h3>
                        <div className="space-y-6 text-gray-800 text-lg md:text-xl font-medium">
                            <p className="flex items-center"><CheckCircle className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" /> **Seamless Flow:** Customers scan QR to view and place orders directly.</p>
                            <p className="flex items-center"><DollarSign className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" /> **Instant Payments:** Securely integrate UPI, Cards, and Wallets.</p>
                            <p className="flex items-center"><Settings className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" /> **Total Control:** Manage menu, orders, and sales reports from a dashboard.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Features Section (Slide 4) */}
            <section className="py-16 sm:py-24 bg-gray-100" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">Key Capabilities</h2>
                    <p className="text-center text-gray-600 mb-12 md:mb-16 text-lg md:text-xl">The tools you need for ultimate efficiency and customer satisfaction.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {[
                            { title: "Dynamic QR Menu", detail: "Unlimited item updates, price changes, and availability toggle in real-time.", icon: SvgQrCode, iconColor: "text-indigo-600" },
                            { title: "Direct Online Payment Gateway", detail: "Full support for UPI, Credit/Debit Cards, and popular Wallets.", icon: DollarSign, iconColor: "text-green-500" },
                            { title: "All-in-One Dashboard", detail: "Centralized system to manage orders, track sales, and control inventory effortlessly.", icon: Settings, iconColor: "text-blue-500" },
                            { title: "Coupons & Offers Management", detail: "Drive sales and retention by quickly creating and deploying seasonal discounts and offers.", icon: Zap, iconColor: "text-yellow-600" },
                            { title: "Instant Feedback Loop", detail: "Collect customer reviews directly after payment to maintain high service standards.", icon: Mail, iconColor: "text-red-500" },
                            { title: "Multi-Branch Scaling", detail: "Seamlessly manage and monitor performance across all your restaurant locations (Premium).", icon: Users, iconColor: "text-purple-500" },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="p-6 md:p-8 bg-white rounded-2xl shadow-xl border-t-4 border-indigo-400/50 hover:border-indigo-600 transition duration-500 transform hover:-translate-y-2 group"
                            >
                                <feature.icon className={`w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 ${feature.iconColor} group-hover:scale-110 transition duration-300`} />
                                <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Benefits Section (Slide 5) */}
            <section className="bg-white py-16 sm:py-24" id="benefits">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">The Result: Unmatched ROI and Service</h2>
                    <p className="text-gray-600 mb-12 md:mb-16 text-lg md:text-xl">Tangible benefits that drive efficiency and profit.</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {[
                            { title: "Maximize Savings", detail: "Eliminate printing costs and staff overhead.", icon: DollarSign, color: "border-green-500" },
                            { title: "Modern Brand Image", detail: "Impress customers with a professional, high-tech experience.", icon: Globe, color: "border-blue-500" },
                            { title: "Increase Turnover", detail: "Faster ordering and payment means more tables served per hour.", icon: Clock, color: "border-yellow-500" },
                            { title: "Data-Driven Decisions", detail: "Transparent reports and analytics guide menu and marketing strategies.", icon: TrendingUp, color: "border-indigo-500" },
                        ].map((benefit, idx) => (
                            <div
                                key={idx}
                                className={`p-4 sm:p-6 bg-gray-50 rounded-xl shadow border-b-4 ${benefit.color} flex flex-col items-center justify-center h-full transition duration-500 hover:shadow-2xl`}
                            >
                                <benefit.icon className={`w-7 h-7 md:w-8 md:h-8 mb-3 ${benefit.color.replace('border', 'text')}`} />
                                <h4 className="font-bold text-base sm:text-lg mb-1 text-gray-900">{benefit.title}</h4>
                                <p className="text-xs sm:text-sm text-gray-600">{benefit.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Pricing Section (Slide 6) */}
            <section className="py-16 sm:py-24 bg-gray-100" id="pricing">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Transparent Pricing for Every Business</h2>
                    <p className="text-gray-600 mb-12 md:mb-16 text-lg md:text-xl">No commitments, upgrade or downgrade anytime.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => (
                            <div
                                key={idx}
                                // Mobile optimization: Most popular plan is highlighted, and all cards stack nicely.
                                className={`relative bg-white p-8 sm:p-10 rounded-3xl shadow-2xl transition duration-500 transform hover:scale-[1.03] ${plan.popular ? 'border-4 border-indigo-600 ring-4 ring-indigo-200' : 'border border-gray-200'}`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 px-5 py-2 bg-yellow-400 text-gray-900 text-sm font-extrabold uppercase rounded-full shadow-lg rotate-3">
                                        Best Value
                                    </div>
                                )}
                                <plan.icon className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 ${plan.color}`} />
                                <h3 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                                <p className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-6">
                                    {plan.price}
                                </p>
                                
                                <ul className="text-left space-y-3 mb-8 md:mb-10 min-h-[150px] text-gray-700 text-sm md:text-base">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <span className="font-medium">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href="#contact"
                                    className={`block w-full text-center py-3 rounded-full font-bold shadow-lg transition duration-300 ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                                >
                                    Select {plan.name}
                                </a>
                            </div>
                        ))}
                    </div>
                    <p className="mt-10 md:mt-12 text-base md:text-xl font-bold text-gray-800">
                        <Zap className="w-5 h-5 md:w-6 md:h-6 inline mr-2 text-red-500" />
                        **One-Time Setup Fee:** ₹799 (Branding, QR Design, Customization Included)
                    </p>
                </div>
            </section>
            
            <Footer />
        </div>
    );
}