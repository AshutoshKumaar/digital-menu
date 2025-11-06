"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import PhoneLinkModal from "./PhoneLinkModal";

export default function AuthWatcher() {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let timer; // to clear timeout when component unmounts

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || user.isAnonymous) {
        // Wait 5 seconds before showing the modal
        timer = setTimeout(() => {
          setShowPhoneModal(true);
        }, 10000);
      } else {
        // User is already signed in — no modal
        setShowPhoneModal(false);
      }

      setChecking(false);
    });

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  if (checking) return null; // optionally show splash or nothing

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
