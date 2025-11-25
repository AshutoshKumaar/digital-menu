import "./globals.css";
import { CartProvider } from "../app/hooks/CartContext";
import Script from "next/script";
import { LanguageProvider } from "./i18n/LanguageContext";


export const metadata = {
  title: "Digital Menu App",
  description: "QR code based restaurant menu system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50" suppressHydrationWarning={true}>

        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
