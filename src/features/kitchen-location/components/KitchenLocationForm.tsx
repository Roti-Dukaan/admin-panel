import { MapCard } from '@/components/MapCard';
import { useKitchenLocationForm, useKitchenLocationCRUD } from '@/features/kitchen-location/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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

interface KitchenLocationFormProps {
  initialData?: any;
  onSubmit?: (data: KitchenLocationFormData) => void;
  onCancel?: () => void;
}

export function KitchenLocationForm({
  initialData,
  onSubmit,
  onCancel,
}: KitchenLocationFormProps) {
  const {
    form,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KitchenLocationFormData>({
    resolver: zodResolver(kitchenLocationSchema),
    defaultValues: initialData || {
      name: '',
      latitude: 0,
      longitude: 0,
      deliveryRadiusKm: 1,
      deliveryCharge: 0,
      estimatedDeliveryTime: '',
      isActive: true,
    },
    mode: 'onChange',
  });

  const { latitude, longitude, deliveryRadiusKm } = watch();

  const { handleCreate, handleUpdate, isCreating, isEditing } = useKitchenLocationCRUD();

  const onFormSubmit = async (data: KitchenLocationFormData) => {
    const success = initialData
      ? await handleUpdate(initialData.id, data)
      : await handleCreate(data);

    if (success) {
      onSubmit?.(data);
    }
  };

  const handleMapChange = (lat: number, lng: number) => {
    setValue('latitude', lat, { shouldValidate: true });
    setValue('longitude', lng, { shouldValidate: true });
  };

  const handleRadiusChange = (newRadius: number) => {
    setValue('deliveryRadiusKm', newRadius, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {initialData ? 'Edit Kitchen Location' : 'Add New Kitchen Location'}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kitchen Name
              </label>
              <input
                {...form.register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Main Kitchen"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  {...form.register('latitude', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="17.4933"
                />
                {errors.latitude && (
                  <p className="text-sm text-red-600 mt-1">{errors.latitude.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  {...form.register('longitude', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="78.3916"
                />
                {errors.longitude && (
                  <p className="text-sm text-red-600 mt-1">{errors.longitude.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Radius (km)
              </label>
              <input
                {...form.register('deliveryRadiusKm', { valueAsNumber: true })}
                type="number"
                step="0.5"
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.deliveryRadiusKm && (
                <p className="text-sm text-red-600 mt-1">{errors.deliveryRadiusKm.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Charge (₹)
              </label>
              <input
                {...form.register('deliveryCharge', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
              />
              {errors.deliveryCharge && (
                <p className="text-sm text-red-600 mt-1">{errors.deliveryCharge.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery Time
              </label>
              <input
                {...form.register('estimatedDeliveryTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="35-45 mins"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                {...form.register('isActive')}
                type="checkbox"
                id="isActive"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div>
            <MapCard
              latitude={latitude || 0}
              longitude={longitude || 0}
              radius={deliveryRadiusKm || 1}
              name={form.watch('name') || 'Kitchen Location'}
              onPositionChange={handleMapChange}
              onRadiusChange={handleRadiusChange}
              minRadius={1}
              maxRadius={50}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isCreating || isEditing}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={form.handleSubmit(onFormSubmit)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isCreating || isEditing}
          >
            {isCreating || isEditing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.953 7.953 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
