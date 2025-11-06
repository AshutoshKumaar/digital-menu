// utils/getUserId.js
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";

/**
 * Returns { uid, isAnonymous } or null (if SSR).
 * Guarantees it resolves only after Firebase auth state is settled.
 */
export async function getUserId() {
  if (typeof window === "undefined") return null;

  return new Promise((resolve) => {
    // Listen for current auth state once
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        // If already signed in, return immediately
        if (user) {
          localStorage.setItem("userId", user.uid);
          unsubscribe();
          resolve({ uid: user.uid, isAnonymous: user.isAnonymous });
          return;
        }

        // If no user, attempt anonymous sign-in so we always have a stable UID
        const result = await signInAnonymously(auth);
        const anonUser = result.user;
        if (anonUser) {
          localStorage.setItem("userId", anonUser.uid);
          unsubscribe();
          resolve({ uid: anonUser.uid, isAnonymous: anonUser.isAnonymous });
          return;
        }

        // Fallback: localStorage-only id (very rare)
        let localId = localStorage.getItem("userId");
        if (!localId) {
          localId = crypto.randomUUID();
          localStorage.setItem("userId", localId);
        }
        unsubscribe();
        resolve({ uid: localId, isAnonymous: true });
      } catch (err) {
        console.error("getUserId error:", err);
        let localId = localStorage.getItem("userId");
        if (!localId) {
          localId = crypto.randomUUID();
          localStorage.setItem("userId", localId);
        }
        unsubscribe();
        resolve({ uid: localId, isAnonymous: true });
      }
    });
  });
}
