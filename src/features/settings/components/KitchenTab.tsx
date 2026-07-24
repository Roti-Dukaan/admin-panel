"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Plus, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { kitchenLocationApi, type KitchenLocation } from "@/lib/api/kitchen-location.api";

interface KitchenTabProps {
  saving: boolean;
}

const DEFAULT_KITCHEN: Partial<KitchenLocation> = {
  name: "Main Kitchen",
  latitude: 17.4933,
  longitude: 78.3916,
  deliveryRadiusKm: 10,
  isActive: true,
};

export function KitchenTab({ saving }: KitchenTabProps) {
  const [kitchens, setKitchens] = useState<KitchenLocation[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<KitchenLocation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<KitchenLocation>>(DEFAULT_KITCHEN);

  useEffect(() => {
    fetchKitchens();
  }, []);

  const fetchKitchens = async () => {
    setLoading(true);
    try {
      const res = await kitchenLocationApi.getAll();
      const data = res.data.data;
      setKitchens(data);
      if (data.length > 0) {
        setSelectedKitchen(data[0]);
        setFormData(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch kitchen locations:", error);
      toast.error("Failed to load kitchen locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKitchen = (kitchen: KitchenLocation) => {
    setSelectedKitchen(kitchen);
    setFormData(kitchen);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setSelectedKitchen(null);
    setFormData({
      name: "",
      latitude: 0,
      longitude: 0,
      deliveryRadiusKm: 1,
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (selectedKitchen) {
        await kitchenLocationApi.update(selectedKitchen.id, formData);
        toast.success("Kitchen location updated successfully");
      } else {
        const res = await kitchenLocationApi.create(formData as any);
        toast.success("Kitchen location created successfully");
        setSelectedKitchen(res.data.data);
      }
      setIsEditing(false);
      fetchKitchens();
    } catch (error) {
      console.error("Failed to save kitchen location:", error);
      toast.error("Failed to save kitchen location");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this kitchen location?")) return;
    try {
      await kitchenLocationApi.delete(id);
      toast.success("Kitchen location deleted successfully");
      if (selectedKitchen?.id === id) {
        setSelectedKitchen(null);
        setIsEditing(false);
      }
      fetchKitchens();
    } catch (error) {
      console.error("Failed to delete kitchen location:", error);
      toast.error("Failed to delete kitchen location");
    }
  };

  const handleReset = () => {
    if (selectedKitchen) {
      setFormData(selectedKitchen);
    } else {
      setFormData(DEFAULT_KITCHEN);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Kitchen Locations</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Kitchen</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-sm text-gray-500">Loading kitchen locations...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {kitchens.length > 0 ? (
              kitchens.map((kitchen) => (
                <div
                  key={kitchen.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedKitchen?.id === kitchen.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectKitchen(kitchen)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{kitchen.name}</h3>
                      <p className="text-sm text-gray-500">
                        {kitchen.latitude.toFixed(4)}, {kitchen.longitude.toFixed(4)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Radius: {kitchen.deliveryRadiusKm} km
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        kitchen.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {kitchen.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No kitchen locations configured</p>
                <button
                  onClick={handleAddNew}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Add your first kitchen location
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedKitchen || isEditing ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isEditing ? "Edit Kitchen Location" : "Kitchen Details"}
                  </h3>
                  {!isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEdit}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedKitchen!.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kitchen Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude || 0}
                        onChange={(e) => handleChange("latitude", parseFloat(e.target.value))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude || 0}
                        onChange={(e) => handleChange("longitude", parseFloat(e.target.value))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="0.5"
                      value={formData.deliveryRadiusKm || 1}
                      onChange={(e) => handleChange("deliveryRadiusKm", parseFloat(e.target.value))}
                      disabled={!isEditing}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 km</span>
                      <span>{formData.deliveryRadiusKm} km</span>
                      <span>50 km</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => handleChange("isActive", e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a kitchen location to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
