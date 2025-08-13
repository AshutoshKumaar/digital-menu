"use client";
import { useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

export default function PhoneAuth({ restaurantId, cartData }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || `/restaurant/${restaurantId}/my-orders`;

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  };

  const sendOtp = async () => {
    if (!phone) return alert("Enter phone number");
    setLoading(true);
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, "+91" + phone, appVerifier);
      setConfirmResult(result);
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || !confirmResult) return alert("Enter OTP");
    setLoading(true);

    try {
      const result = await confirmResult.confirm(otp);
      const user = result.user;

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          phone: user.phoneNumber,
          createdAt: serverTimestamp(),
        });
      }

      // Save cart/order data here if needed
      // e.g., store in Firestore 'orders' collection
      if (cartData && cartData.length > 0) {
        await setDoc(doc(db, "orders", `${user.uid}_${Date.now()}`), {
          uid: user.uid,
          restaurantId,
          items: cartData,
          status: "pending",
          createdAt: serverTimestamp(),
        });
      }

      router.push(redirectPath);
    } catch (err) {
      console.error(err);
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {!confirmResult ? (
        <>
          <input
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <div id="recaptcha-container"></div>
          <button onClick={sendOtp} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <button onClick={verifyOtp} className="bg-green-500 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}
    </div>
  );
}
