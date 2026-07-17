export interface ShopOwnerProfileResponseDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  shopName: string;
  businessType: string;
  premisesLicenceNumber: string | null;
  shopAddress: string;
  city: string;
  postcode: string;
  businessVerificationStatus: number;
}

export interface CreateShopOwnerProfileDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  shopName: string;
  businessType: string;
  premisesLicenceNumber: string | null;
  shopAddress: string;
  city: string;
  postcode: string;
}

export interface UpdateShopOwnerProfileDto {
  fullName: string;
  phoneNumber: string;
  shopName: string;
  businessType: string;
  premisesLicenceNumber?: string | null;
  shopAddress: string;
  city: string;
  postcode: string;
}

export interface BusinessDocumentResponseDto {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: string;
}
