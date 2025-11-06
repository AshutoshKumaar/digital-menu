// components/PhoneLinkModal.jsx
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  PhoneAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/app/firebase/config";

const MODE = { LINK: "LINK", SIGN_IN: "SIGN_IN" };

export default function PhoneLinkModal({ show, onClose }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const recaptchaRef = useRef(null);
  const confirmationRef = useRef(null);

  const currentMode = useMemo(() => (auth.currentUser ? MODE.LINK : MODE.SIGN_IN), [show, auth.currentUser]);

  // Lifecycle: init recaptcha when modal shows
  useEffect(() => {
    if (!show) return;

    setError(null);
    setSuccessMessage(null);

    // Create recaptcha only once per modal open
    if (!recaptchaRef.current && typeof window !== "undefined") {
      const container = document.getElementById("recaptcha-container");
      try {
        recaptchaRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: (token) => {
              // solved
            },
            "expired-callback": () => {
              setError("Security check expired. Please try again.");
              try {
                recaptchaRef.current?.clear();
              } catch (e) {}
              recaptchaRef.current = null;
            },
          }
        );
        // render returns promise-like but not necessary to await
        recaptchaRef.current.render?.();
      } catch (err) {
        console.error("reCAPTCHA init failed:", err);
        setError("Security check could not initialize. Refresh page and try again.");
      }
    }

    // Cleanup on close/unmount
    return () => {
      try {
        recaptchaRef.current?.clear?.();
        recaptchaRef.current = null;
        confirmationRef.current = null;
      } catch (e) {
        // ignore
      }
    };
  }, [show]);

  // resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!phone.startsWith("+")) {
      setError("Please include country code (e.g., +91).");
      return;
    }
    if (!recaptchaRef.current) {
      setError("Security check not ready. Please refresh and try again.");
      return;
    }
    if (currentMode === MODE.LINK && !auth.currentUser) {
      setError("Your session expired. Please open login flow again.");
      return;
    }

    setLoading(true);
    try {
      confirmationRef.current = await signInWithPhoneNumber(auth, phone, recaptchaRef.current);
      setOtpSent(true);
      setCountdown(60);
      setSuccessMessage("OTP sent — check your phone.");
    } catch (err) {
      console.error("sendOtp error:", err);
      if (err.code === "auth/invalid-phone-number") setError("Invalid phone number format.");
      else if (err.code === "auth/too-many-requests") setError("Too many requests. Please try later.");
      else setError("Unable to send OTP. Check console.");
      setOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  const finalizeAuth = async () => {
    // Wait for onAuthStateChanged to reflect new user
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) {
          try {
            localStorage.setItem("userId", u.uid);
          } catch (e) {}
          unsub();
          resolve(u);
        }
      });
      // safety timeout - if no change, resolve with current user after short wait
      setTimeout(() => {
        try {
          localStorage.setItem("userId", auth.currentUser?.uid || "");
        } catch (e) {}
        try {
          unsub();
        } catch (e) {}
        resolve(auth.currentUser);
      }, 3000);
    });
  };

  const verifyOtp = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!confirmationRef.current) {
      setError("OTP session expired. Please resend OTP.");
      return;
    }
    if (otp.length < 4) {
      setError("Enter valid OTP.");
      return;
    }

    setLoading(true);
    try {
      if (currentMode === MODE.SIGN_IN) {
        // Confirm sign-in
        await confirmationRef.current.confirm(otp);

        // Wait for auth state to update and persist uid
        const user = await finalizeAuth();

        setSuccessMessage("Signed in successfully!");
        // allow UI to show success, then close
        setTimeout(() => {
          onClose?.(user?.uid);
        }, 800);
      } else {
        // LINK mode: create credential and link to current user
        const phoneCredential = PhoneAuthProvider.credential(confirmationRef.current.verificationId, otp);
        if (!phoneCredential) {
          setError("Could not create phone credential. Please resend OTP.");
          setLoading(false);
          return;
        }

        await linkWithCredential(auth.currentUser, phoneCredential);

        // After linking, auth.currentUser should now have phoneNumber and persisted UID unchanged
        const user = await finalizeAuth();

        setSuccessMessage("Phone linked successfully!");
        setTimeout(() => {
          onClose?.(user?.uid);
        }, 1000);
      }
    } catch (err) {
      console.error("verifyOtp error:", err);
      if (err.code === "auth/invalid-verification-code") setError("Invalid OTP.");
      else if (err.code === "auth/credential-already-in-use") setError("This phone number is already linked to another account.");
      else setError("Authentication failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const modalTitle = currentMode === MODE.LINK ? "Link Your Phone" : "Sign In with Phone";
  const buttonText = currentMode === MODE.LINK ? "Verify & Link" : "Verify & Sign In";
  const userStatusMessage = currentMode === MODE.LINK ? "Linking to your current session..." : "Sign in to enable orders & rewards";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-80 shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">{modalTitle}</h2>

        {error && <div className="bg-red-900/40 text-red-300 p-3 rounded-lg text-sm mb-3 text-center border border-red-800">{error}</div>}
        {successMessage && <div className="bg-green-800/40 text-green-300 p-3 rounded-lg text-sm mb-3 text-center border border-green-700">{successMessage}</div>}

        <div className="bg-gray-800/50 text-gray-400 p-2 rounded-lg text-xs mb-3 text-center border border-gray-700">{userStatusMessage}</div>

        {!otpSent ? (
          <>
            <input type="tel" placeholder="+91XXXXXXXXXX (E.164)" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} className="w-full px-3 py-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 text-white" />
            <button onClick={sendOtp} disabled={loading || !phone} className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold disabled:opacity-50">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="w-full px-3 py-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 text-white text-center" />
            <button onClick={verifyOtp} disabled={loading || otp.length < 4} className="w-full bg-green-500 text-black py-3 rounded-lg font-semibold disabled:opacity-50">
              {loading ? "Verifying..." : buttonText}
            </button>

            <div className="mt-4 text-center">
              {countdown > 0 ? <span className="text-gray-400 text-sm">Resend in <b className="text-green-400">{countdown}s</b></span> : <button onClick={sendOtp} disabled={loading} className="text-blue-400 text-sm">Resend OTP</button>}
            </div>
          </>
        )}

        <div id="recaptcha-container" style={{ position: "absolute", top: 0, left: 0, opacity: 0, pointerEvents: "none" }} />

        <button onClick={() => onClose?.()} className="mt-6 text-gray-400 text-sm hover:text-gray-200 w-full text-center border-t border-gray-700 pt-3">Cancel</button>
      </div>
    </div>
  );
}
