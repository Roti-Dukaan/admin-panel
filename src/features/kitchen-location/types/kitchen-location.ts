import type { KitchenLocation, CreateKitchenLocationDTO, UpdateKitchenLocationDTO } from './kitchen-location.api';

export interface KitchenLocationFilter {
  name?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export type {
  KitchenLocation,
  CreateKitchenLocationDTO,
  UpdateKitchenLocationDTO,
  KitchenLocationFilter,
};
