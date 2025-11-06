// components/CheckoutClient.jsx
"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
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

const mooli = Mooli({ weight: "400", subsets: ["latin"] });

export default function CheckoutClient({ ownerId }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [owner, setOwner] = useState(null);
  const [orderType, setOrderType] = useState("inside");
  const [reward, setReward] = useState({ rupees: 0, coins: 0 });
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

  // 🧭 Restaurant fixed location (change this as per your shop)
  const shopLocation = { lat: 25.54544988021849, lng: 87.56932047791145 };

  // 📍 Distance + delivery charge states
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // ✅ Load anonymous / logged-in user
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

  // ✅ Fetch owner info
  useEffect(() => {
    async function fetchOwner() {
      if (!ownerId) return;
      const docSnap = await getDoc(doc(db, "owners", ownerId));
      if (docSnap.exists()) setOwner(docSnap.data());
    }
    fetchOwner();
  }, [ownerId]);

  // 🧭 Distance Calculation Formula
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // 📏 Auto Calculate Delivery Distance & Charge
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

  if (!owner || !userId) return <LoadingScreen />; // Wait for both owner info AND userId

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const total = subtotal + deliveryCharge;

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
        mobile: orderType === "outside" ? formData.number : null,
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
        <h1 className="text-2xl font-extrabold text-yellow-400">Checkout</h1>
        <div className="w-10"></div>
      </div>

      {/* Owner Info */}
      <div className="mb-6 text-gray-300">
        <h2 className="text-lg font-semibold">{owner.restaurantName}</h2>
        <p className="text-sm">Contact: {owner.ownerMobile}</p>
      </div>

      {/* Cart */}
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400 mt-20">
          <ShoppingBag className="w-16 h-16 opacity-50 mb-4" />
          <p className="text-lg">Your cart is empty.</p>
        </div>
      ) : (
        <>
          {/* Order Details */}
          <div
            className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg max-w-md mx-auto"
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className="flex items-center justify-between cursor-pointer">
              <h2 className="text-lg font-bold">Order Details</h2>
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
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="py-2 flex justify-between text-sm"
                      >
                        <span className="text-gray-200">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-gray-300">
                          ₹{item.totalPrice}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>

                    {orderType === "outside" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Distance</span>
                          <span>{distance} km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Delivery Charge</span>
                          <span>₹{deliveryCharge}</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between text-lg font-semibold border-t border-gray-700 pt-2">
                      <span>Total</span>
                      <span className="text-yellow-400 text-xl font-bold">
                        ₹{total}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Type */}
          <div className="my-6">
            <label className="block mb-2 font-semibold text-yellow-400 text-lg">
              Order Type
            </label>
            <div className="relative">
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-yellow-600 px-2 py-3 rounded-xl border border-gray-600 shadow-md"
              >
                <option value="inside">🍽️ Dine-In (Inside)</option>
                <option value="outside">🚚 Delivery (Outside)</option>
              </select>
            </div>
          </div>

          {/* Form */}
          {orderType && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 bg-gray-800 p-6 rounded-2xl shadow-lg"
            >
              <div>
                <label className="block mb-1">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                />
              </div>

              {orderType === "inside" && (
                <div>
                  <label className="block mb-1">Table Number:</label>
                  <input
                    type="text"
                    name="table"
                    value={formData.table}
                    onChange={handleChange}
                    required
                    placeholder="Enter your table number"
                    className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                  />
                </div>
              )}

              {orderType === "outside" && (
                <>
                  <div>
                    <label className="block mb-1">Phone Number:</label>
                    <input
                      type="tel"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      required
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Address:</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter your delivery address"
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">City:</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Enter your city"
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Pincode:</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      placeholder="Enter your area pincode"
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                    />
                  </div>
                </>
              )}

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
                <span>{loading ? "Placing Order..." : "Place Order"}</span>
              </button>
            </form>
          )}
        </>
      )}

      {/* ✅ Success Modal */}
      <OrderSuccessModal
        show={modalOpen}
        onClose={() => {
          setModalOpen(false);
          router.push(`/restaurant/${ownerId}`);
        }}
        message={`🎉 Congratulations! You earned ₹${reward.rupees} and ${reward.coins} coins!`}
        rupees={reward.rupees}
        coins={reward.coins}
      />

      <BottomNav ownerId={ownerId} cart={cart} />
    </div>
  );
}
