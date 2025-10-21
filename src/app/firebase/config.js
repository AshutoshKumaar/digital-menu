import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging"; // merged imports ✅

// -----------------------------
// 🔹 Firebase Configuration
// -----------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// -----------------------------
// 🔹 Initialize Firebase App
// -----------------------------
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// -----------------------------
// 🔹 Export Core Services
// -----------------------------
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Disable reCAPTCHA only for local development (for testing OTP)
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  try {
    auth.settings.appVerificationDisabledForTesting = false
        console.log("✅ App verification disabled for localhost testing");
  } catch (err) {
    console.warn("⚠️ Could not disable app verification:", err);
  }
}

// -----------------------------
// 🔹 Analytics (Client Only)
// -----------------------------
let analytics;
if (typeof window !== "undefined" && "measurementId" in firebaseConfig) {
  analytics = getAnalytics(app);
}

// -----------------------------
// 🔹 Messaging (for FCM)
// -----------------------------
let messaging;
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn("⚠️ Firebase Messaging not supported in this environment", err);
  }
}

// -----------------------------
// 🔹 Get FCM Token Helper
// -----------------------------
export const getFCMToken = async () => {
  if (!messaging) return null;

  try {
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      console.log("FCM Token:", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
    return null;
  }
};

export { RecaptchaVerifier, signInWithPhoneNumber, analytics, logEvent, messaging };
