// src/app/NotificationListener.js
"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, doc, getDoc, query, where, onSnapshot } from "firebase/firestore";

export default function NotificationListener() {
  const audioRef = useRef(null);
  const [permissionGiven, setPermissionGiven] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔔 Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") setPermissionGiven(true);
      });
    } else {
      setPermissionGiven(true);
    }
  }, []);

  // 🔑 Listen for Firebase auth state
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // ✅ Listen for new orders
  useEffect(() => {
    if (!permissionGiven || !currentUser) return;

    const ordersQuery = query(collection(db, "orders"), where("ownerId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(ordersQuery, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === "added") {
          const data = change.doc.data();
          const orderId = change.doc.id;
          const firstItem = data?.orderDetails?.items?.[0];

          // 🔎 Fetch Owner Name
          let ownerName = "Owner";
          if (data.ownerId) {
            try {
              const ownerDoc = await getDoc(doc(db, "owners", data.ownerId));
              if (ownerDoc.exists()) ownerName = ownerDoc.data().name || "Owner";
            } catch (err) {
              console.error("Error fetching owner name:", err);
            }
          }

          // 🎵 Play alert sound
          if (audioRef.current) {
            audioRef.current.play().catch((err) => console.log("Autoplay blocked", err));
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

          // 🔊 Speech notification (Hindi)
          if ("speechSynthesis" in window) {
            const msg = new SpeechSynthesisUtterance(
              `मुबारक हो, आपको नया ऑर्डर मिला है। 
              ग्राहक का नाम है: ${data.fullName || "कोई ग्राहक"}. 
              उसने ${firstItem?.name || "एक आइटम"} का ${firstItem?.quantity || 1} पीस ऑर्डर किया है. 
              कुल राशि है: ${data?.orderDetails?.total || 0} रुपये. 
              कृपया अपने डैशबोर्ड पर जाकर ऑर्डर की पुष्टि करें. धन्यवाद!`
            );
            msg.lang = "hi-IN";
            msg.pitch = 1;
            msg.rate = 1;
            msg.volume = 2;
            window.speechSynthesis.speak(msg);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [permissionGiven, currentUser]);

  return <audio ref={audioRef} src="/new-notification.mp3" preload="auto" />;
}
