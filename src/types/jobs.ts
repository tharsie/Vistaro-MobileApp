export interface JobPostingSummaryDto {
  id: string;
  jobTitle: string;
  description: string;
  jobCategory: string;
  employmentType: number;
  salaryAmount: number;
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
  employmentType?: number;
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
  description: string;
  jobCategory: string;
  employmentType: number;
  contractType: number;
  salaryType: number;
  salaryAmount: number;
  hoursPerWeek: number;
  location: string;
  city: string;
  postcode: string;
  startDate: string;
  expiryDate: string;
  status: number;
}

export interface UpdateJobPostingDto extends CreateJobPostingDto {}

export interface JobPostingResponseDto {
  id: string;
  jobTitle: string;
  description: string;
  jobCategory: string;
  employmentType: number;
  contractType: number;
  salaryType: number;
  salaryAmount: number;
  hoursPerWeek: number;
  location: string;
  city: string;
  postcode: string;
  startDate: string;
  expiryDate: string;
  status: number;
  createdAt: string;
  isPublished: boolean;
}


