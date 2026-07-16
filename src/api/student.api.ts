import apiClient from './apiClient';
import { ApiResponse } from '../types/auth';
import {
  StudentProfileResponseDto,
  CreateStudentProfileDto,
  UpdateStudentProfileDto,
} from '../types/student';

export const getStudentProfile = () =>
  apiClient.get<ApiResponse<StudentProfileResponseDto>>('/api/student/profile');

export const createStudentProfile = (dto: CreateStudentProfileDto) =>
  apiClient.post<ApiResponse<StudentProfileResponseDto>>('/api/student/profile', dto);

export const updateStudentProfile = (dto: UpdateStudentProfileDto) =>
  apiClient.put<ApiResponse<StudentProfileResponseDto>>('/api/student/profile', dto);

export const deleteStudentProfile = () =>
  apiClient.delete<ApiResponse<null>>('/api/student/profile');

export const uploadCV = (uri: string, name: string, type: string) => {
  const formData = new FormData();
  formData.append('file', { uri, name, type } as any);
  return apiClient.post<ApiResponse<StudentProfileResponseDto>>(
    '/api/student/profile/cv',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
};
