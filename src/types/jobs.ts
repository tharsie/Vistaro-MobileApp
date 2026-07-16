export interface JobPostingSummaryDto {
  id: string;
  jobTitle: string;
  jobDescription: string;
  jobCategory: string;
  employmentType: 1 | 2;
  hourlyRate: number;
  hoursPerWeek: number;
  city: string;
  postcode: string;
  shopName: string;
  createdAt: string;
}

export interface JobSearchRequestDto {
  keyword?: string;
  city?: string;
  category?: string;
  minRate?: number;
  maxRate?: number;
  employmentType?: 1 | 2;
  page?: number;
  pageSize?: number;
}

export interface JobSearchResponseDto {
  items: JobPostingSummaryDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateJobPostingDto {
  jobTitle: string;
  jobDescription: string;
  jobCategory: string;
  employmentType: 1 | 2;
  hourlyRate: number;
  hoursPerWeek: number;
  address: string;
  city: string;
  postcode: string;
  startDate?: string;
}

export interface UpdateJobPostingDto extends CreateJobPostingDto {}

export interface JobPostingResponseDto {
  id: string;
  jobTitle: string;
  jobDescription: string;
  jobCategory: string;
  employmentType: 1 | 2;
  hourlyRate: number;
  hoursPerWeek: number;
  address: string;
  city: string;
  postcode: string;
  startDate: string | null;
  createdAt: string;
  isPublished: boolean;
}
