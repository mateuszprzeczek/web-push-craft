import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, getFirestore, setDoc, getDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";

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
const firestore = getFirestore(app);
const db = getFirestore(app);

function getUuidFromScriptTag(): string | null {
    const scriptTag = document.querySelector<HTMLScriptElement>('script[data-id="wb-craft"]');
    return scriptTag?.dataset.uuid || null;
}

export async function initPush() {
    let uuid = getUuidFromScriptTag() || 'demo';

    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            return;
        }

        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
            vapidKey: "BEbsGQfYDyf9EhFlEznPUA_DXDWLEyPDWhF4QM-mftgegicG88bWPcSmvVWUEiInQLwaUHzw24J8ffj8Yj6jr9Y",
            serviceWorkerRegistration: registration,
        });

        const statsRef = doc(db, "stats", uuid);

        await setDoc(
            statsRef,
            {
                summary: {
                    totalSubscriptions: increment(1),
                    lastUpdated: serverTimestamp(),
                },
            },
            { merge: true }
        );

        await setDoc(doc(firestore, 'users', uuid, 'tokens', token), {
            token,
            createdAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
        });

        console.log("Token zapisany do Firestore:", token);
        console.log("Subscription recorded for UUID:", uuid, "Token:", token);
    } catch (err) {
        console.error("Push registration error:", err);
    }

}

async function updateStat(uuid: string, field: string) {
    if (!uuid || !field) return;

    const dayIndex = new Date().getDay(); // 0 = Sun
    const chartIndex = (dayIndex + 6) % 7;

    const ref = doc(firestore, "stats", uuid);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;

    const updates = {
        [`summary.total${capitalize(field)}`]: increment(1),
        [`${field}.data.${chartIndex}`]: increment(1),
    };

    await updateDoc(ref, updates);
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Obsługa wiadomości w foregroundzie
onMessage(messaging, async (payload) => {
    console.log("Web Push received in foreground:", payload);

    if (!payload?.notification || !payload?.data) return;

    const { title, body, icon } = payload.notification;
    const data = payload.data;
    const uuid = data.uuid;
    const url = data.url || "/";

    const notification = new Notification(title || 'test', {
        body,
        icon,
        data,
    });

    await updateStat(uuid, "displays");

    notification.onclick = async () => {
        await updateStat(uuid, "clicks");
        window.open(url, "_blank");
    };
});

initPush();
