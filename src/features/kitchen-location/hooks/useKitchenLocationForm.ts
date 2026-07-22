import { KitchenLocation, CreateKitchenLocationDTO, UpdateKitchenLocationDTO } from './types/kitchen-location';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const kitchenLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150, 'Name must be less than 150 characters'),
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  deliveryRadiusKm: z.number()
    .min(1, 'Delivery radius must be at least 1 km')
    .max(50, 'Delivery radius must be less than or equal to 50 km'),
  deliveryCharge: z.number().min(0, 'Delivery charge must be at least 0'),
  estimatedDeliveryTime: z.string().optional(),
  isActive: z.boolean().default(true),
});

type KitchenLocationFormData = z.infer<typeof kitchenLocationSchema>;

export function useKitchenLocationForm(kitchen?: KitchenLocation | null) {
  const defaultValues: Partial<KitchenLocationFormData> = kitchen
    ? {
        name: kitchen.name,
        latitude: kitchen.latitude,
        longitude: kitchen.longitude,
        deliveryRadiusKm: kitchen.deliveryRadiusKm,
        deliveryCharge: kitchen.deliveryCharge,
        estimatedDeliveryTime: kitchen.estimatedDeliveryTime,
        isActive: kitchen.isActive,
      }
    : {
        name: '',
        latitude: 0,
        longitude: 0,
        deliveryRadiusKm: 1,
        deliveryCharge: 0,
        estimatedDeliveryTime: '',
        isActive: true,
      };

  const form = useForm<KitchenLocationFormData>({
    resolver: zodResolver(kitchenLocationSchema),
    defaultValues,
    mode: 'onChange',
  });

  const resetForm = (kitchen?: KitchenLocation | null) => {
    const values: Partial<KitchenLocationFormData> = kitchen
      ? {
          name: kitchen.name,
          latitude: kitchen.latitude,
          longitude: kitchen.longitude,
          deliveryRadiusKm: kitchen.deliveryRadiusKm,
          deliveryCharge: kitchen.deliveryCharge,
          estimatedDeliveryTime: kitchen.estimatedDeliveryTime,
          isActive: kitchen.isActive,
        }
      : {
          name: '',
          latitude: 0,
          longitude: 0,
          deliveryRadiusKm: 1,
          deliveryCharge: 0,
          estimatedDeliveryTime: '',
          isActive: true,
        };
    form.reset(values);
  };

  return {
    form,
    resetForm,
    schema: kitchenLocationSchema,
    defaultValues,
  };
}
