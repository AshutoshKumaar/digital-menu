"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";


export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [mobile, setMobile] = useState(""); // ✅ New state
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      await setDoc(doc(db, "owners", uid), {
        restaurantName: restaurantName || "My Restaurant",
        ownerEmail: email,
        ownerPassword: password,
        ownerUid: uid,
        ownerMobile: mobile, // ✅ Save mobile
        createdAt: serverTimestamp(),
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-400 via-sky-100 to-green-600 p-4"
      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
    >
      {loading ? (
        // Loading Screen
        <div className="flex flex-col items-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-slate-600 mb-4"></div>
          <p className="text-lg font-medium text-slate-600">Please wait...</p>
        </div>
      ) : (
        <form
          onSubmit={handleRegister}
          className="bg-white p-8 rounded-2xl shadow-lg w-96 transform transition-all duration-300 hover:shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Owner Registration
          </h2>

          <input
            required
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="Restaurant name"
          />

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="Email"
          />

          {/* ✅ Mobile Number Input */}
          <input
            required
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="Mobile Number"
          />

          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 mb-6 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="Password"
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Create Account
          </button>

          <p className="mt-4 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <a
              href="#"
              onClick={handleLoginClick}
              className="text-green-600 hover:underline font-medium"
            >
              Login
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
