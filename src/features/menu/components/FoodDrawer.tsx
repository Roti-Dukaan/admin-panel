"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { X, Save } from "lucide-react";
import { useMenuStore } from "../hooks/useMenu";
import { AVAILABILITY_CONFIG, CUSTOMER_LABEL_CONFIG, FoodCategory, Availability, CustomerLabel, HealthTag } from "../types/menu";
import { FoodImageUploader } from "./FoodImageUploader";
import { HealthTagSelector } from "./HealthTagSelector";
import { FoodPreview } from "./FoodPreview";
import { foodItemApi } from "@/lib/api/food.api";

interface FormData {
  name: string;
  description: string;
  shortDescription: string;
  category: FoodCategory;
  price: number;
  preparationTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  healthTags: HealthTag[];
  customerLabels: CustomerLabel[];
  availability: Availability;
  isVegetarian: boolean;
  isFeatured: boolean;
  displayOnWebsite: boolean;
  bestPairedWith: string[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:bg-gray-50 disabled:text-gray-500 ${props.className || ""}`} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:bg-gray-50 disabled:text-gray-500 ${props.className || ""}`} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:bg-gray-50 disabled:text-gray-500 ${props.className || ""}`} />;
}

function Checkbox({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export function FoodDrawer() {
  const { drawerOpen, drawerMode, selectedFood, closeDrawer, addFood, updateFood, reloadFoods, categories } = useMenuStore();
  const isView = drawerMode === "view";
  const isEdit = drawerMode === "edit";
  const isAdd = drawerMode === "add";
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);
  const [addImageLoading, setAddImageLoading] = useState(false);
  const [editImageLoading, setEditImageLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      category: "",
      price: 0,
      preparationTime: 15,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      servingSize: "1 bowl",
      healthTags: [],
      customerLabels: [],
      availability: "available",
      isVegetarian: true,
      isFeatured: false,
      displayOnWebsite: true,
      bestPairedWith: [],
    },
  });

  const watchAll = watch();

  useEffect(() => {
    setImageFile(null);
    setImagePreview("");
    setImageLoading(false);
    if (selectedFood && (isEdit || isView)) {
      reset({
        name: selectedFood.name,
        description: selectedFood.description,
        shortDescription: selectedFood.shortDescription,
        category: selectedFood.category,
        price: selectedFood.price,
        preparationTime: selectedFood.preparationTime,
        calories: selectedFood.nutrition.calories,
        protein: selectedFood.nutrition.protein,
        carbs: selectedFood.nutrition.carbs,
        fats: selectedFood.nutrition.fats,
        servingSize: selectedFood.nutrition.servingSize,
        healthTags: selectedFood.healthTags,
        customerLabels: selectedFood.customerLabels,
        availability: selectedFood.availability,
        isVegetarian: selectedFood.isVegetarian,
        isFeatured: selectedFood.isFeatured,
        displayOnWebsite: selectedFood.displayOnWebsite,
        bestPairedWith: selectedFood.bestPairedWith,
      });
    } else {
      reset({
        name: "", description: "", shortDescription: "", category: categories[0]?.name || "",
        price: 0, preparationTime: 15, calories: 0, protein: 0, carbs: 0, fats: 0,
        servingSize: "1 bowl", healthTags: [], customerLabels: [], availability: "available",
        isVegetarian: true, isFeatured: false, displayOnWebsite: true, bestPairedWith: [],
      });
    }
  }, [selectedFood, isEdit, isView, reset]);

  const onSubmit = async (data: FormData) => {
    if (isAdd && imageFile) {
      setAddImageLoading(true);
      try {
        // Create product first
        const createdId = await addFood(data);
        // Then upload image
        await foodItemApi.uploadImage(createdId, imageFile);
        await reloadFoods();
      } finally {
        setAddImageLoading(false);
      }
    } else if (isEdit && selectedFood && imageFile) {
      setEditImageLoading(true);
      try {
        // Update product with image
        await updateFood(selectedFood.id, data);
        await foodItemApi.uploadImage(selectedFood.id, imageFile);
        await reloadFoods();
      } finally {
        setEditImageLoading(false);
      }
    } else {
      // No image to upload, just create/update product
      if (isEdit && selectedFood) {
        updateFood(selectedFood.id, data);
      } else if (isAdd) {
        addFood(data);
      }
    }
  };

  const toggleLabel = (label: CustomerLabel) => {
    const current = watch("customerLabels");
    setValue("customerLabels", current.includes(label) ? current.filter((l) => l !== label) : [...current, label]);
  };

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isAdd ? "Add Food Item" : isEdit ? "Edit Food Item" : "View Food Item"}
              </h2>
              <button onClick={closeDrawer} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
              <Section title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Name" error={errors.name?.message}>
                    <Input {...register("name", { required: "Name is required" })} placeholder="Enter food name" />
                  </Field>

                  <Field label="Category">
                    <Select {...register("category")}>
                      {categories.length === 0 ? (
                        <option value="" disabled>No categories available</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.emoji} {cat.name}</option>
                        ))
                      )}
                    </Select>
                  </Field>

                  <Field label="Short Description" error={errors.shortDescription?.message}>
                    <Input {...register("shortDescription", { required: "Short description is required" })} placeholder="Brief description" />
                  </Field>

                  <Field label="Description" error={errors.description?.message}>
                    <Textarea {...register("description", { required: "Description is required" })} placeholder="Detailed description" rows={3} />
                  </Field>
                </div>
              </Section>

              <Section title="Pricing & Timing">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Price (₹)" error={errors.price?.message}>
                    <Input {...register("price", { required: "Price is required", min: { value: 0, message: "Price must be positive" } })} type="number" placeholder="0" />
                  </Field>

                  <Field label="Preparation Time (minutes)" error={errors.preparationTime?.message}>
                    <Input {...register("preparationTime", { required: "Preparation time is required", min: { value: 1, message: "Must be at least 1 minute" } })} type="number" placeholder="15" />
                  </Field>

                  <Field label="Serving Size" error={errors.servingSize?.message}>
                    <Input {...register("servingSize", { required: "Serving size is required" })} placeholder="e.g., 1 bowl" />
                  </Field>
                </div>
              </Section>

              <Section title="Nutrition Information">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Field label="Calories" error={errors.calories?.message}>
                    <Input {...register("calories", { min: { value: 0, message: "Calories must be non-negative" } })} type="number" placeholder="0" />
                  </Field>

                  <Field label="Protein (g)" error={errors.protein?.message}>
                    <Input {...register("protein", { min: { value: 0, message: "Protein must be non-negative" } })} type="number" placeholder="0" />
                  </Field>

                  <Field label="Carbs (g)" error={errors.carbs?.message}>
                    <Input {...register("carbs", { min: { value: 0, message: "Carbs must be non-negative" } })} type="number" placeholder="0" />
                  </Field>

                  <Field label="Fats (g)" error={errors.fats?.message}>
                    <Input {...register("fats", { min: { value: 0, message: "Fats must be non-negative" } })} type="number" placeholder="0" />
                  </Field>
                </div>
              </Section>

              <Section title="Tags & Labels">
                <div className="space-y-4">
                  <HealthTagSelector selected={watch("healthTags")} onChange={(tags) => setValue("healthTags", tags)} />
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-700">Customer Labels</h4>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(CUSTOMER_LABEL_CONFIG) as CustomerLabel[]).map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleLabel(label)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            watch("customerLabels").includes(label)
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {CUSTOMER_LABEL_CONFIG[label].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Availability & Display">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Availability">
                    <Select {...register("availability")}>
                      {(Object.keys(AVAILABILITY_CONFIG) as Availability[]).map((key) => (
                        <option key={key} value={key}>{AVAILABILITY_CONFIG[key].label}</option>
                      ))}
                    </Select>
                  </Field>

                  <div className="space-y-4">
                    <Checkbox label="Vegetarian" checked={watch("isVegetarian")} onChange={(v) => setValue("isVegetarian", v)} />
                    <Checkbox label="Featured" checked={watch("isFeatured")} onChange={(v) => setValue("isFeatured", v)} />
                    <Checkbox label="Display on Website" checked={watch("displayOnWebsite")} onChange={(v) => setValue("displayOnWebsite", v)} />
                  </div>
                </div>
              </Section>

              <FoodImageUploader value={imagePreview} onChange={() => {}} onFileSelect={handleFileSelect} loading={imageLoading} />

              {isEdit && selectedFood && (
                <FoodPreview food={selectedFood} />
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addImageLoading || editImageLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addImageLoading || editImageLoading ? (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {isAdd ? "Add Food" : "Update Food"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
