import apiClient from './apiClient';
import { ApiResponse } from '../types/auth';
import {
  JobApplicationResponseDto,
  ApplyJobApplicationDto,
  UpdateJobApplicationStatusDto,
  RequestContactReleaseDto,
  AdminJobApplicationResponseDto,
  AvailableStudentSearchRequestDto,
  AvailableStudentSearchResultDto,
} from '../types/applications';

// ─── Student endpoints ────────────────────────────────────────────────────────

export const applyToJob = (jobPostingId: string, dto: ApplyJobApplicationDto) =>
  apiClient.post<ApiResponse<JobApplicationResponseDto>>(
    `/api/job-applications/${jobPostingId}/apply`,
    dto,
  );

export const getMyApplications = () =>
  apiClient.get<ApiResponse<JobApplicationResponseDto[]>>('/api/job-applications/my');

export const withdrawApplication = (id: string) =>
  apiClient.put<ApiResponse<JobApplicationResponseDto>>(
    `/api/job-applications/${id}/withdraw`,
  );

export const acceptInterview = (id: string) =>
  apiClient.put<ApiResponse<JobApplicationResponseDto>>(
    `/api/job-applications/${id}/interview/accept`,
  );

export const declineInterview = (id: string) =>
  apiClient.put<ApiResponse<JobApplicationResponseDto>>(
    `/api/job-applications/${id}/interview/decline`,
  );

export const acceptOffer = (id: string) =>
  apiClient.put<ApiResponse<JobApplicationResponseDto>>(
    `/api/job-applications/${id}/offer/accept`,
  );

export const declineOffer = (id: string) =>
  apiClient.put<ApiResponse<JobApplicationResponseDto>>(
    `/api/job-applications/${id}/offer/decline`,
  );

// ─── Employer endpoints ───────────────────────────────────────────────────────

export const getEmployerApplications = () =>
  apiClient.get<ApiResponse<JobApplicationResponseDto[]>>('/api/job-applications/employer');

export const updateApplicationStatus = (id: string, dto: UpdateJobApplicationStatusDto) =>
  apiClient.put<ApiResponse<JobApplicationResponseDto>>(
    `/api/job-applications/${id}/status`,
    dto,
  );

export const requestInterview = (id: string) =>
  apiClient.put<ApiResponse<JobApplicationResponseDto>>(
    `/api/job-applications/${id}/request-interview`,
  );

export const makeConditionalOffer = (id: string) =>
  apiClient.put<ApiResponse<JobApplicationResponseDto>>(
    `/api/job-applications/${id}/conditional-offer`,
  );

export const requestContactRelease = (id: string, dto: RequestContactReleaseDto) =>
  apiClient.post<ApiResponse<null>>(
    `/api/job-applications/${id}/contact-release/request`,
    dto,
  );

export const sendModeratedMessage = (dto: {
  jobApplicationId: string;
  messageText: string;
}) =>
  apiClient.post<ApiResponse<null>>('/api/job-applications/messages', dto);

export const getModeratedMessages = () =>
  apiClient.get<ApiResponse<any[]>>('/api/job-applications/messages');

// ─── Candidate search ─────────────────────────────────────────────────────────

export const searchCandidates = (params: AvailableStudentSearchRequestDto) =>
  apiClient.get<ApiResponse<AvailableStudentSearchResultDto[]>>(
    '/api/employer/students/search',
    { params },
  );
