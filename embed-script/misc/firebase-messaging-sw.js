importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB7MMYUhj0dj_XSFhycKvLhanfCmpa86KY",
  authDomain: "web-push-craft.firebaseapp.com",
  projectId: "web-push-craft",
  storageBucket: "web-push-craft.firebasestorage.app",
  messagingSenderId: "160722961096",
  appId: "1:160722961096:web:6e67c169bbcf91489f5bfd",
});

const messaging = firebase.messaging();
const db = firebase.firestore();

function updateStat(uuid, field) {
  if (!uuid || !field) return;

  const docRef = db.collection("stats").doc(uuid);

  const dayIndex = new Date().getDay();
  const chartIndex = (dayIndex + 6) % 7;

  docRef.get().then((doc) => {
    if (!doc.exists) return;

    const data = doc.data();
    const path = `${field}.data.${chartIndex}`;

    docRef.update({
      [`summary.total${capitalize(field)}`]: firebase.firestore.FieldValue.increment(1),
      [path]: firebase.firestore.FieldValue.increment(1),
    });
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

messaging.onBackgroundMessage(payload => {
  console.log("onBackgroundMessage:", payload);

  const { title, body, icon } = payload.notification;
  const data = payload.data;
  const uuid = data?.uuid;

  self.registration.showNotification(title, {
    body,
    icon,
    data,
  });

  updateStat(uuid, "displays");
});

self.addEventListener("notificationclick", event => {
  const uuid = event.notification?.data?.uuid;
  updateStat(uuid, "clicks");

  event.notification.close();

  const url = event.notification?.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
