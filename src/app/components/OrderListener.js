"use client";
import { useEffect, useRef, useState } from "react";
import { auth, db, messaging } from "../firebase/config"; 
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getToken } from "firebase/messaging";

export default function NotificationListener() {
  const audioRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);

  // 🔑 Auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // ⚡ Register Service Worker (Android/Desktop only)
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(registration => {
          console.log("Service Worker registered:", registration.scope);
        })
        .catch(err => console.error("Service Worker registration failed:", err));
    }
  }, []);

  // 🔔 Request permission + get FCM token (skip for iOS Safari)
  useEffect(() => {
    if (!currentUser) return;

    const enableNotifications = async () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        setReady(true); // Fallback: in-page toast only
        return;
      }

      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") return;

        const token = await getToken(messaging, {
          vapidKey: "BHJDRHWZDcdYec2W2ePRcu7OonMjR_jfuuGBV2kmb8CcsGmB-F79r4BCmtq3ZU0h2Uilh0OD03yuHKEaVDk-rVY"
        });
        console.log("FCM token:", token);
        // TODO: save token to Firestore if needed
        setReady(true);
      } catch (err) {
        console.error("FCM permission error:", err);
      }
    };

    enableNotifications();
  }, [currentUser]);

  // ✅ Firestore listener
  useEffect(() => {
    if (!ready || !currentUser) return;

    const ordersQuery = query(collection(db, "orders"), where("ownerId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(ordersQuery, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          const data = change.doc.data();
          const firstItem = data?.orderDetails?.items?.[0];

          // 🔊 Play sound
          if (audioRef.current) audioRef.current.play().catch(() => {});

          // 🗣 Speech
          if ("speechSynthesis" in window) {
            const msg = new SpeechSynthesisUtterance(
              `मुबारक हो, आपको नया ऑर्डर मिला है। ग्राहक का नाम है: ${data.fullName || "कोई ग्राहक"}. उसने ${firstItem?.name || "एक आइटम"} का ${firstItem?.quantity || 1} ऑर्डर किया है. कुल राशि है: ${data?.orderDetails?.total || 0} रुपये.`
            );
            msg.lang = "hi-IN";
            window.speechSynthesis.speak(msg);
          }

          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

          // 🔔 Browser notification for Android/Desktop
          if (!isIOS && "Notification" in window && Notification.permission === "granted") {
            const notification = new Notification("🛒 नया ऑर्डर आया है 🚀", {
              body: `Customer: ${data.fullName}\nItem: ${firstItem?.name || "N/A"}\nTotal: ₹${data?.orderDetails?.total || 0}`,
              icon: firstItem?.image || "/order-icon.png",
            });

            notification.onclick = () => {
              window.focus();
              window.location.href = "/dashboard";
            };
          }

          // 📱 Toast for iOS fallback
          if (isIOS) {
            const id = Date.now();
            setToasts(prev => [...prev, { id, message: `🛒 नया ऑर्डर: ${firstItem?.name || "N/A"} (${data.fullName || "Customer"})` }]);
            // Remove toast after 5 seconds
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [ready, currentUser]);

  return (
    <>
      <audio ref={audioRef} src="/new-notification.mp3" preload="auto" />
      {/* Toast container */}
      <div style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            marginBottom: 10,
            padding: "10px 20px",
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            animation: "fadein 0.5s, fadeout 0.5s 4.5s"
          }}>
            {toast.message}
          </div>
        ))}
      </div>

      {/* Add fade-in/out animation */}
      <style jsx>{`
        @keyframes fadein { from {opacity:0; transform:translateY(20px);} to {opacity:1; transform:translateY(0);} }
        @keyframes fadeout { from {opacity:1;} to {opacity:0;} }
      `}</style>
    </>
  );
}
