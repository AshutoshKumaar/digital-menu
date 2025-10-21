"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useRouter } from "next/navigation";
import { Josefin_Sans } from "next/font/google";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/app/firebase/config"; // ✅ your Firebase initialized file

const josefin = Josefin_Sans({ subsets: ["latin"] });

// 🌍 Country → State → District data
const locationData = {
  India: {
    Bihar: ["Katihar", "Purnia", "Patna", "Bhagalpur"],
    "Uttar Pradesh": ["Lucknow", "Varanasi", "Noida"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  },
  Nepal: {
    Province1: ["Biratnagar", "Dharan"],
    Province2: ["Janakpur", "Siraha"],
  },
};

// ✅ Zod Schema
const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  country: z.string().min(1, "Select your country"),
  state: z.string().min(1, "Select your state"),
  district: z.string().min(1, "Select your district"),
  agentCode: z
    .string()
    .min(1, "Agent Code is required")
    .refine((code) => code === "AGENT123", {
      message: "Invalid Agent Code. Registration not completed.",
    }),
});

export default function Registration() {
  const router = useRouter();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");

  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  useEffect(() => {
    if (selectedCountry) {
      setStates(Object.keys(locationData[selectedCountry]));
      setValue("state", "");
      setValue("district", "");
      setDistricts([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      setDistricts(locationData[selectedCountry][selectedState] || []);
      setValue("district", "");
    }
  }, [selectedState]);

  const onSubmit = async (data) => {
    setLoading(true);
    setFirebaseError("");

    try {
      // ✅ 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // ✅ 2. Save data in Firestore (salespersons/{uid})
      await setDoc(doc(db, "salespersons", user.uid), {
        uid: user.uid,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        state: data.state,
        district: data.district,
        agentCode: data.agentCode,
        createdAt: serverTimestamp(),
      });

      alert("✅ Registration Successful!");
      router.push("/staff-registration/staff-login"); // redirect after success
    } catch (error) {
      console.error("Error during registration:", error);
      setFirebaseError(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={josefin.className}>
      {/* Static Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </nav>

      {/* Registration Section */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white pt-28 pb-6 px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-5 border border-gray-100"
        >
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-4">
            Create Your Account
          </h2>

          {firebaseError && (
            <p className="text-red-500 text-center text-sm">
              {firebaseError}
            </p>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              {...register("fullName")}
              placeholder="Enter your full name"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register("email")}
              placeholder="Enter your email address"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              {...register("phone")}
              placeholder="Enter 10-digit phone number"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="Create a secure password"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              {...register("country")}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="">Select Country</option>
              {Object.keys(locationData).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm">{errors.country.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              State
            </label>
            <select
              {...register("state")}
              disabled={!selectedCountry}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-500 text-sm">{errors.state.message}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              District
            </label>
            <select
              {...register("district")}
              disabled={!selectedState}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100"
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-red-500 text-sm">
                {errors.district.message}
              </p>
            )}
          </div>

          {/* Agent Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Agent Code
            </label>
            <input
              {...register("agentCode")}
              placeholder="Enter your agent code"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            {errors.agentCode && (
              <p className="text-red-500 text-sm">
                {errors.agentCode.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            } text-white py-3 rounded-lg font-semibold transition-all`}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* 🔗 Login Redirect */}
          <p className="text-center text-sm text-gray-600 mt-3">
            Already have an account?{" "}
            <span
              onClick={() => router.push("staff-registration/staff-login")}
              className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Login here
            </span>
          </p>
        </form>
      </div>

      <Footer />
    </div>
  );
}
