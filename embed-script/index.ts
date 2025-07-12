import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyB7MMYUhj0dj_XSFhycKvLhanfCmpa86KY",
    authDomain: "web-push-craft.firebaseapp.com",
    projectId: "web-push-craft",
    storageBucket: "web-push-craft.firebasestorage.app",
    messagingSenderId: "160722961096",
    appId: "1:160722961096:web:6e67c169bbcf91489f5bfd",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function initPush(siteId: string) {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Brak zgody na powiadomienia");
            return;
        }

        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

        const token = await getToken(messaging, {
            vapidKey: "BEbsGQfYDyf9EhFlEznPUA_DXDWLEyPDWhF4QM-mftgegicG88bWPcSmvVWUEiInQLwaUHzw24J8ffj8Yj6jr9Y",
            serviceWorkerRegistration: registration,
        });

        await fetch("http://localhost:3000/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, siteId }),
        });

        console.log("Token zapisany:", token);
    } catch (err) {
        console.error("Błąd przy rejestracji:", err);
    }
}

initPush("site-abc");
