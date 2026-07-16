export enum JobApplicationStatus {
  SubmittedToAdmin = 1,
  AdminReview = 2,
  MoreInformationRequested = 3,
  ApprovedForEmployer = 4,
  RejectedByAdmin = 5,
  Shortlisted = 6,
  RejectedByEmployer = 7,
  InterviewRequested = 8,
  InterviewApproved = 9,
  InterviewDeclined = 10,
  OfferMade = 11,
  OfferAccepted = 12,
  OfferDeclined = 13,
  Withdrawn = 14,
}

export interface JobApplicationResponseDto {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  shopName: string;
  status: JobApplicationStatus;
  adminReviewStatus: number;
  employerStatus: number;
  adminComment: string | null;
  appliedAt: string;
  updatedAt: string | null;
}

export interface ApplyJobApplicationDto {
  coverLetter?: string;
}

export interface UpdateJobApplicationStatusDto {
  status: 6 | 7;
}

export interface RequestContactReleaseDto {
  reason: string;
}

export interface AdminJobApplicationResponseDto {
  id: string;
  jobTitle: string;
  shopName: string;
  candidateCode: string;
  status: number;
  adminReviewStatus: number;
  employerStatus: number;
  adminComment: string | null;
  appliedAt: string;
  updatedAt: string | null;
}

export interface AdminApplicationReviewDto {
  adminComment?: string;
}

export interface AvailableStudentSearchRequestDto {
  city?: string;
  jobCategory?: string;
  employmentPreference?: 1 | 2;
  minHours?: number;
  maxHours?: number;
  page?: number;
  pageSize?: number;
}

export interface AvailableStudentSearchResultDto {
  candidateCode: string;
  city: string;
  employmentPreference: 1 | 2;
  maxHoursPerWeek: number;
  expectedHourlyRate: number;
  preferredJobCategories: string;
  skills: string;
}
