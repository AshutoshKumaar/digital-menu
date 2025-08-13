"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/register");
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-400 via-sky-100 to-green-600 p-4"
      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
    >
      {loading ? (
        // Loading Spinner Screen
        <div className="flex flex-col items-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-slate-600 mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Please wait...</p>
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-lg w-96 transform transition-all duration-300 hover:shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Welcome Back
          </h2>

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="Email"
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
            Login
          </button>

          <p className="mt-4 text-sm text-center text-gray-600">
            No account?{" "}
            <a
              href="#"
              onClick={handleRegisterClick}
              className="text-green-600 hover:underline font-medium"
            >
              Register
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
