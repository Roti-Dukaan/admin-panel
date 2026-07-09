"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FoodImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
}

export function FoodImageUploader({ value, onChange, onFileSelect }: FoodImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (onFileSelect) {
      onFileSelect(file);
    } else {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex h-40 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
        }`}
      >
        {value ? (
          <div className="relative h-full w-full">
            <img
              src={value}
              alt="Food item"
              className="h-full w-full rounded-xl object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-sm hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-1 text-xs text-gray-500">Drag & drop or click to upload</p>
            <p className="text-[10px] text-gray-400">PNG, JPG, WebP up to 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
