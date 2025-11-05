"use client";
import React, { useState, useEffect } from "react";

const slides = [
  {
    id: 1,
    image: "/Hero-section-first.png",
    title: "Digital Menu For Smart Restaurants",
    description: "Upgrade your business with our QR-based digital menu solution.",
  },
  {
    id: 2,
    image: "/Hero-section-second.png",
    title: "Seamless Ordering Experience",
    description: "Let your customers explore and order with just a scan.",
  },
  {
    id: 3,
    image: "/Hero-section-third.png",
    title: "Beautiful UI, Powerful Backend",
    description: "Fully customizable dashboard for your restaurant needs.",
  },
  {
    id: 4,
    image: "/Hero-section-second.png",
    title: "Beautiful UI, Powerful Pictures",
    description: "Fully customizable dashboard for your restaurant needs.",
  },
  {
    id: 5,
    image: "/Hero-section-third.png",
    title: "Modern Look, Powerful Experience",
    description: "Simple, elegant, and fast for your restaurant customers.",
  },
  {
    id: 6,
    image: "/Hero-section-fourth.png",
    title: "Grow with Digital Bharat Menu",
    description: "Join India’s digital transformation today.",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  // Auto slide every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[60vh] sm:h-[110vh]  bg-gradient-to-br from-indigo-900 to-blue-700 text-white overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out transform 
            ${index === current ? "opacity-100 scale-100 z-20" : "opacity-0 scale-105 z-10"}
          `}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover sm:object-fill brightness-[0.55] opacity-50"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg animate-fadeIn">
              {slide.title}
            </h1>
            <p className="text-gray-200 text-lg md:text-xl max-w-2xl mb-6">
              {slide.description}
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg shadow-lg transition-all">
              Get Started
            </button>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              current === index ? "bg-white scale-125" : "bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Left/Right Arrows */}
      <button
        onClick={() =>
          setCurrent(current === 0 ? slides.length - 1 : current - 1)
        }
        className="absolute left-5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
      >
        ❮
      </button>
      <button
        onClick={() =>
          setCurrent(current === slides.length - 1 ? 0 : current + 1)
        }
        className="absolute right-5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
      >
        ❯
      </button>
    </div>
  );
}
