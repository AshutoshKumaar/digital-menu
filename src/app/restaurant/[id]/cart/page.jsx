"use client";
import BottomNav from "@/app/components/FixBottom";
import { useCart } from "@/app/hooks/CartContext";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { Mooli } from "next/font/google";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const mooli = Mooli({ weight: "400", subsets: ["latin"] });

export default function CartPage({params}) {
  const { id: ownerId } = React.use(params);
  const { cart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  // const params = useParams();

  // 👇 ownerId from URL (/restaurant/[a]/cart)
 

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <div
      className={`relative p-6 text-white min-h-screen pb-28 ${mooli.className}`}
      style={{
        backgroundColor: "#1c1c1c",
        backgroundImage:
          "radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 50%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          <ArrowLeft className="w-5 h-5 text-yellow-400" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-2xl font-extrabold text-yellow-400">🛒 Your Cart</h1>
        <div className="w-10"></div>
      </div>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400 mt-20">
          <ShoppingBag className="w-16 h-16 opacity-50 mb-4" />
          <p className="text-lg">Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-800 p-4 rounded-2xl shadow-lg"
              >
                <div>
                  <h2 className="font-semibold text-lg capitalize">{item.name}</h2>
                  <p className="text-sm text-gray-300">
                    ₹{item.price} × {item.quantity} ={" "}
                    <span className="text-yellow-400 font-bold">₹{item.totalPrice}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value) || 0)
                    }
                    className="w-16 bg-black border border-gray-600 text-center rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-600 px-3 py-2 rounded-lg hover:bg-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal + Place Order */}
          <div className="fixed bottom-16 left-0 w-full bg-gray-900 border-t border-gray-700 p-4 flex justify-between items-center z-50">
            <h2 className="text-lg font-bold">
              Sub Total&nbsp;:- &nbsp;<span className="text-yellow-400">₹{subtotal}</span>
            </h2>
            <button
              onClick={() => router.push(`/restaurant/${ownerId}/checkout`)}
              className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold text-base shadow-md hover:bg-yellow-400 active:scale-95 transition"
            >
              Place Order
            </button>
          </div>
         

        </>
        
      )}
       <BottomNav ownerId={ownerId} cart={cart} />
    </div>
  );
}
