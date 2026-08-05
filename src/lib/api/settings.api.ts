import { apiClient } from './http';

export interface BusinessSettingsData {
  id: string;
  businessName: string;
  businessEmail: string | null;
  supportPhone: string | null;
  supportWhatsapp: string | null;
  businessLogo: string | null;
  businessAddress: string | null;
  website: string | null;
  gstin: string | null;
  fssaiLicense: string | null;
  currency: string;
  timezone: string;
  minimumOrderAmount: number;
  maximumOrderAmount: number;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  orderPreparationTimeMinutes: number;
  autoAcceptOrders: boolean;
  isOrderingEnabled: boolean;
  maintenanceMode: boolean;
  tax: TaxConfigData | null;
  payment: PaymentConfigData | null;
  delivery: DeliveryConfigData | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaxConfigData {
  id: string;
  name: string;
  sacCode: string | null;
  gstPercentage: number;
  gstType: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface PaymentConfigData {
  id: string;
  cashOnDeliveryEnabled: boolean;
  razorpayEnabled: boolean;
  razorpayKeyId: string | null;
  razorpayKeySecret: string | null;
}

export interface DeliveryConfigData {
  id: string;
  defaultDeliveryCharge: number;
  freeDeliveryAbove: number;
  minimumOrderAmount: number;
  maximumOrderAmount: number;
  allowScheduledDelivery: boolean;
  allowInstantDelivery: boolean;
  pincodes: PincodeData[];
}

export interface PincodeData {
  id: string;
  pincode: string;
  city: string | null;
  state: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const settingsApi = {
  getSettings: () =>
    apiClient.get<ApiResponse<BusinessSettingsData>>('/admin/settings'),

  updateBusiness: (data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<BusinessSettingsData>>('/admin/settings/business', data),

  updateTax: (data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<TaxConfigData>>('/admin/settings/tax', data),

  updatePayment: (data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<PaymentConfigData>>('/admin/settings/payment', data),

  updateDelivery: (data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<DeliveryConfigData>>('/admin/settings/delivery', data),

  addPincode: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<PincodeData>>('/admin/settings/pincodes', data),

  updatePincode: (id: string, data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<PincodeData>>(`/admin/settings/pincodes/${id}`, data),

  deletePincode: (id: string) =>
    apiClient.delete<ApiResponse<PincodeData>>(`/admin/settings/pincodes/${id}`),
};
