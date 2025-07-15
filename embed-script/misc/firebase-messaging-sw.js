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

console.log("[DEBUG] Firebase initialized");

const messaging = firebase.messaging();
console.log("[DEBUG] Firebase messaging initialized");

const db = firebase.firestore();
console.log("[DEBUG] Firebase Firestore initialized");

// Add skipWaiting to ensure the service worker activates immediately on update
self.addEventListener('install', (event) => {
  console.log("[DEBUG] Service Worker installing");
  self.skipWaiting();
});

// Test Firestore connection
db.collection("test-connection").doc("service-worker")
  .set({
    timestamp: new Date().toISOString(),
    serviceWorker: "firebase-messaging-sw.js"
  })
  .then(() => {
    console.log("[DEBUG] Firestore connection test successful");
  })
  .catch(error => {
    console.error("[DEBUG] Firestore connection test failed:", error);
  });

function updateStat(uuid, field) {
  console.log(`[DEBUG] updateStat called with uuid: ${uuid}, field: ${field}`);

  if (!uuid || !field) {
    console.error(`[DEBUG] Missing uuid or field. uuid: ${uuid}, field: ${field}`);
    return;
  }

  const docRef = db.collection("stats").doc(uuid);
  console.log(`[DEBUG] Accessing Firestore document: stats/${uuid}`);

  const dayIndex = new Date().getDay();
  const chartIndex = (dayIndex + 6) % 7;
  console.log(`[DEBUG] Day index: ${dayIndex}, Chart index: ${chartIndex}`);

  docRef.get()
    .then((doc) => {
      if (!doc.exists) {
        console.error(`[DEBUG] Document does not exist: stats/${uuid}`);

        // Create a test document to verify write permissions
        console.log(`[DEBUG] Attempting to create a test document for debugging`);
        db.collection("debug-stats").doc(uuid).set({
          timestamp: new Date().toISOString(),
          field: field,
          message: "Document did not exist, created for debugging"
        });

        // Create the stats document with initial structure
        console.log(`[DEBUG] Creating stats document for ${uuid}`);

        // Initialize the document with the required structure
        const initialData = {
          summary: {
            totalDisplays: 0,
            totalClicks: 0,
            totalSubscriptions: 0,
            lastUpdated: new Date().toISOString()
          },
          displays: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            data: [0, 0, 0, 0, 0, 0, 0]  // One for each day of the week
          },
          clicks: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            data: [0, 0, 0, 0, 0, 0, 0]  // One for each day of the week
          },
          subscriptions: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            data: [0, 0, 0, 0, 0, 0, 0]  // One for each day of the week
          },
          createdAt: new Date().toISOString()
        };

        return docRef.set(initialData)
          .then(() => {
            console.log(`[DEBUG] Created stats document for ${uuid}, now updating it`);

            // Now update the document with the increment
            return docRef.update({
              [`summary.total${capitalize(field)}`]: firebase.firestore.FieldValue.increment(1),
              [`${field}.data.${chartIndex}`]: firebase.firestore.FieldValue.increment(1),
            });
          });
      }

      console.log(`[DEBUG] Document exists, data:`, doc.data());
      const data = doc.data();
      let updates = {};
      let needsStructureUpdate = false;

      // Check if the document has the expected structure
      if (!data.summary) {
        console.error(`[DEBUG] Document missing 'summary' field:`, data);
        updates.summary = {
          totalDisplays: 0,
          totalClicks: 0,
          totalSubscriptions: 0,
          lastUpdated: new Date().toISOString()
        };
        needsStructureUpdate = true;
      } else {
        // Check if summary has all required fields
        if (data.summary.totalSubscriptions === undefined) {
          console.log(`[DEBUG] Adding missing totalSubscriptions field to summary`);
          updates["summary.totalSubscriptions"] = 0;
          needsStructureUpdate = true;
        }
        if (data.summary.totalDisplays === undefined) {
          console.log(`[DEBUG] Adding missing totalDisplays field to summary`);
          updates["summary.totalDisplays"] = 0;
          needsStructureUpdate = true;
        }
        if (data.summary.totalClicks === undefined) {
          console.log(`[DEBUG] Adding missing totalClicks field to summary`);
          updates["summary.totalClicks"] = 0;
          needsStructureUpdate = true;
        }
        // Update lastUpdated timestamp
        updates["summary.lastUpdated"] = new Date().toISOString();
      }

      // Check for displays field
      if (!data.displays) {
        console.log(`[DEBUG] Adding missing displays field`);
        updates.displays = {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          data: [0, 0, 0, 0, 0, 0, 0]
        };
        needsStructureUpdate = true;
      } else if (!data.displays.labels) {
        console.log(`[DEBUG] Adding missing displays.labels field`);
        updates["displays.labels"] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        needsStructureUpdate = true;
      }

      // Check for clicks field
      if (!data.clicks) {
        console.log(`[DEBUG] Adding missing clicks field`);
        updates.clicks = {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          data: [0, 0, 0, 0, 0, 0, 0]
        };
        needsStructureUpdate = true;
      } else if (!data.clicks.labels) {
        console.log(`[DEBUG] Adding missing clicks.labels field`);
        updates["clicks.labels"] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        needsStructureUpdate = true;
      }

      // Check for subscriptions field
      if (!data.subscriptions) {
        console.log(`[DEBUG] Adding missing subscriptions field`);
        updates.subscriptions = {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          data: [0, 0, 0, 0, 0, 0, 0]
        };
        needsStructureUpdate = true;
      } else if (!data.subscriptions.labels) {
        console.log(`[DEBUG] Adding missing subscriptions.labels field`);
        updates["subscriptions.labels"] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        needsStructureUpdate = true;
      }

      // Check if the specific field we're updating exists
      if (!data[field] || !data[field].data) {
        console.error(`[DEBUG] Document missing '${field}.data' field:`, data);
        if (!updates[field]) {
          updates[field] = {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            data: [0, 0, 0, 0, 0, 0, 0]
          };
        }
        needsStructureUpdate = true;
      }

      const path = `${field}.data.${chartIndex}`;
      console.log(`[DEBUG] Updating path: ${path}`);

      // Add the increment updates
      updates[`summary.total${capitalize(field)}`] = firebase.firestore.FieldValue.increment(1);
      updates[path] = firebase.firestore.FieldValue.increment(1);

      // If we need to update the structure, log it
      if (needsStructureUpdate) {
        console.log(`[DEBUG] Updating document structure with:`, updates);
      }

      return docRef.update(updates);
    })
    .then(() => {
      console.log(`[DEBUG] Successfully updated stats for ${field}`);
    })
    .catch(error => {
      console.error(`[DEBUG] Error updating stats:`, error);
    });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

messaging.onBackgroundMessage(payload => {
  console.log("[DEBUG] onBackgroundMessage received:", payload);
  console.log("[DEBUG] payload.notification:", payload.notification);
  console.log("[DEBUG] payload.data:", payload.data);
  console.log("[DEBUG] payload.fcmOptions:", payload.fcmOptions);

  // Extract notification details
  const { title, body, icon } = payload.notification;

  // Try to get data from different possible locations
  // First check payload.data, then check payload.notification.data
  let data = payload.data;

  // Check if notification contains a data property
  if (payload.notification && payload.notification.data) {
    console.log("[DEBUG] Found data in payload.notification.data:", payload.notification.data);
    data = payload.notification.data;
  }

  // If we still don't have data, create an empty object
  data = data || {};

  // If the notification has a data property that's a string, try to parse it as JSON
  if (typeof data === 'string') {
    try {
      console.log("[DEBUG] Attempting to parse data string as JSON:", data);
      data = JSON.parse(data);
      console.log("[DEBUG] Successfully parsed data as JSON:", data);
    } catch (e) {
      console.error("[DEBUG] Failed to parse data as JSON:", e);
      data = {};
    }
  }

  // Check for data in the notification payload structure shown in the logs
  // This handles the case where data is nested in the notification payload
  if (!data.templateId && !data.pushId && payload.notification) {
    // Try to extract data from the notification payload
    const notificationData = {};

    // Check if there's a data property in the notification
    if (payload.notification.data) {
      Object.assign(notificationData, payload.notification.data);
    }

    // Check if there are actions in the notification
    if (payload.notification.actions && Array.isArray(payload.notification.actions)) {
      notificationData.actions = payload.notification.actions;
    }

    // If we found any data, merge it with the existing data
    if (Object.keys(notificationData).length > 0) {
      console.log("[DEBUG] Extracted additional data from notification payload:", notificationData);
      data = { ...data, ...notificationData };
    }
  }

  // Extract data from the payload structure shown in the issue description
  // The payload shows notification.data.pushId and notification.data.templateId
  if (payload.notification && typeof payload.notification === 'object') {
    // Check if notification.data is a string that needs to be parsed
    if (typeof payload.notification.data === 'string') {
      try {
        console.log("[DEBUG] Attempting to parse notification.data string as JSON:", payload.notification.data);
        const parsedData = JSON.parse(payload.notification.data);
        console.log("[DEBUG] Successfully parsed notification.data as JSON:", parsedData);

        // Merge the parsed data with our existing data
        data = { ...data, ...parsedData };
      } catch (e) {
        console.error("[DEBUG] Failed to parse notification.data as JSON:", e);
      }
    }
  }

  // Handle the specific payload structure from the issue description
  // The payload shows data nested in notification.data
  if (!data.templateId && !data.pushId && payload.notification) {
    // Check if notification has a data property that's an object
    if (payload.notification.data && typeof payload.notification.data === 'object') {
      // Extract templateId and pushId from notification.data
      if (payload.notification.data.templateId) {
        data.templateId = payload.notification.data.templateId;
        console.log("[DEBUG] Extracted templateId from notification.data:", data.templateId);
      }

      if (payload.notification.data.pushId) {
        data.pushId = payload.notification.data.pushId;
        console.log("[DEBUG] Extracted pushId from notification.data:", data.pushId);
      }

      // Extract targetUrl from notification.data
      if (payload.notification.data.targetUrl) {
        data.targetUrl = payload.notification.data.targetUrl;
        console.log("[DEBUG] Extracted targetUrl from notification.data:", data.targetUrl);
      }

      // Extract actions from notification.data
      if (payload.notification.data.actions && Array.isArray(payload.notification.data.actions)) {
        data.actions = payload.notification.data.actions;
        console.log("[DEBUG] Extracted actions from notification.data:", data.actions);
      }
    }
  }

  // Try to get uuid from different possible locations
  // Check in data object first, then in notification payload
  const uuid = data?.uuid || 
               data?.notificationId || 
               data?.id || 
               data?.templateId || 
               data?.pushId || 
               payload?.notification?.data?.templateId || 
               payload?.notification?.data?.pushId;

  console.log(`[DEBUG] Extracted notification data - title: "${title}", body: "${body}", uuid: "${uuid}"`);
  console.log(`[DEBUG] Full data object:`, data);

  // Log the specific fields we're looking for
  console.log(`[DEBUG] UUID candidates - uuid: ${data?.uuid}, notificationId: ${data?.notificationId}, id: ${data?.id}, templateId: ${data?.templateId || payload?.notification?.data?.templateId}, pushId: ${data?.pushId || payload?.notification?.data?.pushId}`);

  // Ensure data includes url and uuid for click handling
  const enhancedData = {
    ...data,
    FCM_MSG: payload, // Store the entire payload for reference
    uuid: uuid,
    // Make sure url is set for click handling
    url: data?.url || data?.targetUrl || payload?.fcmOptions?.link || data?.click_action || "https://www.gol.pl",
    // Include these properties to ensure they're available in the click handler
    templateId: data?.templateId || payload?.notification?.data?.templateId,
    pushId: data?.pushId || payload?.notification?.data?.pushId,
    targetUrl: data?.targetUrl || payload?.notification?.data?.targetUrl,
    click_action: data?.click_action || payload?.notification?.click_action,
    // Store fcmOptions separately to make it easier to access
    fcmOptions: payload?.fcmOptions
  };

  // Log all enhancedData properties to help with debugging
  console.log("[DEBUG] All enhancedData properties:", Object.keys(enhancedData));

  // Log the URL candidates
  console.log(`[DEBUG] URL candidates - url: ${data?.url}, targetUrl: ${data?.targetUrl}, fcmOptions.link: ${payload?.fcmOptions?.link}`);

  console.log(`[DEBUG] Enhanced data for notification:`, enhancedData);

  self.registration.showNotification(title, {
    body,
    icon,
    data: enhancedData,
  });

  console.log(`[DEBUG] Notification displayed, calling updateStat with uuid: "${uuid}", field: "displays"`);
  updateStat(uuid, "displays");
});

self.addEventListener("notificationclick", event => {
  console.log("[DEBUG] Notification clicked:", event.notification);
  console.log("[DEBUG] Notification data:", event.notification?.data);

  // Get data from notification
  const data = event.notification?.data || {};

  // Get the original FCM message if available
  const fcmMsg = data.FCM_MSG;
  console.log("[DEBUG] FCM_MSG from notification data:", fcmMsg);

  // Try to get uuid from different possible locations
  const uuid = data?.uuid || 
               data?.notificationId || 
               data?.id || 
               data?.templateId || 
               data?.pushId || 
               fcmMsg?.notification?.data?.templateId || 
               fcmMsg?.notification?.data?.pushId;

  console.log(`[DEBUG] Extracted uuid from notification: "${uuid}"`);

  // Log the specific fields we're looking for
  console.log(`[DEBUG] UUID candidates - uuid: ${data?.uuid}, notificationId: ${data?.notificationId}, id: ${data?.id}, templateId: ${data?.templateId}, pushId: ${data?.pushId}`);

  console.log(`[DEBUG] Calling updateStat with uuid: "${uuid}", field: "clicks"`);
  updateStat(uuid, "clicks");

  event.notification.close();
  console.log("[DEBUG] Notification closed");

  // Try different URL fields, default to gol.pl
  const url = data?.url || 
              data?.targetUrl || 
              fcmMsg?.fcmOptions?.link || 
              data?.click_action ||  // Check for click_action in the notification data
              "https://www.gol.pl";

  console.log(`[DEBUG] Opening URL: "${url}"`);

  // Log the URL candidates
  console.log(`[DEBUG] URL candidates - url: ${data?.url}, targetUrl: ${data?.targetUrl}, fcmOptions.link: ${fcmMsg?.fcmOptions?.link}, click_action: ${data?.click_action}`);

  // Log all data properties to help with debugging
  console.log("[DEBUG] All data properties:", Object.keys(data));

  // Open the URL in a new window/tab
  event.waitUntil(clients.openWindow(url));
});
