import type { Identifier } from "./index";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationSummary {
  id: Identifier;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string | Date;
}
