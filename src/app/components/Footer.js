
// components/Footer.js
import React from 'react';
import { Phone, Mail, Globe, CheckCircle, Clock } from 'lucide-react';
import DigitalBharatMenuLogo from './DigitalBharatMenuLogo';
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
            {/* Column 1: Company Info */}
            <div className="col-span-2 md:col-span-1">
                <DigitalBharatMenuLogo className="h-12 mb-4" />
                <p className="text-sm text-gray-400 my-2">Modern, Simple & Smart Ordering System</p>
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
                    <li><a href="#features" className="hover:text-white transition">Features</a></li>
                    <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                    <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
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
}
// This Footer component can be imported and used in other components or pages.