export interface PushNotification {
  title: string;
  options: {
    body: string;
    icon: string;
    image?: string;
    requireInteraction?: boolean;
    data: {
      pushId: number;
      targetUrl: string;
      templateId: string;
      webPushMessageIntId: number;
      actions?: Array<NotificationAction>;
    };
  };
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduleTime?: string;
  siteId: string;
}

export interface NotificationAction {
  action: string;
  title: string;
  url: string;
}
