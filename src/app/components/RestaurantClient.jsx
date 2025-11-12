"use client";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { Mooli } from "next/font/google";
import RestaurantLoading from "./RestaurantLoading";
import { Phone, Search } from "lucide-react";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useCart } from "../hooks/CartContext";
import BottomNav from "./FixBottom";

const mooli = Mooli({ weight: "400", subsets: ["latin"] });

export default function RestaurantClient({ ownerId }) {
  const { addToCart, cart } = useCart();
  const [items, setItems] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // ✅ search term
  const [orderingEnabled, setOrderingEnabled] = useState(true);

  const analytics = typeof window !== "undefined" ? getAnalytics() : null;

  useEffect(() => {
    async function load() {
      try {
        // 🔹 Fetch owner info
        const ownerSnap = await getDoc(doc(db, "owners", ownerId));
        if (ownerSnap.exists()) {
          setOwnerName(ownerSnap.data().restaurantName || "Our Restaurant");
          setOwnerPhone(ownerSnap.data().ownerMobile || "+917079666741");
        }

        // 🔹 Fetch menu items
        const q = query(
          collection(db, "owners", ownerId, "menu"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // 🔹 Fetch ordering status
        const statusSnap = await getDoc(
          doc(db, "owners", ownerId, "settings", "systemStatus")
        );
        if (statusSnap.exists()) {
          setOrderingEnabled(statusSnap.data().orderingEnabled);
        } else {
          setOrderingEnabled(true);
        }

        if (analytics) {
          logEvent(analytics, "page_view", {
            page: "restaurant_menu",
            owner_id: ownerId,
          });
        }
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ownerId]);

  const categories = [
    "all",
    ...new Set(items.map((item) => item.category || "Uncategorized")),
  ];

  // ✅ Search + Category Filter
  const filteredItems = items.filter((item) => {
    const matchCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch = item.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <RestaurantLoading mooli={mooli} />;

  // ✅ Function to highlight matched text
  const highlightText = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(
      regex,
      '<span class="bg-yellow-400 text-black font-semibold">$1</span>'
    );
  };

  return (
    <div
      className={`min-h-screen text-white p-6 pb-20 ${mooli.className}`}
      style={{
        backgroundColor: "#1c1c1c",
        backgroundImage:
          "radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 50%)",
      }}
    >
      {/* ---------- HEADER ---------- */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-extrabold text-center">{ownerName}</h1>
        <p className="text-yellow-400 text-lg mt-3">Our Menu</p>
        <div className="mt-2 w-24 mx-auto border-b-4 border-yellow-500"></div>
      </div>

      {/* ---------- SEARCH BAR ---------- */}
      <div className="max-w-md mx-auto mb-6 relative">
        <input
          type="text"
          placeholder="Search for an item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#2a2a2a] border border-gray-600 text-white rounded-lg py-3 px-4 pl-10 focus:ring-2 focus:ring-yellow-500 focus:outline-none placeholder-gray-400"
        />
        <Search className="absolute left-3 top-3.5 text-yellow-400 w-5 h-5" />
      </div>

      {/* ---------- CATEGORY FILTER ---------- */}
      <div className="flex justify-center mb-10">
        <div className="relative inline-block w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full appearance-none rounded-lg bg-[#2a2a2a] border border-gray-600 text-white py-3 px-4 pr-10 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#1c1c1c] text-white">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-yellow-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* ---------- MENU ITEMS ---------- */}
      <div className="max-w-full mx-auto space-y-10">
        {Object.keys(
          filteredItems.reduce((acc, it) => ({ ...acc, [it.category]: true }), {})
        ).map((cat) => {
          const catItems = filteredItems.filter((i) => i.category === cat);
          return (
            <div key={cat}>
              <div className="flex items-center mb-4 flex-wrap">
                <span className="bg-yellow-500 text-black font-bold px-4 py-1 rounded-full uppercase shadow-md text-sm sm:text-base">
                  {cat}
                </span>
                <div className="flex-1 border-b border-gray-600 ml-3"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1f1f1f] p-4 rounded-2xl flex flex-col items-center shadow-md border border-gray-700"
                  >
                    {item.imageUrl && (
                      <div className="w-full overflow-hidden rounded-xl mb-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}

                    {/* ✅ Highlighted name */}
                    <div className="w-full text-left">
                      <h3
                        className="text-lg font-semibold text-white capitalize"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(item.name),
                        }}
                      ></h3>

                      {item.subname && (
                        <p className="text-sm text-gray-400 capitalize mt-1">
                          {item.subname}
                        </p>
                      )}
                      <p className="text-yellow-400 font-bold text-base mt-1">
                        ₹{item.price}
                      </p>
                      <p className="text-sm mt-1">
                        {item.available ? (
                          <span className="text-green-400 font-semibold">
                            ✅ Available
                          </span>
                        ) : (
                          <span className="text-red-400 font-semibold">
                            ❌ Not Available
                          </span>
                        )}
                      </p>
                    </div>

                    {/* ✅ Add to Cart */}
                    {orderingEnabled && (
                      <div className="flex flex-row items-start justify-center space-x-2 space-y-3 mt-3 w-full">
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          id={`qty-${item.id}`}
                          className="w-16 h-10 bg-[#111] border border-gray-500 text-center text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                        />
                        {cart.find((c) => c.id === item.id) ? (
                          <button
                            disabled
                            className="h-10 w-full bg-green-600 text-white font-semibold rounded-lg shadow-md opacity-80 cursor-not-allowed"
                          >
                            ✅ Added
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const qty =
                                parseInt(
                                  document.getElementById(`qty-${item.id}`).value
                                ) || 1;
                              addToCart({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                quantity: qty,
                              });
                              const div = document.createElement("div");
                              div.innerText = `"${item.name}" added to cart`;
                              div.className =
                                "fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
                              document.body.appendChild(div);
                              setTimeout(() => div.remove(), 2000);
                            }}
                            className="h-10 w-full bg-yellow-500 text-black font-semibold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition"
                          >
                            🛒 Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Bottom Nav */}
      {orderingEnabled && <BottomNav ownerId={ownerId} cart={cart} />}

      {/* ✅ Contact */}
      <div className="text-center mt-10 mb-0 text-yellow-400 text-lg">
        <a
          href={`tel:${ownerPhone}`}
          className="flex items-center justify-center space-x-2 hover:text-yellow-300 transition"
        >
          <Phone className="w-5 h-5" />
          <span>+{ownerPhone}</span>
        </a>
      </div>
    </div>
  );
}
