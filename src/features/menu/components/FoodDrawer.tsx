"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { X, Save } from "lucide-react";
import { useMenuStore } from "../hooks/useMenu";
import { AVAILABILITY_CONFIG, CUSTOMER_LABEL_CONFIG, FoodCategory, Availability, CustomerLabel, HealthTag } from "../types/menu";
import { FoodImageUploader } from "./FoodImageUploader";
import { HealthTagSelector } from "./HealthTagSelector";
import { FoodPreview } from "./FoodPreview";

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

export function FoodDrawer() {
  const { drawerOpen, drawerMode, selectedFood, closeDrawer, addFood, updateFood, categories } = useMenuStore();
  const isView = drawerMode === "view";
  const isEdit = drawerMode === "edit";
  const isAdd = drawerMode === "add";

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      category: "veg",
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
        name: "", description: "", shortDescription: "", category: "veg",
        price: 0, preparationTime: 15, calories: 0, protein: 0, carbs: 0, fats: 0,
        servingSize: "1 bowl", healthTags: [], customerLabels: [], availability: "available",
        isVegetarian: true, isFeatured: false, displayOnWebsite: true, bestPairedWith: [],
      });
    }
  }, [selectedFood, isEdit, isView, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit && selectedFood) {
      updateFood(selectedFood.id, data);
    } else if (isAdd) {
      addFood(data);
    }
  };

  const toggleLabel = (label: CustomerLabel) => {
    const current = watch("customerLabels");
    setValue("customerLabels", current.includes(label) ? current.filter((l) => l !== label) : [...current, label]);
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30"
            onClick={closeDrawer}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-l bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isAdd ? "Add Food Item" : isEdit ? "Edit Food Item" : "Food Details"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isAdd ? "Create a new menu item" : isEdit ? "Update item details" : selectedFood?.name}
                </p>
              </div>
              <button onClick={closeDrawer} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
              <div className="space-y-6 px-6 py-5">
                {/* Image */}
                <Section title="Food Image">
                  <FoodImageUploader value={selectedFood?.imageUrl || ""} onChange={() => {}} />
                </Section>

                {/* Basic Info */}
                <Section title="Basic Information">
                  <Field label="Food Name" error={errors.name?.message}>
                    <Input {...register("name", { required: "Name is required" })} disabled={isView} placeholder="e.g. Jonna Roti" />
                  </Field>
                  <Field label="Category">
                    <Select {...register("category")} disabled={isView}>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.emoji} {cat.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Description" error={errors.description?.message}>
                    <Textarea {...register("description", { required: "Description is required" })} disabled={isView} rows={3} placeholder="Detailed description..." />
                  </Field>
                  <Field label="Short Description" error={errors.shortDescription?.message}>
                    <Input {...register("shortDescription", { required: "Short description is required" })} disabled={isView} placeholder="One-liner for cards" />
                  </Field>
                </Section>

                {/* Pricing */}
                <Section title="Pricing & Preparation">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Price (₹)" error={errors.price?.message}>
                      <Input type="number" {...register("price", { required: "Price is required", valueAsNumber: true })} disabled={isView} />
                    </Field>
                    <Field label="Preparation Time (min)" error={errors.preparationTime?.message}>
                      <Input type="number" {...register("preparationTime", { required: "Prep time is required", valueAsNumber: true })} disabled={isView} />
                    </Field>
                  </div>
                </Section>

                {/* Health Tags */}
                <Section title="Health Tags">
                  <HealthTagSelector
                    selected={(watch("healthTags") || []) as HealthTag[]}
                    onChange={(tags) => setValue("healthTags", tags)}
                  />
                </Section>

                {/* Customer Labels */}
                <Section title="Customer Labels">
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(CUSTOMER_LABEL_CONFIG) as [CustomerLabel, { label: string; color: string; bgColor: string }][]).map(([key, cfg]) => {
                      const isSelected = ((watch("customerLabels") || []) as string[]).includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleLabel(key)}
                          disabled={isView}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                            isSelected
                              ? `border-current ring-1 ring-current/20 ${cfg.bgColor} ${cfg.color}`
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </Section>

                {/* Availability */}
                <Section title="Availability">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Status">
                      <Select {...register("availability")} disabled={isView}>
                        {(Object.entries(AVAILABILITY_CONFIG) as [Availability, { label: string }][]).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </Select>
                    </Field>
                    <div className="space-y-3 pt-6">
                      <Checkbox label="Vegetarian" checked={watch("isVegetarian")} onChange={(v) => setValue("isVegetarian", v)} disabled={isView} />
                      <Checkbox label="Featured" checked={watch("isFeatured")} onChange={(v) => setValue("isFeatured", v)} disabled={isView} />
                      <Checkbox label="Display on Website" checked={watch("displayOnWebsite")} onChange={(v) => setValue("displayOnWebsite", v)} disabled={isView} />
                    </div>
                  </div>
                </Section>

                {/* Preview */}
                <Section title="Quick Preview">
                  <FoodPreview food={{
                    name: watchAll.name || "Food Item",
                    price: watchAll.price || 0,
                    category: watchAll.category,
                    shortDescription: watchAll.shortDescription,
                    isFeatured: watchAll.isFeatured,
                    isVegetarian: watchAll.isVegetarian,
                    preparationTime: watchAll.preparationTime,
                    healthTags: (watchAll.healthTags || []) as HealthTag[],
                    customerLabels: (watchAll.customerLabels || []) as CustomerLabel[],
                    nutrition: { calories: watchAll.calories, protein: watchAll.protein, carbs: watchAll.carbs, fats: watchAll.fats, servingSize: watchAll.servingSize },
                  }} />
                </Section>
              </div>

              {/* Footer */}
              {!isView && (
                <div className="sticky bottom-0 border-t bg-white px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={closeDrawer} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                      Cancel
                    </button>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800">
                      <Save className="h-4 w-4" />
                      {isAdd ? "Create Item" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
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
