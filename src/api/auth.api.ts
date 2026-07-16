import apiClient from './apiClient';
import { ApiResponse, LoginDto, RegisterDto, LoginResponseDto } from '../types/auth';

type RawAuthResponse = {
  accessToken?: string;
  refreshToken?: string;
  message?: string | null;
  user?: LoginResponseDto['user'];
  succeeded?: boolean;
  data?: LoginResponseDto | null;
  token?: string;
};

const normalizeAuthResponse = (payload: RawAuthResponse): ApiResponse<LoginResponseDto> => {
  if (payload?.data) {
    return {
      succeeded: payload.succeeded ?? true,
      message: payload.message ?? null,
      data: payload.data,
    };
  }

  if (payload?.accessToken && payload.user) {
    return {
      succeeded: true,
      message: payload.message ?? null,
      data: {
        token: payload.accessToken,
        user: payload.user,
      },
    };
  }

  if (payload?.token && payload.user) {
    return {
      succeeded: true,
      message: payload.message ?? null,
      data: {
        token: payload.token,
        user: payload.user,
      },
    };
  }

  return {
    succeeded: false,
    message: payload?.message ?? 'Unexpected auth response from server.',
    data: null,
  };
};

export const login = async (dto: LoginDto) => {
  const response = await apiClient.post<RawAuthResponse | ApiResponse<LoginResponseDto>>(
    '/api/auth/login',
    dto,
  );

  return {
    ...response,
    data: normalizeAuthResponse(response.data as RawAuthResponse),
  };
};

export const register = async (dto: RegisterDto) => {
  const response = await apiClient.post<RawAuthResponse | ApiResponse<LoginResponseDto>>(
    '/api/auth/register',
    dto,
  );

  return {
    ...response,
    data: normalizeAuthResponse(response.data as RawAuthResponse),
  };
};
