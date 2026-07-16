export interface NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}
