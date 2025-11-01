import React from 'react'
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import DigitalBharatMenuLogo from '@/app/components/DigitalBharatMenuLogo'
function Navbar() {
     const [isOpen, setIsOpen] = useState(false);
    
        const navLinks = [
            { href: "/privacy-policy", label: "Our Policy" },
            { href: "/refund-policy", label: "Refund" },
            { href: "/terms-and-conditions", label: "T & C" },
            { href: "/contact", label: "Contact" },
            { href: "/careers", label: "Careers" },
        ];
  return (
    <div>
       <header className="sticky top-0 z-[100] bg-white bg-opacity-95 backdrop-blur-sm shadow-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <a href="/" className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-wider transition duration-300 hover:text-indigo-900">
                    <DigitalBharatMenuLogo  className="h-16"  />
                   
                </a>
                
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
    </div>
  )
}

export default Navbar
