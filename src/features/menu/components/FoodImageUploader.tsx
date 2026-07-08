"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FoodImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function FoodImageUploader({ value, onChange }: FoodImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
        className={`relative flex h-40 items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
        }`}
      >
        {value ? (
          <div className="relative h-full w-full">
            <div className="flex h-full items-center justify-center rounded-xl bg-gray-100">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-sm hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-1 text-xs text-gray-500">Drag & drop or click to upload</p>
            <p className="text-[10px] text-gray-400">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-400">Mock upload — images are placeholder only</p>
    </div>
  );
}
