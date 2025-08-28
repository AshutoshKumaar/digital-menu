// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// ⚠️ Hardcode your Firebase config here (cannot use process.env)
firebase.initializeApp({
  apiKey: "AIzaSyCBuFI-Xmzd8v6T4Icc6vJ_BFewitr_PB0",
  authDomain: "my-digital-menu-133aa.firebaseapp.com",
  projectId: "my-digital-menu-133aa",
  storageBucket: "my-digital-menu-133aa.firebasestorage.app",
  messagingSenderId: "575179595967",
  appId: "1:575179595967:web:9f60a05a8f874601c7660a"
});

const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/order-icon.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
