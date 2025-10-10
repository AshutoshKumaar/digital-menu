// utils/getUserId.js
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";

export async function getUserId() {
  if (typeof window === "undefined") return null; // ✅ SSR safety

 

  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // ✅ Save UID locally for backup
          localStorage.setItem("userId", user.uid);
          resolve({ uid: user.uid, isAnonymous: user.isAnonymous });
        } else {
          // ✅ Create anonymous Firebase user if none exists
          const result = await signInAnonymously(auth);
          localStorage.setItem("userId", result.user.uid);
          resolve({ uid: result.user.uid, isAnonymous: result.user.isAnonymous });
        }
      } catch (err) {
        console.error("❌ Firebase anonymous sign-in error:", err);

        // ✅ Offline fallback (random local UUID)
        let localId = localStorage.getItem("userId");
        if (!localId) {
          localId = crypto.randomUUID();
          localStorage.setItem("userId", localId);
        }
        resolve({ uid: localId, isAnonymous: true });
      }
    });
  });
}
