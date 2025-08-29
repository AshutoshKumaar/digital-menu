"use client";
import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase/config";

export default function useFCM() {
  useEffect(() => {
    const register = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const token = await getToken(messaging, {
          vapidKey: "BHJDRHWZDcdYec2W2ePRcu7OonMjR_jfuuGBV2kmb8CcsGmB-F79r4BCmtq3ZU0h2Uilh0OD03yuHKEaVDk-rVY"
        });

        console.log("🔥 FCM Token:", token);
        // TODO: save token to Firestore for sending notifications
      } catch (err) {
        console.error("Error getting FCM token", err);
      }
    };

    register();

    // Foreground messages
    onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);
      new Audio("/new-notification.mp3").play(); // 🔊 custom sound
      alert(payload.notification.title + "\n" + payload.notification.body);
    });
  }, []);
}
