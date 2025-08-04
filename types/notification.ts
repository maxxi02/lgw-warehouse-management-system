// types/notification.ts
export interface Notification {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  shipmentId?: string;
  type: "shipment" | "delivery" | "general";
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export interface CreateNotificationRequest {
  userId: string;
  message: string;
  shipmentId?: string;
  type?: "shipment" | "delivery" | "general";
}
