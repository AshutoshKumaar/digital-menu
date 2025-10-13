"use client";
import { useState } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, linkWithCredential } from "firebase/auth";
import {  auth } from "@/app/firebase/config";

export default function PhoneLinkModal({ show, onClose }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  

  const sendOtp = async () => {
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
      const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
    } catch (err) {
      console.error("OTP error:", err);
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const { verificationId } = window.confirmationResult;
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await linkWithCredential(auth.currentUser, credential);
      alert("✅ Phone linked successfully!");
      onClose();
    } catch (err) {
      console.error("Link error:", err);
      alert("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-80">
        <h2 className="text-xl font-bold mb-4 text-center">📱 Link Your Phone</h2>

        {!otpSent ? (
          <>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 mb-3 rounded-lg bg-gray-800 border border-gray-700"
            />
            <button
              onClick={sendOtp}
              disabled={loading || !phone}
              className="w-full bg-yellow-500 text-black font-semibold py-2 rounded-lg hover:opacity-80"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 mb-3 rounded-lg bg-gray-800 border border-gray-700"
            />
            <button
              onClick={verifyOtp}
              disabled={loading || !otp}
              className="w-full bg-green-500 text-black font-semibold py-2 rounded-lg hover:opacity-80"
            >
              {loading ? "Verifying..." : "Verify & Link"}
            </button>
          </>
        )}
        <div id="recaptcha-container" className="z-70 absolute top-20"></div>

        <button onClick={onClose} className="mt-4 text-gray-400 text-sm hover:text-gray-200 w-full text-center">
          Cancel
        </button>
      </div>
    </div>
  );
}
