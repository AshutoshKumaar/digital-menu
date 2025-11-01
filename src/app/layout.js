import "./globals.css";
import { Mooli } from "next/font/google";
import { CartProvider } from "../app/hooks/CartContext";
import Script from "next/script"; // ✅ import Script component

export const metadata = {
  title: "Digital Menu App",
  description: "QR code based restaurant menu system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800" suppressHydrationWarning={true}>
        {/* Load Razorpay script globally */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive" // ✅ ensures script loads before any interaction
        />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
