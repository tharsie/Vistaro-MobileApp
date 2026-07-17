import apiClient from './apiClient';
import { ApiResponse } from '../types/auth';
import {
  JobSearchRequestDto,
  JobSearchResponseDto,
  CreateJobPostingDto,
  UpdateJobPostingDto,
  JobPostingResponseDto,
} from '../types/jobs';

export const searchJobs = (params: JobSearchRequestDto) =>
  apiClient.get<ApiResponse<JobSearchResponseDto>>('/api/jobs/search', { params });

export const getMyJobPostings = () =>
  apiClient.get<ApiResponse<JobPostingResponseDto[]>>('/api/job-postings/my');

export const createJobPosting = (dto: CreateJobPostingDto) =>
  apiClient.post<ApiResponse<JobPostingResponseDto>>('/api/job-postings', dto);

export const updateJobPosting = (id: string, dto: UpdateJobPostingDto) =>
  apiClient.put<ApiResponse<JobPostingResponseDto>>(`/api/job-postings/${id}`, dto);

export const deleteJobPosting = (id: string) =>
  apiClient.delete<ApiResponse<null>>(`/api/job-postings/${id}`);

export const getJobPostingById = (id: string) =>
  apiClient.get<ApiResponse<JobPostingResponseDto>>(`/api/job-postings/${id}`);

