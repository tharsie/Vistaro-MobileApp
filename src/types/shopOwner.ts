export interface ShopOwnerProfileResponseDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  shopName: string;
  businessType: string;
  registrationNumber: string;
  address: string;
  city: string;
  postcode: string;
  isVerified: boolean;
  verificationStatus: string;
}

export interface CreateShopOwnerProfileDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  shopName: string;
  businessType: string;
  registrationNumber: string;
  address: string;
  city: string;
  postcode: string;
}

export interface UpdateShopOwnerProfileDto {
  fullName: string;
  phoneNumber: string;
  shopName: string;
  businessType: string;
  address: string;
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
