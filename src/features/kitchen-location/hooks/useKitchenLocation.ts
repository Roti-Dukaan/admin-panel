import { create } from "zustand";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kitchenLocationApi, type KitchenLocation, type CreateKitchenLocationDTO, type UpdateKitchenLocationDTO, type KitchenLocationFilter } from "@/lib/api/kitchen-location.api";

interface KitchenLocationState {
  locations: KitchenLocation[];
  selectedLocation: KitchenLocation | null;
  isCreating: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  filter: KitchenLocationFilter;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  setSelectedLocation: (location: KitchenLocation | null) => void;
  setFilter: (filter: Partial<KitchenLocationFilter>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  fetchLocations: () => Promise<void>;
  createLocation: (data: CreateKitchenLocationDTO) => Promise<void>;
  updateLocation: (id: string, data: UpdateKitchenLocationDTO) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  setCreating: (isCreating: boolean) => void;
  setEditing: (isEditing: boolean) => void;
}

export const useKitchenLocationStore = create<KitchenLocationState>((set, get) => ({
  locations: [],
  selectedLocation: null,
  isCreating: false,
  isEditing: false,
  isDeleting: false,
  filter: {},
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },

  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setFilter: (newFilter) => set((state) => ({
    filter: { ...state.filter, ...newFilter },
    pagination: { ...state.pagination, page: 1 },
  })),
  setPage: (page) => set((state) => ({
    pagination: { ...state.pagination, page },
    filter: { ...state.filter, page },
  })),
  setLimit: (limit) => set((state) => ({
    pagination: { ...state.pagination, limit, page: 1 },
    filter: { ...state.filter, limit, page: 1 },
  })),

  fetchLocations: async () => {
    const { filter, pagination } = get();
    try {
      const response = await kitchenLocationApi.getAll();
      const { data } = response.data;
      set({ locations: data });
      return data;
    } catch (error) {
      console.error('Failed to fetch kitchen locations:', error);
      throw error;
    }
  },

  createLocation: async (data) => {
    set({ isCreating: true });
    try {
      const response = await kitchenLocationApi.create(data);
      const { data: newLocation } = response.data;
      set((state) => ({
        locations: [newLocation, ...state.locations],
        isCreating: false,
      }));
      return newLocation;
    } catch (error) {
      set({ isCreating: false });
      console.error('Failed to create kitchen location:', error);
      throw error;
    }
  },

  updateLocation: async (id, data) => {
    set({ isEditing: true });
    try {
      const response = await kitchenLocationApi.update(id, data);
      const { data: updatedLocation } = response.data;
      set((state) => ({
        locations: state.locations.map((loc) =>
          loc.id === id ? updatedLocation : loc
        ),
        selectedLocation: state.selectedLocation?.id === id ? updatedLocation : state.selectedLocation,
        isEditing: false,
      }));
      return updatedLocation;
    } catch (error) {
      set({ isEditing: false });
      console.error('Failed to update kitchen location:', error);
      throw error;
    }
  },

  deleteLocation: async (id) => {
    set({ isDeleting: true });
    try {
      await kitchenLocationApi.delete(id);
      set((state) => ({
        locations: state.locations.filter((loc) => loc.id !== id),
        selectedLocation: state.selectedLocation?.id === id ? null : state.selectedLocation,
        isDeleting: false,
      }));
    } catch (error) {
      set({ isDeleting: false });
      console.error('Failed to delete kitchen location:', error);
      throw error;
    }
  },

  setCreating: (isCreating) => set({ isCreating }),
  setEditing: (isEditing) => set({ isEditing }),
}));

export function useKitchenLocations(filters?: Partial<KitchenLocationFilter>) {
  const { filter, setFilter, setPage, setLimit, fetchLocations } = useKitchenLocationStore();

  const mergedFilter = { ...filter, ...filters };

  const query = useQuery({
    queryKey: ['kitchenLocations', mergedFilter],
    queryFn: fetchLocations,
    staleTime: 0,
  });

  return {
    ...query,
    filter: mergedFilter,
    setFilter,
    setPage,
    setLimit,
  };
}

export function useKitchenLocationForm() {
  const queryClient = useQueryClient();
  const {
    createLocation,
    updateLocation,
    deleteLocation,
    setCreating,
    setEditing,
  } = useKitchenLocationStore();

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenLocations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKitchenLocationDTO }) => updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenLocations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenLocations'] });
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    setCreating,
    setEditing,
  };
}
