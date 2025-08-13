"use client";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { Mooli } from "next/font/google";
import OrderModal from "./OrderModal";

const mooli = Mooli({ weight: "400", subsets: ["latin"] });

export default function RestaurantClient({ ownerId }) {
  const [items, setItems] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // <-- Loading state

  useEffect(() => {
    async function load() {
      try {
        const ownerSnap = await getDoc(doc(db, "owners", ownerId));
        if (ownerSnap.exists()) {
          setOwnerName(ownerSnap.data().restaurantName || "Our Restaurant");
        }

        const q = query(
          collection(db, "owners", ownerId, "menu"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false); // <-- stop loading
      }
    }
    load();
  }, [ownerId]);

  const openOrderModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Loading screen
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-[#1c1c1c] text-white ${mooli.className}`}>
        <div className="w-16 h-16 border-4 border-gray-300 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
        <div className="text-gray-400 text-lg">Loading restaurant...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen text-white p-6 ${mooli.className}`}
      style={{
        backgroundColor: "#1c1c1c",
        backgroundImage:
          "radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 50%)",
      }}
    >
      {/* Restaurant Title */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-extrabold">{ownerName}</h1>
        <p className="text-yellow-400 text-lg mt-1">Food Menu</p>
        <div className="mt-2 w-24 mx-auto border-b-4 border-yellow-500"></div>
      </div>

      {/* View My Orders Button */}
      <button
        onClick={() => {
          window.location.href = `/restaurant/${ownerId}/my-orders`;
        }}
        className="block mb-6 bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition cursor-pointer mx-auto"
      >
        View My Orders
      </button>

      {/* Menu */}
      <div className="max-w-3xl mx-auto space-y-10">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64">
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            {/* Loading Text */}
            <div className="text-gray-500 text-lg">Loading menu items...</div>
          </div>
        )}

        {Object.keys(items.reduce((acc, it) => ({ ...acc, [it.category]: true }), {})).map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          return (
            <div key={cat}>
              <div className="flex items-center mb-4 flex-wrap">
                <span className="bg-yellow-500 text-black font-bold px-4 py-1 rounded-full uppercase shadow-md text-sm sm:text-base">
                  {cat}
                </span>
                <div className="flex-1 border-b border-gray-600 ml-3"></div>
              </div>

              <div className="space-y-4">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#2a2a2a] p-3 rounded flex justify-between items-center flex-wrap sm:flex-nowrap"
                  >
                    <div>
                      <span className="text-lg block">{item.name}</span>
                      <span className="text-lg text-yellow-400">₹{item.price}</span>
                    </div>
                    <button
                      onClick={() => openOrderModal(item)}
                      className="bg-yellow-500 text-black px-4 py-1 mt-2 sm:mt-0 rounded hover:bg-yellow-400 transition"
                    >
                      Order Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Modal */}
      {showModal && (
        <OrderModal
          ownerId={ownerId}
          selectedItem={selectedItem}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Contact */}
      <div className="text-center mt-10 text-yellow-400 text-lg">
        +123-456-7890
      </div>
    </div>
  );
}
