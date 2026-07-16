import apiClient from './apiClient';
import { ApiResponse } from '../types/auth';
import { MessageResponseDto, SendMessageDto } from '../types/messaging';

export const getInbox = () =>
  apiClient.get<ApiResponse<MessageResponseDto[]>>('/api/messages/inbox');

export const getConversation = (userId: string) =>
  apiClient.get<ApiResponse<MessageResponseDto[]>>(
    `/api/messages/conversation/by-user/${userId}`,
  );

export const sendMessage = (dto: SendMessageDto) =>
  apiClient.post<ApiResponse<MessageResponseDto>>('/api/messages/send', dto);

export const markMessageRead = (messageId: string) =>
  apiClient.put<ApiResponse<null>>(`/api/messages/${messageId}/read`);
