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
const mooli = Mooli({ weight: "400", subsets: ["latin"] });

export default function CheckoutClient({ ownerId }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [owner, setOwner] = useState(null);
  const [orderType, setOrderType] = useState("inside"); // inside / outside
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    table: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false); // ✅ Loading state

  const { cart, clearCart } = useCart();
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const [rewardMessage, setRewardMessage] = useState("");
  const [reward, setReward] = useState(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchOwner() {
      const docSnap = await getDoc(doc(db, "owners", ownerId));
      if (docSnap.exists()) setOwner(docSnap.data());
    }
    if (ownerId) fetchOwner();
  }, [ownerId]);

  if (!owner) return <LoadingScreen />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start loading
    try {
      const userId = getUserId();

      const newOrder = {
        userId,
        ownerId,
        items: cart,
        subtotal,
        total: subtotal,
        status: "pending",
        orderType,
        tableNumber: orderType === "inside" ? formData.table : null,
        fullName: formData.name,
        mobile: formData.number,
        address: orderType === "outside" ? formData.address : null,
        city: orderType === "outside" ? formData.city : null,
        pincode: orderType === "outside" ? formData.pincode : null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), newOrder);
      console.log("✅ Order placed with ID:", docRef.id);
      // Add reward
      const rewardData = await addRewardOnOrder(docRef.id);
      setReward(rewardData);
      console.log("🎁 Reward Earned:", rewardData);

      // Clear form and cart
      setFormData({
        name: "",
        number: "",
        table: "",
        address: "",
        city: "",
        pincode: "",
      });
      clearCart();

      // Show modal
      setModalOpen(true);
      setRewardMessage(`🎉 Congratulations! You earned ₹${rewardData.rupees} and ${rewardData.coins} coins 🎁`);
    } catch (err) {
      console.error("❌ Firestore Error:", err.message);
    } finally {
      setLoading(false); // stop loading
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

      {/* Cart Items */}
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400 mt-20">
          <ShoppingBag className="w-16 h-16 opacity-50 mb-4" />
          <p className="text-lg">Your cart is empty.</p>
        </div>
      ) : (
        <>
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
                  transition={{ duration: 0.3, ease: "easeInOut" }}
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

                  <div className="mt-4 border-t border-gray-700 pt-4 flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold text-yellow-400">
                      ₹{subtotal}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Type Selector */}
          <div className="my-6">
            <label className="block mb-2 font-semibold text-yellow-400 text-lg">
              Order Type
            </label>
            <div className="relative">
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full appearance-none bg-gradient-to-r from-gray-800 to-gray-900 text-yellow-600 px-2 py-3 rounded-xl border border-gray-600 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition cursor-pointer"
              >
                <option value="" disabled>
                  🚀 Select Order Type
                </option>
                <option value="inside">🍽️ Dine-In (Inside)</option>
                <option value="outside">🚚 Delivery (Outside)</option>
              </select>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-yellow-400">
                ▼
              </span>
            </div>
          </div>

          {/* Form */}
          {orderType && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 bg-gray-800 p-6 rounded-2xl shadow-lg"
            >
              {/* Inside: Only Name + Table */}
              {orderType === "inside" && (
                <>
                  <div>
                    <label className="block mb-1">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Your Name"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Table Number:</label>
                    <input
                      type="text"
                      name="table"
                      value={formData.table}
                      onChange={handleChange}
                      placeholder="Enter Your Table Number"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                    />
                  </div>
                </>
              )}

              {/* Outside: Full details */}
              {orderType === "outside" && (
                <>
                  <div>
                    <label className="block mb-1">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Phone Number:</label>
                    <input
                      type="tel"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
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
                      placeholder="Enter your delivery address"
                      required
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
                      placeholder="Enter your city"
                      required
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
                      placeholder="Enter your area pincode"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-600"
                    />
                  </div>
                </>
              )}

              {/* Place Order Button with spinner */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:opacity-60 active:scale-95 flex justify-center items-center space-x-2 ${
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

      {/* Modal */}
      <OrderSuccessModal
  show={modalOpen}
  onClose={() => {
    setModalOpen(false);
    router.push(`/restaurant/${ownerId}`);
  }}
  message={rewardMessage}
  rupees={reward?.rupees}
  coins={reward?.coins}
/>
      <BottomNav ownerId={ownerId} cart={cart} />
    </div>
  );
}
