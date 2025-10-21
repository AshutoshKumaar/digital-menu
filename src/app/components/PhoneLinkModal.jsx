"use client";
import { useState, useEffect } from "react";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  linkWithCredential 
} from "firebase/auth";

// Assuming '@/app/firebase/config' exports the initialized 'auth' object
import { auth } from "@/app/firebase/config";

// Global variable for reCAPTCHA - better to manage its lifecycle
let recaptchaVerifier;
let confirmationResult;

export default function PhoneLinkModal({ show, onClose }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // To display user-friendly errors
  const [countdown, setCountdown] = useState(0); // For Resend OTP timer

  // --- 1. Lifecycle Management for reCAPTCHA ---
  // Ensure the reCAPTCHA verifier is set up when the component mounts
  useEffect(() => {
    if (show && !recaptchaVerifier) {
      // 1. Initialize RecaptchaVerifier on a valid element ID
      try {
        recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: (response) => {
            // Optional: called when reCAPTCHA is successfully solved
            console.log("reCAPTCHA solved:", response);
          },
          'expired-callback': () => {
            // Optional: called when the reCAPTCHA token expires
            console.warn("reCAPTCHA expired. Please retry.");
            recaptchaVerifier.render().then(widgetId => grecaptcha.reset(widgetId));
          }
        });
        recaptchaVerifier.render(); // Explicitly render it
      } catch (err) {
        console.error("reCAPTCHA initialization failed:", err);
        setError("Setup error. Please refresh the page.");
      }
    }
  }, [show]); // Rerun when the modal visibility changes

  // --- 2. Countdown Timer for Resend OTP ---
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);


  // --- 3. Function to Send OTP (with E.164 format check) ---
  const sendOtp = async () => {
    setError(null);
    if (!phone.startsWith('+')) {
      setError("Please include the country code (e.g., +91).");
      return;
    }
    if (!recaptchaVerifier) {
        setError("Security check (reCAPTCHA) failed to load. Please try again.");
        return;
    }
    
    setLoading(true);
    try {
      // Use the global confirmationResult
      confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      
      setOtpSent(true);
      setCountdown(60); // Start 60-second timer
      alert("OTP sent successfully! Check your phone.");
      
    } catch (err) {
      console.error("OTP error:", err.code, err.message);
      
      // Better User Feedback based on common Firebase errors
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Use E.164 format (e.g., +91XXXXXXXXXX).");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else if (err.code === "auth/captcha-check-failed") {
        setError("Security check failed. Please refresh and try again.");
      } else {
        setError("Failed to send OTP. Check console for details.");
      }
      setOtpSent(false); // Stay on phone entry screen if sending failed
      
    } finally {
      setLoading(false);
    }
  };


  // --- 4. Function to Verify OTP and Link ---
  const verifyOtp = async () => {
    setError(null);
    if (!confirmationResult) {
        setError("OTP not sent or session expired. Please resend OTP.");
        return;
    }
    
    setLoading(true);
    try {
      // NOTE: Your original code had 'verificationId' which is for legacy SDK, 
      // the new SDK handles it internally using confirmationResult.
      
      const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
      
      // Link the phone number to the currently logged-in user
      await linkWithCredential(auth.currentUser, credential); 
      
      alert("✅ Phone linked successfully!");
      onClose();
      
    } catch (err) {
      console.error("Link error:", err.code, err.message);
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please try again.");
      } else {
        setError("Failed to link phone. Check console for details.");
      }
      
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-80">
        <h2 className="text-xl font-bold mb-4 text-center">📱 Link Your Phone</h2>

        {/* Display Error Message */}
        {error && (
            <div className="bg-red-900 text-red-300 p-2 rounded-lg text-sm mb-3 text-center">
                {error}
            </div>
        )}

        {!otpSent ? (
          <>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX (E.164 format)" // Updated placeholder
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 mb-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
            <button
              onClick={sendOtp}
              disabled={loading || !phone || loading || (countdown > 0)}
              className="w-full bg-yellow-500 text-black font-semibold py-2 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 hover:opacity-90"
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
              className="w-full px-3 py-2 mb-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
            <button
              onClick={verifyOtp}
              disabled={loading || !otp}
              className="w-full bg-green-500 text-black font-semibold py-2 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 hover:opacity-90"
            >
              {loading ? "Verifying..." : "Verify & Link"}
            </button>

            {/* Resend OTP Button with Countdown */}
            <div className="mt-3 text-center">
                {countdown > 0 ? (
                    <span className="text-gray-400 text-sm">Resend in {countdown}s</span>
                ) : (
                    <button 
                        onClick={sendOtp}
                        disabled={loading}
                        className="text-blue-400 text-sm hover:text-blue-300 disabled:opacity-50"
                    >
                        Resend OTP
                    </button>
                )}
            </div>
          </>
        )}
        
        {/* Recaptcha Container - MUST be visible in the DOM */}
        <div id="recaptcha-container" className="z-70 absolute top-20"></div>

        <button 
          onClick={onClose} 
          className="mt-4 text-gray-400 text-sm hover:text-gray-200 w-full text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}