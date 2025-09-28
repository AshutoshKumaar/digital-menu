import "./globals.css";
import { Mooli } from "next/font/google";
import { CartProvider } from "../app/hooks/CartContext";  // ✅ import CartProvider

export const metadata = {
  title: "Digital Menu App",
  description: "QR code based restaurant menu system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        {/* ✅ Wrap your app inside CartProvider */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
