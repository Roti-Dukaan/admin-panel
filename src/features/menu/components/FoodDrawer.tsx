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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [addImageLoading, setAddImageLoading] = useState(false);
  const [editImageLoading, setEditImageLoading] = useState(false);

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
    setImageFile(null);
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
        name: "", description: "", shortDescription: "", category: "veg",
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
        const productRes = await addFood(data);
        // Then upload image
        await productApi.uploadImage(productRes.data.id, imageFile);
      } finally {
        setAddImageLoading(false);
      }
    } else if (isEdit && selectedFood && imageFile) {
      setEditImageLoading(true);
      try {
        // Update product with image
        await updateFood(selectedFood.id, data);
        await productApi.uploadImage(selectedFood.id, imageFile);
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
  };


data?: Never? {}