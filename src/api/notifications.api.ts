import apiClient from './apiClient';
import { ApiResponse } from '../types/auth';
import { NotificationResponseDto } from '../types/notifications';

export const getNotifications = () =>
  apiClient.get<ApiResponse<NotificationResponseDto[]>>('/api/notifications');

export const markNotificationRead = (id: string) =>
  apiClient.put<ApiResponse<null>>(`/api/notifications/${id}/read`);
