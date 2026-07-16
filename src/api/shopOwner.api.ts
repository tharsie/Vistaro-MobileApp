import apiClient from './apiClient';
import { ApiResponse } from '../types/auth';
import {
  ShopOwnerProfileResponseDto,
  CreateShopOwnerProfileDto,
  UpdateShopOwnerProfileDto,
  BusinessDocumentResponseDto,
} from '../types/shopOwner';

export const getShopOwnerProfile = () =>
  apiClient.get<ApiResponse<ShopOwnerProfileResponseDto>>('/api/shop-owner/profile');

export const createShopOwnerProfile = (dto: CreateShopOwnerProfileDto) =>
  apiClient.post<ApiResponse<ShopOwnerProfileResponseDto>>('/api/shop-owner/profile', dto);

export const updateShopOwnerProfile = (dto: UpdateShopOwnerProfileDto) =>
  apiClient.put<ApiResponse<ShopOwnerProfileResponseDto>>('/api/shop-owner/profile', dto);

export const deleteShopOwnerProfile = () =>
  apiClient.delete<ApiResponse<null>>('/api/shop-owner/profile');

export const uploadBusinessDocument = (uri: string, name: string, type: string) => {
  const formData = new FormData();
  formData.append('file', { uri, name, type } as any);
  return apiClient.post<ApiResponse<BusinessDocumentResponseDto>>(
    '/api/shop-owner/business-documents',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
};

export const getBusinessDocuments = () =>
  apiClient.get<ApiResponse<BusinessDocumentResponseDto[]>>('/api/shop-owner/business-documents');

export const deleteBusinessDocument = (id: string) =>
  apiClient.delete<ApiResponse<null>>(`/api/shop-owner/business-documents/${id}`);
