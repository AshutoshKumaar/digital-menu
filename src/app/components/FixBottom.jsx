"use client";
import { List, ShoppingCart, Gift, Home } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext"; // <-- ADD THIS

export default function BottomNav({ ownerId, cart }) {
  const { t } = useTranslation(); // <-- translation hook

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#2a2a2a] border-t border-gray-700 flex justify-around py-3 z-50">

      {/* Home */}
      <button
        onClick={() => (window.location.href = `/restaurant/${ownerId}`)}
        className="flex flex-col items-center text-yellow-400 hover:text-yellow-300"
      >
        <Home className="w-6 h-6" />
        <span className="text-xs">{t("home")}</span> 
      </button>

      {/* My Orders */}
      <button
        onClick={() =>
          (window.location.href = `/restaurant/${ownerId}/my-orders`)
        }
        className="flex flex-col items-center text-yellow-400 hover:text-yellow-300"
      >
        <List className="w-6 h-6" />
        <span className="text-xs">{t("orders")}</span>
      </button>

      {/* Cart */}
      <button
        onClick={() => (window.location.href = `/restaurant/${ownerId}/cart`)}
        className="relative flex flex-col items-center text-yellow-400 hover:text-yellow-300"
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="text-xs">{t("cart")}</span>
        {cart.length > 0 && (
          <span className="absolute -top-1 right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {cart.length}
          </span>
        )}
      </button>

      {/* Rewards */}
      <button
        onClick={() => (window.location.href = `/restaurant/${ownerId}/rewards`)}
        className="flex flex-col items-center text-yellow-400 hover:text-yellow-300"
      >
        <Gift className="w-6 h-6" />
        <span className="text-xs">{t("rewards")}</span>
      </button>

    </div>
  );
}
