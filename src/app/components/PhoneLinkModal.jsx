"use client";
import { useState, useEffect } from "react";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  PhoneAuthProvider, // Keep PhoneAuthProvider for credential construction (though not strictly needed in the final fix)
  linkWithCredential 
} from "firebase/auth";

// Assuming '@/app/firebase/config' exports the initialized 'auth' object
// NOTE: Ensure 'auth' is exported as a standalone variable and is initialized correctly.
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
  const [successMessage, setSuccessMessage] = useState(null); // For success feedback
  const [countdown, setCountdown] = useState(0); 

  // --- 1. Lifecycle Management for reCAPTCHA ---
  // Sets up the invisible reCAPTCHA when the modal is shown.
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
      setError("Security check (reCAPTCHA) failed to load. Please try again.");
      return;
    }
    
    // Ensure we have a user before sending OTP (to link to)
    if (!auth.currentUser) {
        setError("User session lost. Please refresh the main page to re-authenticate.");
        return;
    }
    
    setLoading(true);
    try {
      confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      
      setOtpSent(true);
      setCountdown(60); 
      setSuccessMessage("OTP sent successfully! Check your phone."); 
      
    } catch (err) {
      console.error("OTP error:", err.code, err.message);
      
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Use E.164 format (e.g., +91XXXXXXXXXX).");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else if (err.code === "auth/captcha-check-failed") {
        setError("Security check failed. Please refresh and try again.");
      } else {
        setError("Failed to send OTP. Check console for details.");
      }
      setOtpSent(false); 
      
    } finally {
      setLoading(false);
    }
  };


  // --- 4. Function to Verify OTP and Link (CRITICAL FIX) ---
  const verifyOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (!confirmationResult) {
      setError("OTP not sent or session expired. Please resend OTP.");
      return;
    }
    
    setLoading(true);
    try {
      
      // 1. Confirm the OTP - This step *authenticates* the phone number.
      const result = await confirmationResult.confirm(otp);
      
      // 2. Extract the PhoneAuthCredential from the result object (This is the correct way)
      const phoneCredential = result.credential;
      
      // 3. Link the credential to the currently logged-in user (auth.currentUser)
      // This is the operation that updates the user session.
      await linkWithCredential(auth.currentUser, phoneCredential); 
      
      setSuccessMessage("✅ Phone linked successfully! Updating session...");
      
      // CRITICAL FIX: Add a short delay (1.5s) to allow onAuthStateChanged 
      // listener in the parent application to process the updated user object 
      // (which now includes the phone number) before the modal closes.
      setTimeout(() => {
          onClose();
      }, 1500); 
      
    } catch (err) {
      console.error("Link error:", err.code, err.message);
      
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please try again.");
      } else if (err.code === "auth/credential-already-in-use") {
        setError("This phone number is already linked to another account.");
      } else if (err.code === "auth/link-and-login-failure") {
        setError("Linking failed. Please try refreshing the page.");
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
            <div className="bg-red-900 text-red-300 p-2 rounded-lg text-sm mb-3 text-center animate-pulse">
                {error}
            </div>
        )}
        
        {/* Display Success Message */}
        {successMessage && (
            <div className="bg-green-800 text-green-300 p-2 rounded-lg text-sm mb-3 text-center">
                {successMessage}
            </div>
        )}

        {/* Check if user exists to prevent linking failure */}
        {!auth.currentUser && (
             <div className="bg-yellow-800 text-yellow-300 p-2 rounded-lg text-xs mb-3 text-center">
                Waiting for user session to initialize...
            </div>
        )}

        {!otpSent ? (
          <>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX (E.164 format)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 mb-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
              disabled={loading || !auth.currentUser}
            />
            <button
              onClick={sendOtp}
              // Disable if loading, phone is empty, or user is null
              disabled={loading || !phone || !auth.currentUser} 
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
              className="w-full px-3 py-2 mb-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-center tracking-widest"
            />
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full bg-green-500 text-black font-semibold py-2 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 hover:opacity-90"
            >
              {loading ? "Verifying..." : "Verify & Link"}
            </button>

            {/* Resend OTP Button with Countdown */}
            <div className="mt-3 text-center">
                {countdown > 0 ? (
                    <span className="text-gray-400 text-sm">Resend in <span className="font-bold text-green-500">{countdown}s</span></span>
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
        
        {/* Recaptcha Container - MUST be visible in the DOM, hidden by CSS for invisible mode */}
        <div id="recaptcha-container" style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none' }} className="z-70"></div>

        <button 
          onClick={onClose} 
          className="mt-4 text-gray-400 text-sm hover:text-gray-200 w-full text-center border-t border-gray-700 pt-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
