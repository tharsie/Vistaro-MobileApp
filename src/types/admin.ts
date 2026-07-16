export interface AdminDashboardStatsDto {
  totalUsers: number;
  totalStudents: number;
  totalShopOwners: number;
  totalJobPostings: number;
  totalApplications: number;
  pendingApplications: number;
  pendingInterviews: number;
  pendingMessages: number;
  pendingContactReleases: number;
  pendingShopOwnerApprovals: number;
  pendingBusinessDocuments: number;
}

export interface AdminUserResponseDto {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AdminQueryDto {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminPagedResponseDto<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[] | null;
}

export interface AdminModeratedMessageReviewDto {
  rejectionReason?: string;
}

export interface AdminMessageResponseDto {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  messageText: string;
  messageType: number;
  invitationStatus: number;
  isRead: boolean;
  createdAt: string;
}

export interface AdminContactReleaseDto {
  adminNote?: string;
}

export interface AdminInterviewResponseDto {
  applicationId: string;
  jobTitle: string;
  candidateCode: string;
  shopName: string;
  requestedAt: string;
}

export interface AdminShopOwnerListItemDto {
  id: string;
  shopName: string;
  fullName: string;
  email: string;
  city: string;
  businessVerificationStatus?: string | number | null;
  isVerified?: boolean;
  verificationStatus?: string | null;
  createdAt: string;
}

export interface AdminBusinessDocumentDto {
  id: string;
  shopOwnerName: string;
  shopName: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: string;
}

export interface AuditLogDto {
  id: string;
  action: string;
  performedBy: string;
  targetEntity: string;
  createdAt: string;
}
