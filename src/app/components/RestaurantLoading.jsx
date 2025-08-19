"use client";

import { Store, Utensils, Coffee, Pizza } from "lucide-react";
import { motion } from "framer-motion";

export default function RestaurantLoading({ mooli }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#1c1c1c] to-[#2b2b2b] text-white overflow-hidden ${mooli.className}`}
    >
     {/* Restaurant Icon Spinner (Center) */}
      <motion.div
        className="w-28 h-28 flex items-center justify-center bg-yellow-500 rounded-full shadow-lg"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <Store className="w-14 h-14 text-[#1c1c1c]" />
      </motion.div>
      {/* Row of Floating Food Icons */}
      <div className="flex gap-8 mt-8">
        <motion.div
          className="text-yellow-400"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <Utensils className="w-10 h-10" />
        </motion.div>

        <motion.div
          className="text-pink-400"
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Pizza className="w-12 h-12" />
        </motion.div>

        <motion.div
          className="text-green-400"
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          <Coffee className="w-11 h-11" />
        </motion.div>
      </div>

     

      {/* Loading Text */}
      <motion.div
        className="mt-4 text-gray-300 text-xl font-bold"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Loading your restaurant...
      </motion.div>
    </div>
  );
}
