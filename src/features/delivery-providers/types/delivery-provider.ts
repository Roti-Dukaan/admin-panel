import type {
  DeliveryProviderSettingsData,
  ProviderConfigData,
  ProviderHealthData,
  DeliveryEventLogData,
  PaginatedResponse,
} from '@/lib/api/delivery-provider.api';

export type {
  DeliveryProviderSettingsData,
  ProviderConfigData,
  ProviderHealthData,
  DeliveryEventLogData,
  PaginatedResponse,
};

export type DeliveryProviderTab = 'strategy' | 'providers' | 'health' | 'logs';

export const PROVIDER_LABELS: Record<string, string> = {
  SHADOWFAX: 'Shadowfax',
  BORZO: 'Borzo',
  PORTER: 'Porter',
  SHIPROCKET: 'Shiprocket',
  SELF_DELIVERY: 'Self Delivery',
};

export const PROVIDER_COLORS: Record<string, string> = {
  SHADOWFAX: 'bg-blue-500',
  BORZO: 'bg-emerald-500',
  PORTER: 'bg-purple-500',
  SHIPROCKET: 'bg-orange-500',
  SELF_DELIVERY: 'bg-gray-500',
};

export const STRATEGY_LABELS: Record<string, string> = {
  PRIMARY_FALLBACK: 'Primary + Fallback',
  CHEAPEST_QUOTE: 'Cheapest Quote',
  FASTEST_ETA: 'Fastest ETA',
  ROUND_ROBIN: 'Round Robin',
  MANUAL: 'Manual Provider',
};
