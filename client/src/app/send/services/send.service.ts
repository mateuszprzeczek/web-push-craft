import { inject, Injectable } from '@angular/core';
import { collection, doc, setDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase.init';
import { AuthService } from '../../auth/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

interface PushNotificationTemplate {
  id: string;
  name: string;
  title: string;
  options: any;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduleTime?: string;
  sentAt?: string;
  siteId: string;
}

@Injectable()
export class SendService {
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  // Track the number of subscribers
  subscriberCount = 0;

  /**
   * Send a notification immediately
   * @param template The template to send
   * @returns A promise that resolves when the notification is sent
   */
  async sendNotificationNow(template: PushNotificationTemplate): Promise<void> {
    const uid = this.authService.userUid();
    if (!uid) throw new Error(this.translate.instant('templates.errors.userNotLoggedIn'));

    // Get the subscriber count
    const subscriberCount = await this.getSubscriberCount();
    if (subscriberCount === 0) {
      throw new Error(this.translate.instant('send.errors.noSubscribers'));
    }

    // Create a copy of the template with updated status
    const notificationToSend = {
      ...template,
      status: 'sent' as const,
      sentAt: new Date().toISOString()
    };

    // Save the notification to Firestore
    await this.saveNotification(uid, notificationToSend);

    // Get all tokens for the current user
    const tokens = await this.getUserTokens();

    // Send the notification to each token
    const sendPromises = tokens.map(token =>
      this.sendViaCloudFunction(notificationToSend, token)
    );

    try {
      await Promise.all(sendPromises);
      console.log(`Notification sent to ${tokens.length} subscribers`);
    } catch (err) {
      console.error('Error sending notifications:', err);
      throw new Error(this.translate.instant('send.errors.sendingFailed'));
    }
  }

  /**
   * Schedule a notification for later
   * @param template The template to schedule
   * @param scheduledTime The time to send the notification
   * @returns A promise that resolves when the notification is scheduled
   */
  async scheduleNotification(template: PushNotificationTemplate, scheduledTime: Date): Promise<void> {
    const uid = this.authService.userUid();
    if (!uid) throw new Error(this.translate.instant('templates.errors.userNotLoggedIn'));

    // Get the subscriber count
    const subscriberCount = await this.getSubscriberCount();
    if (subscriberCount === 0) {
      throw new Error(this.translate.instant('send.errors.noSubscribers'));
    }

    // Create a copy of the template with updated status and schedule time
    const notificationToSchedule = {
      ...template,
      status: 'scheduled' as const,
      scheduleTime: scheduledTime.toISOString()
    };

    // Save the notification to Firestore
    await this.saveNotification(uid, notificationToSchedule);

    // Note: The actual sending will be handled by a Cloud Function triggered by a scheduled event
    console.log('Notification scheduled for:', scheduledTime);
  }

  /**
   * Save a notification to Firestore
   * @param uid The user ID
   * @param notification The notification to save
   * @returns A promise that resolves when the notification is saved
   */
  private async saveNotification(uid: string, notification: PushNotificationTemplate): Promise<void> {
    // Update the template in the templates collection
    const templateRef = doc(firestore, 'users', uid, 'templates', notification.id);

    // Extract fields to update instead of passing the entire object
    const updateData = {
      status: notification.status,
      ...(notification.scheduleTime ? { scheduleTime: notification.scheduleTime } : {}),
      ...(notification.sentAt ? { sentAt: notification.sentAt } : {})
    };

    await updateDoc(templateRef, updateData);

    // Also save to a sent or scheduled collection for easier querying
    const collectionName = notification.status === 'scheduled' ? 'scheduledNotifications' : 'sentNotifications';
    const notificationRef = doc(firestore, 'users', uid, collectionName, notification.id);
    await setDoc(notificationRef, notification);
  }

  /**
   * Send a notification via Firebase Cloud Function
   * @param template The template to send
   * @param token The FCM token to send the notification to
   * @returns A promise that resolves when the notification is sent
   */
  async sendViaCloudFunction(template: PushNotificationTemplate, token: string): Promise<void> {
    // Get the URL for the Cloud Function
    const region = 'europe-west1'; // Default region
    const projectId = 'web-push-craft'; // Your project ID
    const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/sendNotification`;

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            token,
            notification: template
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from Cloud Function:', errorData);
        throw new Error(errorData.error || 'Failed to send notification');
      }

      const result = await response.json();
      console.log('Notification sent via Cloud Function:', result);
    } catch (err) {
      console.error('Failed to send notification via Cloud Function:', err);
      throw err;
    }
  }

  /**
   * Get the count of subscribers (tokens) for the current user
   * @returns A promise that resolves with the number of subscribers
   */
  async getSubscriberCount(): Promise<number> {
    const uid = this.authService.userUid();
    if (!uid) throw new Error(this.translate.instant('templates.errors.userNotLoggedIn'));

    try {
      // Query the tokens collection for the current user
      const tokensRef = collection(firestore, 'users', uid, 'tokens');
      const snapshot = await getDocs(tokensRef);

      this.subscriberCount = snapshot.size;
      return this.subscriberCount;
    } catch (err) {
      console.error('Error getting subscriber count:', err);
      return 0;
    }
  }

  /**
   * Get all tokens for the current user
   * @returns A promise that resolves with an array of tokens
   */
  async getUserTokens(): Promise<string[]> {
    const uid = this.authService.userUid();
    if (!uid) throw new Error(this.translate.instant('templates.errors.userNotLoggedIn'));

    try {
      // Query the tokens collection for the current user
      const tokensRef = collection(firestore, 'users', uid, 'tokens');
      const snapshot = await getDocs(tokensRef);

      return snapshot.docs.map(doc => doc.data()['token'] as string);
    } catch (err) {
      console.error('Error getting user tokens:', err);
      return [];
    }
  }
}
