importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB7MMYUhj0dj_XSFhycKvLhanfCmpa86KY",
  authDomain: "web-push-craft.firebaseapp.com",
  projectId: "web-push-craft",
  storageBucket: "web-push-craft.firebasestorage.app",
  messagingSenderId: "160722961096",
  appId: "1:160722961096:web:6e67c169bbcf91489f5bfd",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log("Otrzymano push w tle:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon,
    data: payload.data,
  });
});
