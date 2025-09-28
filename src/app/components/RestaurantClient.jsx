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
import { Phone, ShoppingCart, List } from "lucide-react";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useCart } from "../hooks/CartContext";

const mooli = Mooli({ weight: "400", subsets: ["latin"] });

export default function RestaurantClient({ ownerId }) {
  const { addToCart, cart } = useCart();

  const [items, setItems] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const analytics = typeof window !== "undefined" ? getAnalytics() : null;

  useEffect(() => {
    async function load() {
      try {
        const ownerSnap = await getDoc(doc(db, "owners", ownerId));
        if (ownerSnap.exists()) {
          setOwnerName(ownerSnap.data().restaurantName || "Our Restaurant");
          setOwnerPhone(ownerSnap.data().ownerMobile || "+917079666741");
        }

        const q = query(
          collection(db, "owners", ownerId, "menu"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

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

  // ✅ Categories
  const categories = [
    "all",
    ...new Set(items.map((item) => item.category || "Uncategorized")),
  ];

  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  if (loading) {
    return <RestaurantLoading mooli={mooli} />;
  }

  // ✅ Show toast message
  const showMessage = (msg) => {
    const div = document.createElement("div");
    div.innerText = msg;
    div.className =
      "fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
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
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-extrabold text-center">{ownerName}</h1>
        <p className="text-yellow-400 text-lg mt-3">Our Menu</p>
        <div className="mt-2 w-24 mx-auto border-b-4 border-yellow-500"></div>
      </div>

      {/* ✅ Category Filter */}
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

      {/* Menu Items with Category Heading */}
      <div className="max-w-full mx-auto space-y-10">
        {Object.keys(
          filteredItems.reduce(
            (acc, it) => ({ ...acc, [it.category]: true }),
            {}
          )
        ).map((cat) => {
          const catItems = filteredItems.filter((i) => i.category === cat);
          return (
            <div key={cat}>
              {/* ✅ Category Heading */}
              <div className="flex items-center mb-4 flex-wrap">
                <span className="bg-yellow-500 text-black font-bold px-4 py-1 rounded-full uppercase shadow-md text-sm sm:text-base">
                  {cat}
                </span>
                <div className="flex-1 border-b-1 border-gray-600 ml-3"></div>
              </div>

              {/* ✅ Items under this category */}
              <div className="space-y-4">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#2a2a2a] p-3 rounded flex flex-col items-start"
                  >
                    <div>
                      <span className="text-[18px] font-bold block capitalize">
                        {item.name}
                      </span>
                      <span className="text-sm block capitalize">
                        {item.subname}
                      </span>
                      <span className="text-lg text-yellow-400">
                        ₹{item.price}
                      </span>
                    </div>

                    {/* Add to Cart with Quantity comment this section */}
                  
                  </div>
                ))}
              </div>
            </div>
          );
        })}</div>

      {/* ✅ Fixed Bottom Menu  also commnet this section*/}
     
      {/* Contact */}
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
