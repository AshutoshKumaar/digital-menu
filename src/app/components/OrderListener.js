// src/app/NotificationListener.js
"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, doc, getDoc, query, where, onSnapshot } from "firebase/firestore";

export default function NotificationListener() {
  const audioRef = useRef(null);
  const [permissionGiven, setPermissionGiven] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false); // everything enabled after user tap

  // 🔑 Track auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 🔔 Request notification permission
  const enableNotifications = async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm === "granted") setPermissionGiven(true);
    } else {
      setPermissionGiven(true);
    }

    // 🔊 Play a silent sound to unlock mobile autoplay policies
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    // 🔊 Test speech to unlock speechSynthesis
    if ("speechSynthesis" in window) {
      const testMsg = new SpeechSynthesisUtterance("Notifications and sound enabled");
      testMsg.lang = "hi-IN";
      window.speechSynthesis.speak(testMsg);
    }

    setReady(true); // listener can now work
  };

  // ✅ Listen for new orders
  useEffect(() => {
    if (!ready || !currentUser) return;

    const ordersQuery = query(collection(db, "orders"), where("ownerId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(ordersQuery, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === "added") {
          const data = change.doc.data();
          const orderId = change.doc.id;
          const firstItem = data?.orderDetails?.items?.[0];

          // 🔎 Fetch owner name (optional)
          let ownerName = "Owner";
          if (data.ownerId) {
            try {
              const ownerDoc = await getDoc(doc(db, "owners", data.ownerId));
              if (ownerDoc.exists()) ownerName = ownerDoc.data().name || "Owner";
            } catch (err) {
              console.error(err);
            }
          }

          // 🎵 Play alert sound
          if (audioRef.current) audioRef.current.play().catch(() => {});

          // 🔊 Speech notification (Hindi)
          if ("speechSynthesis" in window) {
            const msg = new SpeechSynthesisUtterance(
              `मुबारक हो, आपको नया ऑर्डर मिला है। 
              ग्राहक का नाम है: ${data.fullName || "कोई ग्राहक"}. 
              उसने ${firstItem?.name || "एक आइटम"} का ${firstItem?.quantity || 1} ऑर्डर किया है. 
              कुल राशि है: ${data?.orderDetails?.total || 0} रुपये.`
            );
            msg.lang = "hi-IN";
            window.speechSynthesis.speak(msg);
          }

          // 🛎️ Browser Notification
          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification("🛒 नया ऑर्डर आया है 🚀", {
              body: `Customer: ${data.fullName || "Unknown"}\nItem: ${firstItem?.name || "N/A"} (x${firstItem?.quantity || 1})\nTotal: ₹${data?.orderDetails?.total || 0}`,
              icon: firstItem?.image || "/order-icon.png",
              badge: "/order-badge.jpg",
            });
            notification.onclick = () => window.open(`/dashboard`, "_blank");
          }
        }
      }
    });

    return () => unsubscribe();
  }, [ready, currentUser]);

  return (
    <>
      <audio ref={audioRef} src="/new-notification.mp3" preload="auto" />

      {!ready && (
        <div  style={{ position: "fixed", bottom: 20, left: 20 }}>
          <button
            onClick={enableNotifications}
            style={{ padding: "10px 20px", fontSize: "16px", borderRadius: "8px", background: "#007bff", color: "#fff" }}
          >
            Enable Notifications & Sound 🔔
          </button>
        </div>
      )}
    </>
  );
}
