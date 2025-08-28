import "./globals.css";
import {Mooli} from "next/font/google";
import NotificationListener from "./components/OrderListener";

export const metadata = {
  title: "Digital Menu App",
  description: "QR code based restaurant menu system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
       <NotificationListener />
        {children}
      </body>
    </html>
  );
}
