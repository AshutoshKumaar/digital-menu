"use client";
import { useState, useEffect } from "react";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  linkWithCredential 
} from "firebase/auth";

// Assuming 'auth' is correctly initialized and exported from your config
import { auth } from "@/app/firebase/config"; 

// Global variable for reCAPTCHA and confirmation result
let recaptchaVerifier;
let confirmationResult;

export default function PhoneLinkModal({ show, onClose }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const [successMessage, setSuccessMessage] = useState(null); 
  const [countdown, setCountdown] = useState(0); 

  // --- 1. Lifecycle Management for reCAPTCHA ---
  useEffect(() => {
    if (show && !recaptchaVerifier && auth) {
      setError(null);
      setSuccessMessage(null);
      
      try {
        recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved:", response);
          },
          'expired-callback': () => {
            console.warn("reCAPTCHA expired. Please retry.");
            if (window.grecaptcha && recaptchaVerifier) {
                recaptchaVerifier.clear();
            }
            setError("Security check expired. Please try again.");
          }
        });
        recaptchaVerifier.render(); 
        
      } catch (err) {
        console.error("reCAPTCHA initialization failed:", err);
        setError("Security check setup failed. Please refresh the page.");
      }
    }
    
    // Cleanup function: Clear the reCAPTCHA instance when the modal closes
    return () => {
        if (!show && recaptchaVerifier) {
            if (window.grecaptcha && recaptchaVerifier.widgetId !== undefined) {
                try {
                    window.grecaptcha.reset(recaptchaVerifier.widgetId);
                } catch (e) {
                    console.warn("Could not reset reCAPTCHA widget:", e);
                }
            }
        }
    };
  }, [show]); 

  // --- 2. Countdown Timer for Resend OTP ---
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);


  // --- 3. Function to Send OTP ---
  const sendOtp = async () => {
    setError(null);
    setSuccessMessage(null); 
    
    if (!phone.startsWith('+')) {
      setError("Please include the country code (e.g., +91).");
      return;
    }
    if (!recaptchaVerifier) {
      setError("Security check failed to load.");
      return;
    }
    
    // Ensure Current User exists before starting the linking process
    if (!auth.currentUser) {
        setError("User session expired. Please refresh the main page.");
        return;
    }
    
    setLoading(true);
    try {
      // Start phone number sign-in/verification process
      confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      
      setOtpSent(true);
      setCountdown(60); 
      setSuccessMessage("OTP sent successfully! Check your phone."); 
      
    } catch (err) {
      console.error("OTP error:", err.code, err.message);
      
      if (err.code === "auth/invalid-app-credential") { 
         setError("Configuration Error: Firebase API Key or Authorized Domains are incorrect. Please check settings.");
      } else if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Use E.164 format (e.g., +91XXXXXXXXXX).");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to send OTP. See console for details.");
      }
      setOtpSent(false); 
      
    } finally {
      setLoading(false);
    }
  };


  // --- 4. Function to Verify OTP and Link ---
  const verifyOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (!confirmationResult) {
      setError("OTP not sent or session expired. Please resend OTP.");
      return;
    }
    
    setLoading(true);
    try {
      
      // 1. Confirm the OTP
      const result = await confirmationResult.confirm(otp);
      
      // CRITICAL FIX 1: Ensure result is valid
      if (!result) {
          setError("OTP verification failed. Please try again.");
          setLoading(false);
          return;
      }
      
      // 2. Extract the PhoneAuthCredential (after successful confirmation)
      const phoneCredential = result.credential;
      
      // CRITICAL FIX 2: Ensure credential exists before attempting to link
      if (!phoneCredential) {
          setError("Verification successful but credential was not received. Please resend OTP.");
          console.error("Link error: Confirmation succeeded, but result.credential was null/undefined.");
          setLoading(false);
          return;
      }

      // 3. Link the Credential to the Current Logged-in User
      await linkWithCredential(auth.currentUser, phoneCredential); 
      
      setSuccessMessage("✅ Phone linked successfully! Updating session...");
      
      // CRITICAL FIX 3: 2-second delay for onAuthStateChanged listener to update global state
      setTimeout(() => {
          console.log("Session update delay complete. Closing modal.");
          onClose();
      }, 2000); 
      
    } catch (err) {
      console.error("Link error:", err.code, err.message);
      
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please try again.");
      } else if (err.code === "auth/credential-already-in-use") {
        setError("This phone number is already linked to another account.");
      } else {
        setError("Failed to link phone. See console for details.");
      }
      
    } finally {
      if (loading) setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-80 shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">📱 Link Your Phone</h2>

        {/* Display Error Message */}
        {error && (
            <div className="bg-red-900/40 text-red-300 p-3 rounded-lg text-sm mb-3 text-center border border-red-800 animate-pulse">
                {error}
            </div>
        )}
        
        {/* Display Success Message */}
        {successMessage && (
            <div className="bg-green-800/40 text-green-300 p-3 rounded-lg text-sm mb-3 text-center border border-green-700">
                {successMessage}
            </div>
        )}

        {/* Check if user exists to prevent linking failure */}
        {!auth.currentUser && (
             <div className="bg-yellow-800/40 text-yellow-300 p-2 rounded-lg text-xs mb-3 text-center border border-yellow-700">
                Waiting for user session to start...
            </div>
        )}

        {!otpSent ? (
          <>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX (E.164 Format)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-150"
              disabled={loading || !auth.currentUser}
            />
            <button
              onClick={sendOtp}
              disabled={loading || !phone || !auth.currentUser} 
              className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 hover:bg-yellow-400 active:bg-yellow-600"
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
              maxLength={6}
              className="w-full px-3 py-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 text-white text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
            />
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full bg-green-500 text-black font-semibold py-3 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 hover:bg-green-400 active:bg-green-600"
            >
              {loading ? "Verifying..." : "Verify & Link"}
            </button>

            {/* Resend OTP Button with Countdown */}
            <div className="mt-4 text-center">
                {countdown > 0 ? (
                    <span className="text-gray-400 text-sm">
                        Resend in <span className="font-bold text-green-500">{countdown}s</span>
                    </span>
                ) : (
                    <button 
                        onClick={sendOtp}
                        disabled={loading}
                        className="text-blue-400 text-sm hover:text-blue-300 disabled:opacity-50 font-medium"
                    >
                        Resend OTP
                    </button>
                )}
            </div>
          </>
        )}
        
        {/* Recaptcha Container - Must be in the DOM */}
        <div id="recaptcha-container" style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none' }} className="z-70"></div>

        <button 
          onClick={onClose} 
          className="mt-6 text-gray-400 text-sm hover:text-gray-200 w-full text-center border-t border-gray-700 pt-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
