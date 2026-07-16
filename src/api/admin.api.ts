import apiClient from './apiClient';
import { ApiResponse } from '../types/auth';
import {
  AdminDashboardStatsDto,
  AdminUserResponseDto,
  AdminQueryDto,
  AdminModeratedMessageReviewDto,
  AdminMessageResponseDto,
  AdminContactReleaseDto,
  AdminInterviewResponseDto,
  AdminShopOwnerListItemDto,
  AdminBusinessDocumentDto,
  AuditLogDto,
  AdminPagedResponseDto,
} from '../types/admin';
import { AdminJobApplicationResponseDto, AdminApplicationReviewDto } from '../types/applications';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getAdminStats = () =>
  apiClient.get<ApiResponse<AdminDashboardStatsDto>>('/api/admin/dashboard/stats');

// ─── Applications ─────────────────────────────────────────────────────────────
export const getPendingApplications = () =>
  apiClient.get<ApiResponse<AdminJobApplicationResponseDto[]>>('/api/admin/applications/pending');

export const approveApplicationForEmployer = (id: string, dto: AdminApplicationReviewDto) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/applications/${id}/approve-for-employer`, dto);

export const rejectApplication = (id: string, dto: AdminApplicationReviewDto) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/applications/${id}/reject`, dto);

export const requestMoreInfo = (id: string, dto: AdminApplicationReviewDto) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/applications/${id}/request-more-information`, dto);

// ─── Interviews ───────────────────────────────────────────────────────────────
export const getPendingInterviews = () =>
  apiClient.get<ApiResponse<AdminInterviewResponseDto[]>>('/api/admin/interviews/pending');

export const approveInterview = (applicationId: string) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/interviews/${applicationId}/approve`);

// ─── Contact releases ─────────────────────────────────────────────────────────
export const approveContactRelease = (jobApplicationId: string, dto: AdminContactReleaseDto) =>
  apiClient.post<ApiResponse<null>>(
    `/api/admin/contact-releases/${jobApplicationId}/approve`,
    dto,
  );

export const denyContactRelease = (jobApplicationId: string, dto: AdminContactReleaseDto) =>
  apiClient.post<ApiResponse<null>>(
    `/api/admin/contact-releases/${jobApplicationId}/deny`,
    dto,
  );

// ─── Messages ─────────────────────────────────────────────────────────────────
export const getPendingMessages = () =>
  apiClient.get<ApiResponse<AdminMessageResponseDto[]>>('/api/admin/messages/pending');

export const approveMessage = (id: string) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/messages/${id}/approve`);

export const rejectMessage = (id: string, dto: AdminModeratedMessageReviewDto) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/messages/${id}/reject`, dto);

// ─── Shop owner verification ──────────────────────────────────────────────────
export const getShopOwners = (params: AdminQueryDto) =>
  apiClient.get<ApiResponse<AdminPagedResponseDto<AdminShopOwnerListItemDto>>>(
    '/api/admin/shop-owners',
    { params },
  );

export const getShopOwner = (id: string) =>
  apiClient.get<ApiResponse<AdminShopOwnerListItemDto>>(`/api/admin/shop-owners/${id}`);

export const approveShopOwner = (id: string) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/shop-owners/${id}/approve`);

export const rejectShopOwner = (id: string) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/shop-owners/${id}/reject`);

// ─── Business documents ───────────────────────────────────────────────────────
export const getBusinessDocuments = (params: AdminQueryDto) =>
  apiClient.get<ApiResponse<AdminPagedResponseDto<AdminBusinessDocumentDto>>>(
    '/api/admin/business-documents',
    { params },
  );

export const approveBusinessDocument = (id: string) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/business-documents/${id}/approve`);

export const rejectBusinessDocument = (id: string) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/business-documents/${id}/reject`);

// ─── Users ────────────────────────────────────────────────────────────────────
export const getUsers = (params: AdminQueryDto) =>
  apiClient.get<ApiResponse<AdminUserResponseDto[]>>('/api/admin/users', { params });

export const getUser = (id: string) =>
  apiClient.get<ApiResponse<AdminUserResponseDto>>(`/api/admin/users/${id}`);

export const activateUser = (id: string) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/users/${id}/activate`);

export const deactivateUser = (id: string) =>
  apiClient.put<ApiResponse<null>>(`/api/admin/users/${id}/deactivate`);

export const deleteUser = (id: string) =>
  apiClient.delete<ApiResponse<null>>(`/api/admin/users/${id}`);

// ─── Audit logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = (count = 20) =>
  apiClient.get<ApiResponse<AuditLogDto[]>>(`/api/admin/audit-logs?count=${count}`);
