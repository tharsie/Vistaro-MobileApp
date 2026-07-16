export interface StudentProfileResponseDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postcode: string;
  nationalInsuranceNumber: string;
  employmentPreference: 1 | 2;
  maxHoursPerWeek: number;
  expectedHourlyRate: number;
  preferredJobCategories: string;
  skills: string;
  cvFileUrl: string | null;
  cvFileName: string | null;
}

export interface CreateStudentProfileDto {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postcode: string;
  nationalInsuranceNumber: string;
  employmentPreference: 1 | 2;
  maxHoursPerWeek: number;
  expectedHourlyRate: number;
  preferredJobCategories: string;
  skills: string;
}

export interface UpdateStudentProfileDto {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postcode: string;
  employmentPreference: 1 | 2;
  maxHoursPerWeek: number;
  expectedHourlyRate: number;
  preferredJobCategories: string;
  skills: string;
}
