// utils/getUserId.js
import { getAuth, signInAnonymously } from "firebase/auth";
import { auth } from "@/app/firebase/config"; // Assuming 'auth' is exported from your config

/**
 * Checks for an existing user or signs in anonymously to get a stable UID.
 * This UID is used for orders and rewards, even for guests.
 * * @returns {Promise<{uid: string, isAnonymous: boolean} | null>} User data or null if SSR.
 */
export async function getUserId() {
  if (typeof window === "undefined") return null; // Server-Side Rendering (SSR) safety

  const authInstance = getAuth();
  let user = authInstance.currentUser;
  console.log("currentUser:", user);

  try {
    if (!user) {
      // User is not logged in, perform anonymous sign-in
      console.log("🧩 User not found. Attempting Anonymous Sign-in...");
      const result = await signInAnonymously(authInstance);
      user = result.user;
    }
    
    // Save UID locally for a temporary offline fallback
    localStorage.setItem("userId", user.uid);
    
    return { uid: user.uid, isAnonymous: user.isAnonymous };

  } catch (err) {
    console.error("❌ Firebase anonymous sign-in error:", err);

    // Fallback: Use local ID (useful if offline or sign-in failed)
    let localId = localStorage.getItem("userId");
    if (!localId) {
      localId = crypto.randomUUID();
      localStorage.setItem("userId", localId);
    }
    // Note: If using localId, Firestore operations will fail unless the user logs in later.
    return { uid: localId, isAnonymous: true };
  }
}