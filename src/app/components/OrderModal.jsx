// components/CheckoutClient.jsx
"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useCart } from "@/app/hooks/CartContext";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mooli } from "next/font/google";
import { getUserId } from "../utils/getUserId";
import LoadingScreen from "./Loadingscreen";
import BottomNav from "./FixBottom";
import OrderSuccessModal from "./SucessMsg";
import { addRewardOnOrder } from "../utils/AddRewardOnOrder";
import PhoneLinkModal from "./PhoneLinkModal";
import { useTranslation } from "@/app/i18n/LanguageContext";
import ClientNav from "./ClientNav";

const mooli = Mooli({ weight: "400", subsets: ["latin"] });

export default function CheckoutClient({ ownerId }) {
  const { t, lang } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [owner, setOwner] = useState(null);
  const [reward, setReward] = useState({ rupees: 0, coins: 0 });

  const [orderType, setOrderType] = useState("inside");

  // 🔥 NEW — fetch order permissions
  const [orderPermissions, setOrderPermissions] = useState({
    inside: true,
    outside: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    table: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const { cart, clearCart } = useCart();
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const router = useRouter();

  const shopLocation = { lat: 25.54544988021849, lng: 87.56932047791145 };
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Load user
  useEffect(() => {
    async function loadUser() {
      const userResult = await getUserId();
      if (userResult) {
        setUserId(userResult.uid);
        setIsAnonymous(userResult.isAnonymous);
      }
    }
    loadUser();
  }, []);

  // Load owner details
  useEffect(() => {
    async function fetchOwner() {
      if (!ownerId) return;
      const docSnap = await getDoc(doc(db, "owners", ownerId));
      if (docSnap.exists()) setOwner(docSnap.data());
    }
    fetchOwner();
  }, [ownerId]);

  // 🔥 Load order permissions from backend
  useEffect(() => {
    async function fetchPermissions() {
      if (!ownerId) return;
      const permSnap = await getDoc(
        doc(db, "owners", ownerId, "settings", "orderPermissions")
      );

      if (permSnap.exists()) {
        setOrderPermissions(permSnap.data());

        // default selected based on permissions
        if (!permSnap.data().inside && permSnap.data().outside) {
          setOrderType("outside");
        }
        if (permSnap.data().inside && !permSnap.data().outside) {
          setOrderType("inside");
        }
      }
    }

    fetchPermissions();
  }, [ownerId]);

  // Delivery distance logic
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    if (orderType === "outside") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });

          const dist = getDistanceFromLatLonInKm(
            shopLocation.lat,
            shopLocation.lng,
            lat,
            lng
          );

          setDistance(dist.toFixed(2));

          let charge = 0;
          if (dist <= 3) charge = 30;
          else if (dist <= 6) charge = 60;
          else if (dist <= 9) charge = 90;
          else charge = 120;

          setDeliveryCharge(charge);
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    } else {
      setDistance(0);
      setDeliveryCharge(0);
    }
  }, [orderType]);

  if (!owner || !userId) return <LoadingScreen />;

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const total = subtotal + deliveryCharge;

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    try {
      if (!userId) throw new Error("User ID missing.");

      const newOrder = {
        userId,
        ownerId,
        items: cart,
        subtotal,
        deliveryCharge,
        total,
        distance,
        status: "pending",
        orderType,
        tableNumber: orderType === "inside" ? formData.table : null,
        fullName: formData.name,
        mobile: formData.number, // 🔥 phone for both inside + outside
        address: orderType === "outside" ? formData.address : null,
        city: orderType === "outside" ? formData.city : null,
        pincode: orderType === "outside" ? formData.pincode : null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), newOrder);

      const rewardData = await addRewardOnOrder(docRef.id);
      setReward({
        rupees: rewardData?.rupees || 0,
        coins: rewardData?.coins || 0,
      });

      setFormData({
        name: "",
        number: "",
        table: "",
        address: "",
        city: "",
        pincode: "",
      });
      clearCart();
      setModalOpen(true);
    } catch (err) {
      console.error("❌ Checkout Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${mooli.className}`}>
      <ClientNav ownerId={ownerId} />
      <div
        className={`relative p-6 text-white min-h-screen pt-32 pb-28 ${mooli.className}`}
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
            <span className="text-sm">{t("back")}</span>
          </button>
          <h1 className="text-3xl font-extrabold text-yellow-400">
            {t("checkout")}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Owner Info */}
        <div className="mb-6 text-gray-300">
          <h2 className="text-lg font-semibold">{owner.restaurantName}</h2>
          <p className="text-sm">
            {t("contact")}: {owner.ownerMobile}
          </p>
        </div>

        {/* Cart Section */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 mt-20">
            <ShoppingBag className="w-16 h-16 opacity-50 mb-4" />
            <p className="text-lg">{t("cart_empty")}</p>
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div
              className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg max-w-md mx-auto"
              onClick={() => setShowDetails(!showDetails)}
            >
              <div className="flex items-center justify-between cursor-pointer">
                <h2 className="text-lg font-bold">{t("order_details")}</h2>
                <ShoppingBag
                  className={`w-6 h-6 text-yellow-400 transition-transform ${
                    showDetails ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="divide-y divide-gray-700">
                      {cart.map((item) => {
                        const displayName =
                          lang === "hi"
                            ? item.name_hi || item.name
                            : lang === "hieng"
                            ? item.name_hineng || item.name
                            : item.name;

                        return (
                          <div
                            key={item.id}
                            className="py-2 flex justify-between text-sm"
                          >
                            <span className="text-gray-200">
                              {displayName} × {item.quantity}
                            </span>
                            <span className="text-gray-300">
                              ₹{item.totalPrice}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 border-t border-gray-700 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t("subtotal")}</span>
                        <span>₹{subtotal}</span>
                      </div>

                      {orderType === "outside" && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              {t("distance")}
                            </span>
                            <span>{distance} km</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              {t("delivery_charge")}
                            </span>
                            <span>₹{deliveryCharge}</span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between text-lg font-semibold border-t border-gray-700 pt-2">
                        <span>{t("total")}</span>
                        <span className="text-yellow-400 text-xl font-bold">
                          ₹{total}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Type Selector */}
            <div className="my-6">
              <label className="block mb-2 font-semibold text-yellow-400 text-lg">
                {t("order_type")}
              </label>
              <div className="relative">
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-yellow-600 px-2 py-3 rounded-xl border border-gray-600 shadow-md"
                >
                  {orderPermissions.inside && (
                    <option value="inside">🍽️ {t("dine_in")}</option>
                  )}

                  {orderPermissions.outside && (
                    <option value="outside">🚚 {t("delivery")}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Order Form */}
            {orderType && (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-gray-800 p-6 rounded-2xl shadow-lg"
              >
                <div>
                  <label className="block mb-1">{t("name")}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t("enter_name")}
                    className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                  />
                </div>

                {/* 🔥 Phone number required for inside + outside */}
                <div>
                  <label className="block mb-1">{t("phone")}</label>
                  <input
                    type="tel"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                    placeholder={t("enter_phone")}
                    className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                  />
                </div>

                {orderType === "inside" && (
                  <div>
                    <label className="block mb-1">{t("table_number")}</label>
                    <input
                      type="text"
                      name="table"
                      value={formData.table}
                      onChange={handleChange}
                      required
                      placeholder={t("enter_table")}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                    />
                  </div>
                )}

                {orderType === "outside" && (
                  <>
                    <div>
                      <label className="block mb-1">{t("address")}</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder={t("enter_address")}
                        className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">{t("city")}</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder={t("enter_city")}
                        className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">{t("pincode")}</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        placeholder={t("enter_pincode")}
                        className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                      />
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:opacity-60 flex justify-center items-center space-x-2 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading && (
                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  )}
                  <span>{loading ? t("placing_order") : t("place_order")}</span>
                </button>
              </form>
            )}
          </>
        )}

        <OrderSuccessModal
          show={modalOpen}
          onClose={() => {
            setModalOpen(false);
            router.push(`/restaurant/${ownerId}`);
          }}
          message={t("success_message")
            .replace("{rupees}", reward.rupees)
            .replace("{coins}", reward.coins)}
          rupees={reward.rupees}
          coins={reward.coins}
        />

        <BottomNav ownerId={ownerId} cart={cart} />
      </div>
    </div>
  );
}
