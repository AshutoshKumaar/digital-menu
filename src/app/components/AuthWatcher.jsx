"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import PhoneLinkModal from "./PhoneLinkModal";

export default function AuthWatcher() {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || user.isAnonymous) {
        // User not signed in or still anonymous → prompt login
        setShowPhoneModal(true);
      } else {
        setShowPhoneModal(false);
      }
      setChecking(false);
    });

    return () => unsub();
  }, []);

  if (checking) return null; // Optionally show splash loader

  return (
    <>
      {showPhoneModal && (
        <PhoneLinkModal
          show={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
        />
      )}
    </>
  );
}
