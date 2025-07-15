import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  maxAge: 86400, // 24 hours
});
admin.initializeApp();

export const sendNotification = functions.https.onRequest((req, res) => {
  // Handle preflight OPTIONS request explicitly
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set(
      "Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    res.set("Access-Control-Max-Age", "86400");
    res.status(204).send("");
    return;
  }

  corsHandler(req, res, async () => {
    try {
      const {token, notification} = req.body.data || {};

      if (!token || !notification) {
        res.status(400).json({error: "Token and notification are required."});
        return;
      }

      const message: admin.messaging.Message = {
        token,
        webpush: {
          notification: {
            title: notification.title,
            body: notification.options.body,
            icon: notification.options.icon,
            image: notification.options.image,
            requireInteraction: true,
            actions: notification.options.data?.actions || [],
            data: {
              ...notification.options.data,
            },
          },
          fcmOptions: {
            link: notification.options.data?.targetUrl || "https://your-default-url.com",
          },
        },
      };

      try {
        const response = await admin.messaging().send(message);
        res.status(200).json({success: true, response});
      } catch (error) {
        console.error("FCM Error:", error);
        res.status(500).json({error: "Failed to send notification."});
      }
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(400).json({error: "Invalid request data."});
    }
  });
});
