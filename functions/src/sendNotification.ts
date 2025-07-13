import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as corsLib from 'cors';

const cors = corsLib({ origin: true });
admin.initializeApp();

export const sendNotification = functions.region('europe-west1').https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { token, notification } = req.body.data || {};

      if (!token || !notification) {
        return res.status(400).json({ error: 'Token and notification are required.' });
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
            link: notification.options.data?.targetUrl || 'https://your-default-url.com',
          },
        },
      };

      const response = await admin.messaging().send(message);
      return res.status(200).json({ success: true, response });
    } catch (error) {
      console.error('Send error:', error);
      return res.status(500).json({ error: 'Failed to send notification.' });
    }
  });
});
