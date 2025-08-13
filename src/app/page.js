"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Josefin_Sans } from "next/font/google";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Initial page load spinner
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Common loading + redirect handler
  const handleNavigation = (path) => {
    setLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 1000); // 1 second loading screen before navigation
  };

  if (loading) {
    return (
      <div
        className={`${josefinSans.className} flex flex-col gap-4 items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-green-50`}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`${josefinSans.className} flex flex-col items-center justify-center h-screen text-center bg-gradient-to-br from-blue-50 to-green-50 animate-fadeIn`}
    >
      <h1 className="text-5xl font-bold mb-4 text-gray-800 drop-shadow-md transition-transform duration-500 hover:scale-105">
        Welcome to <span className="text-blue-600">Digital Menu</span>
      </h1>
      <p className="mb-8 text-lg text-gray-600 max-w-lg animate-slideUp">
        Create and share your restaurant menu with a QR code — make your menu
        modern and contactless.
      </p>
      <div className="flex gap-6 animate-fadeInSlow">
        <button
          onClick={() => handleNavigation("/login")}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-lg transform transition duration-300 hover:bg-blue-600 hover:scale-105 hover:shadow-2xl"
        >
          Login
        </button>
        <button
          onClick={() => handleNavigation("/register")}
          className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-lg transform transition duration-300 hover:bg-green-600 hover:scale-105 hover:shadow-2xl"
        >
          Register
        </button>
      </div>
    </div>
  );
}
