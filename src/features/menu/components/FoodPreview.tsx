"use client";

import { Star, Clock } from "lucide-react";
import { HEALTH_TAG_CONFIG, CUSTOMER_LABEL_CONFIG, CustomerLabel, HealthTag, FoodType } from "../types/menu";
import { useMenuStore } from "../hooks/useMenu";

interface FoodPreviewProps {
  food: {
    name: string;
    price: number;
    category?: string;
    shortDescription?: string;
    isFeatured?: boolean;
    foodType?: FoodType;
    preparationTime?: number;
    healthTags?: HealthTag[];
    customerLabels?: CustomerLabel[];
    nutrition?: { calories: number; protein: number; carbs: number; fats: number; servingSize: string };
    imageUrl?: string;
  };
}

export function FoodPreview({ food }: FoodPreviewProps) {
  const getCategoryByName = useMenuStore((s) => s.getCategoryByName);
  const category = food.category || "";
  const cat = getCategoryByName(category);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Image Placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-orange-100 to-amber-50">
        {food.imageUrl ? (
          <img
            src={food.imageUrl}
            alt={food.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl">{cat?.emoji || "🍽️"}</span>
          </div>
        )}
        {food.isFeatured && (
          <div className="absolute left-2 top-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Star className="h-2.5 w-2.5" /> Featured
            </span>
          </div>
        )}
        {food.customerLabels && food.customerLabels.length > 0 && (
          <div className="absolute right-2 top-2">
            {food.customerLabels.slice(0, 2).map((label) => {
              const cfg = CUSTOMER_LABEL_CONFIG[label];
              return cfg ? (
                <span key={label} className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bgColor} ${cfg.color}`}>
                  {cfg.label}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Name + Price */}
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">{food.name}</h3>
            {food.shortDescription && (
              <p className="text-xs text-gray-500 mt-0.5">{food.shortDescription}</p>
            )}
          </div>
          <span className="text-lg font-bold text-gray-900">₹{food.price}</span>
        </div>

        {/* Category + Time */}
        <div className="mb-3 flex items-center gap-2">
          {cat && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.bgColor} ${cat.color}`}>
              {cat.emoji} {cat.name}
            </span>
          )}
          {food.preparationTime && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <Clock className="h-3 w-3" /> {food.preparationTime} min
            </span>
          )}
          {food.foodType && (
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
              food.foodType === "VEG"
                ? "text-emerald-600"
                : food.foodType === "EGG"
                ? "text-orange-600"
                : "text-red-700"
            }`}>
              {food.foodType === "VEG" ? "Veg" : food.foodType === "EGG" ? "Egg" : "Non-Veg"}
            </span>
          )}
        </div>

        {/* Health Tags */}
        {food.healthTags && food.healthTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {food.healthTags.slice(0, 4).map((tag) => {
              const cfg = HEALTH_TAG_CONFIG[tag];
              return cfg ? (
                <span key={tag} className="inline-flex items-center gap-0.5 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                  {cfg.emoji} {cfg.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Nutrition Quick */}
        {food.nutrition && (
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-gray-50 p-2">
            <div className="text-center">
              <p className="text-[10px] text-gray-400">Cal</p>
              <p className="text-xs font-bold text-gray-700">{food.nutrition.calories}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400">Pro</p>
              <p className="text-xs font-bold text-gray-700">{food.nutrition.protein}g</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400">Carb</p>
              <p className="text-xs font-bold text-gray-700">{food.nutrition.carbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400">Fat</p>
              <p className="text-xs font-bold text-gray-700">{food.nutrition.fats}g</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
