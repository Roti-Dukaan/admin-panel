import { KitchenLocation, CreateKitchenLocationDTO, UpdateKitchenLocationDTO } from './types/kitchen-location';
import { useKitchenLocationStore } from './hooks/useKitchenLocation';
import { toast } from 'sonner';
import { useState } from 'react';

export function useKitchenLocationForm() {
  const {
    createLocation,
    updateLocation,
    deleteLocation,
    setCreating,
    setEditing,
  } = useKitchenLocationStore();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (data: CreateKitchenLocationDTO) => {
    try {
      setCreating(true);
      await createLocation(data);
      toast.success('Kitchen location created successfully');
      return true;
    } catch (error) {
      toast.error('Failed to create kitchen location');
      console.error(error);
      return false;
    } finally {
      setCreating(false);
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string, data: UpdateKitchenLocationDTO) => {
    try {
      setEditing(true);
      await updateLocation(id, data);
      toast.success('Kitchen location updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update kitchen location');
      console.error(error);
      return false;
    } finally {
      setEditing(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteLocation(id);
      toast.success('Kitchen location deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete kitchen location');
      console.error(error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isEditing,
    isDeleting,
    setIsCreating,
    setIsEditing,
  };
}

export function useKitchenLocationCRUD() {
  const {
    createLocation,
    updateLocation,
    deleteLocation,
    setCreating,
    setEditing,
  } = useKitchenLocationStore();

  const form = useKitchenLocationForm();

  const create = async (data: CreateKitchenLocationDTO) => {
    await form.handleCreate(data);
  };

  const update = async (id: string, data: UpdateKitchenLocationDTO) => {
    await form.handleUpdate(id, data);
  };

  const deleteLocationAction = async (id: string) => {
    await form.handleDelete(id);
  };

  return {
    create,
    update,
    delete: deleteLocationAction,
    ...form,
  };
}
