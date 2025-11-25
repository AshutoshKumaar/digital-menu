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
import { useTranslation } from "../i18n/LanguageContext";
import LanguageSwitcher from "../i18n/LanguageSwitcher";

const mooli = Mooli({ weight: "400", subsets: ["latin"] });

export default function RestaurantClient({ ownerId }) {
  const { t, lang } = useTranslation();
  const { addToCart, cart } = useCart();

  const [items, setItems] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orderingEnabled, setOrderingEnabled] = useState(true);

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

        const statusSnap = await getDoc(
          doc(db, "owners", ownerId, "settings", "systemStatus")
        );
        if (statusSnap.exists()) {
          setOrderingEnabled(statusSnap.data().orderingEnabled);
        }

        if (analytics) {
          logEvent(analytics, "page_view", {
            page: "restaurant_menu",
            owner_id: ownerId,
          });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [ownerId]);

  // TRANSLATED "ALL"
  const translatedAll = lang === "hi" ? "सभी" : "all";

  // CATEGORY LIST
  const categories = [
    translatedAll,
    ...new Set(
      items.map((item) =>
        lang === "hi"
          ? item.category_hi || item.category || "अनकैटेगराइज्ड"
          : item.category || "Uncategorized"
      )
    ),
  ];

  // When language changes — update selected category
  useEffect(() => {
    if (selectedCategory === "all" || selectedCategory === "सभी") {
      setSelectedCategory(translatedAll);
    }
  }, [lang]);

  // FILTER + SEARCH
  const filteredItems = items.filter((item) => {
    const itemCategory =
      lang === "hi" ? item.category_hi || item.category : item.category;

    const isAll =
      selectedCategory === "all" || selectedCategory === "सभी";

    const matchCategory = isAll || itemCategory === selectedCategory;

    const itemName =
      lang === "hi" ? item.name_hi || item.name : item.name;

    const matchSearch =
      itemName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchCategory && matchSearch;
  });

  if (loading) return <RestaurantLoading mooli={mooli} />;

  // Highlight search text
  const highlightText = (text) => {
    if (!searchTerm || !text) return text;
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
      <div className="flex justify-center mb-6">
        <LanguageSwitcher />
      </div>

      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-extrabold">{ownerName}</h1>
        <p className="text-yellow-400 text-lg mt-3">{t("our_menu")}</p>
        <div className="mt-2 w-24 mx-auto border-b-4 border-yellow-500"></div>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-md mx-auto mb-6 relative">
        <input
          type="text"
          placeholder={t("search_placeholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#2a2a2a] border border-gray-600 text-white rounded-lg py-3 px-4 pl-10 focus:ring-2 focus:ring-yellow-500"
        />
        <Search className="absolute left-3 top-3.5 text-yellow-400 w-5 h-5" />
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex justify-center mb-10">
        <div className="relative inline-block w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full rounded-lg bg-[#2a2a2a] border border-gray-600 text-white py-3 px-4 pr-10"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MENU ITEMS */}
      <div className="max-w-full mx-auto space-y-10">
        {categories.map((cat) => {
          if (cat === translatedAll) return null;

          const catItems = filteredItems.filter((i) => {
            const c =
              lang === "hi" ? i.category_hi || i.category : i.category;
            return c === cat;
          });

          if (catItems.length === 0) return null;

          return (
            <div key={cat}>
              <div className="flex items-center mb-4">
                <span className="bg-yellow-500 text-black font-bold px-4 py-1 rounded-full uppercase">
                  {cat}
                </span>
                <div className="flex-1 border-b border-gray-600 ml-3"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {catItems.map((item) => {
                  const itemName =
                    lang === "hi" ? item.name_hi || item.name : item.name;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#1f1f1f] p-4 rounded-2xl shadow-md border border-gray-700"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={itemName}
                          className="w-full h-48 object-cover rounded-xl mb-3"
                        />
                      )}

                      <h3
                        className="text-lg font-semibold"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(itemName),
                        }}
                      ></h3>

                      <p className="text-yellow-400 font-bold mt-1">
                        ₹{item.price}
                      </p>

                      {item.available ? (
                        <p className="text-green-400 font-semibold mt-1">
                          {t("available")}
                        </p>
                      ) : (
                        <p className="text-red-400 font-semibold mt-1">
                          {t("not_available")}
                        </p>
                      )}

                      {orderingEnabled && (
                        <div className="flex gap-2 mt-3">
                          <input
                            type="number"
                            min="1"
                            defaultValue="1"
                            id={`qty-${item.id}`}
                            className="w-16 h-10 bg-[#111] border border-gray-500 text-center text-white rounded-lg"
                            disabled={!item.available}
                          />

                          {!item.available ? (
                            <button
                              disabled
                              className="h-10 w-full bg-gray-600 text-white rounded-lg opacity-60 cursor-not-allowed"
                            >
                              {t("not_available")}
                            </button>
                          ) : cart.find((c) => c.id === item.id) ? (
                            <button
                              disabled
                              className="h-10 w-full bg-green-600 text-white rounded-lg opacity-80"
                            >
                              {t("added")}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const qty =
                                  parseInt(
                                    document.getElementById(`qty-${item.id}`)
                                      .value
                                  ) || 1;

                                addToCart({
                                  id: item.id,
                                  name: itemName,
                                  price: item.price,
                                  quantity: qty,
                                });
                              }}
                              className="h-10 w-full bg-yellow-500 text-black rounded-lg"
                            >
                              {t("add")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTACT */}
      <div className="text-center mt-10 text-yellow-400 text-lg">
        <a
          href={`tel:${ownerPhone}`}
          className="flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          <span>{t("call")} +{ownerPhone}</span>
        </a>
      </div>

      {orderingEnabled && <BottomNav ownerId={ownerId} cart={cart} />}
    </div>
  );
}
