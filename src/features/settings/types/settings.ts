import type {
  BusinessSettingsData,
  TaxConfigData,
  PaymentConfigData,
  DeliveryConfigData,
  PincodeData,
} from '@/lib/api/settings.api';

export type {
  BusinessSettingsData,
  TaxConfigData,
  PaymentConfigData,
  DeliveryConfigData,
  PincodeData,
};

export type SettingsTab =
  | 'business'
  | 'tax'
  | 'payment'
  | 'delivery'
  | 'kitchen'
  | 'delivery-providers'
  | 'email'
  | 'order-escalation'
  | 'realtime-order-hours';
