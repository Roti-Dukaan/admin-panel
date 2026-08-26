"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Info } from "lucide-react";

interface FoodImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
  loading?: boolean;
  title?: string;
  recommendations?: string[];
  accept?: string;
  compact?: boolean;
}

export function FoodImageUploader({
  value,
  onChange,
  onFileSelect,
  loading = false,
  title = "Food Image",
  recommendations = [
    "Recommended: 1200 x 900 px",
    "Aspect ratio: 4:3",
    "Formats: PNG, JPG, WebP | Max: 5MB",
  ],
  accept = "image/jpeg,image/png,image/webp",
  compact = false,
}: FoodImageUploaderProps) {
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
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</h3>
        <div className="group relative">
          <Info className="h-3.5 w-3.5 cursor-help text-gray-400 hover:text-gray-600" />
          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-200 bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            <div className="space-y-1">
              {recommendations.map((line) => (
                <p key={line} className={line.startsWith("Recommended") ? "font-medium" : "text-gray-300"}>
                  {line}
                </p>
              ))}
            </div>
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          compact ? "h-28" : "h-40"
        } ${
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
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/40">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
            <p className="mt-2 text-xs font-medium text-white">Uploading to S3…</p>
          </div>
        )}
      </div>
    </div>
  );
}
