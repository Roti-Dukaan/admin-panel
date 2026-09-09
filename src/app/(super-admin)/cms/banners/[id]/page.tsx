"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  AlertTriangle,
  Tag,
  Globe,
  ShoppingBag,
  Package,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHomepageBannerStore } from "@/features/homepage-banners/hooks/useHomepageBanners";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const REDIRECT_TYPES = [
  { value: "NONE", label: "None", icon: Globe, description: "No redirect action" },
  { value: "CATEGORY", label: "Category", icon: Tag, description: "Navigate to a category page" },
  { value: "PRODUCT", label: "Product", icon: ShoppingBag, description: "Navigate to product details" },
  { value: "SUBSCRIPTION", label: "Subscription", icon: Package, description: "Navigate to subscription page" },
  { value: "EXTERNAL_URL", label: "External URL", icon: ExternalLink, description: "Open an external link" },
];

const DESKTOP_RECOMMENDED = { width: 1920, height: 700, aspectRatio: "2.75 : 1" };
const MOBILE_RECOMMENDED = { width: 1080, height: 1350, aspectRatio: "4 : 5" };
const MAX_FILE_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function BannerEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const isNew = id === "new";

  const {
    editingBanner,
    loading,
    saving,
    error,
    successMessage,
    createBanner,
    updateBanner,
    loadBannerById,
    setEditingBanner,
    setActiveTab,
    clearMessages,
  } = useHomepageBannerStore();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    redirectType: "NONE" as string,
    redirectValue: "",
    isActive: false,
  });

  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [desktopWarning, setDesktopWarning] = useState<string | null>(null);
  const [mobileWarning, setMobileWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      if (!editingBanner || editingBanner.id !== id) {
        void loadBannerById(id);
      }
    } else {
      setEditingBanner(null);
    }
  }, [isNew, id, editingBanner, loadBannerById, setEditingBanner]);

  useEffect(() => {
    if (!isNew && editingBanner) {
      setForm({
        title: editingBanner.title || "",
        subtitle: editingBanner.subtitle || "",
        redirectType: editingBanner.redirectType || "NONE",
        redirectValue: editingBanner.redirectValue || "",
        isActive: editingBanner.isActive ?? false,
      });
      setDesktopPreview(editingBanner.desktopImageUrl);
      setMobilePreview(editingBanner.mobileImageUrl);
    }
  }, [isNew, editingBanner]);

  const validateImage = (file: File, type: 'desktop' | 'mobile'): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Allowed: JPG, PNG, WEBP`;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      return `File size (${sizeMb.toFixed(2)}MB) exceeds limit of ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  };

  const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const error = validateImage(file, 'desktop');
    if (error) {
      setDesktopWarning(error);
      return;
    }

    setDesktopWarning(null);
    setDesktopImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setDesktopPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const error = validateImage(file, 'mobile');
    if (error) {
      setMobileWarning(error);
      return;
    }

    setMobileWarning(null);
    setMobileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMobilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeDesktopImage = () => {
    setDesktopImage(null);
    setDesktopPreview(null);
    setDesktopWarning(null);
  };

  const removeMobileImage = () => {
    setMobileImage(null);
    setMobilePreview(null);
    setMobileWarning(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const formData = {
      ...form,
      redirectType: form.redirectType as any,
    };

    if (isNew) {
      await createBanner(formData, desktopImage, mobileImage);
    } else {
      await updateBanner(id, formData, desktopImage, mobileImage);
    }
  };

  const redirectTypeConfig = REDIRECT_TYPES.find((r) => r.value === form.redirectType);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title={isNew ? "Create Banner" : "Edit Banner"}
        subtitle={isNew ? "Add a new homepage carousel banner." : "Update banner details and images."}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/cms">
              <Button variant="outline" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Save className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Banner
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6"
          >
            {error}
            <button onClick={clearMessages} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-6"
          >
            {successMessage}
            <button onClick={clearMessages} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Banner Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Summer Special Offer"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g., Up to 50% off on all items"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Desktop Banner */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">Desktop Banner</h3>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                <p className="text-xs text-gray-500">
                  Recommended: {DESKTOP_RECOMMENDED.width} × {DESKTOP_RECOMMENDED.height} px ({DESKTOP_RECOMMENDED.aspectRatio})
                </p>
                <p className="text-xs text-gray-500">Max {MAX_FILE_SIZE_MB}MB · JPG, PNG, WEBP</p>
              </div>

              {desktopPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img src={desktopPreview} alt="Desktop preview" className="w-full aspect-[2.75/1] object-cover" />
                  <button
                    type="button"
                    onClick={removeDesktopImage}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center hover:border-gray-300 transition-colors">
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Upload Desktop Banner</p>
                  <label className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 cursor-pointer">
                    <Upload className="h-3 w-3" />
                    Choose File
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleDesktopImageChange} />
                  </label>
                </div>
              )}

              {desktopWarning && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {desktopWarning}
                </div>
              )}
            </div>

            {/* Mobile Banner */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">Mobile Banner</h3>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                <p className="text-xs text-gray-500">
                  Recommended: {MOBILE_RECOMMENDED.width} × {MOBILE_RECOMMENDED.height} px ({MOBILE_RECOMMENDED.aspectRatio})
                </p>
                <p className="text-xs text-gray-500">Max {MAX_FILE_SIZE_MB}MB · JPG, PNG, WEBP</p>
              </div>

              {mobilePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ maxWidth: '200px' }}>
                  <img src={mobilePreview} alt="Mobile preview" className="w-full aspect-[4/5] object-cover" />
                  <button
                    type="button"
                    onClick={removeMobileImage}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center hover:border-gray-300 transition-colors">
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Upload Mobile Banner</p>
                  <label className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 cursor-pointer">
                    <Upload className="h-3 w-3" />
                    Choose File
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMobileImageChange} />
                  </label>
                </div>
              )}

              {mobileWarning && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {mobileWarning}
                </div>
              )}
            </div>
          </div>

          {/* Redirect Configuration */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Redirect Configuration</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="redirectType">Redirect Type</Label>
                <Select
                  value={form.redirectType}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, redirectType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REDIRECT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4 text-gray-400" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.redirectType !== 'NONE' && (
                <div className="space-y-1.5">
                  <Label htmlFor="redirectValue">
                    {form.redirectType === 'EXTERNAL_URL'
                      ? 'External URL'
                      : form.redirectType === 'CATEGORY'
                      ? 'Category ID / Slug'
                      : form.redirectType === 'PRODUCT'
                      ? 'Product ID / Slug'
                      : 'Subscription Plan ID'}
                  </Label>
                  <Input
                    id="redirectValue"
                    value={form.redirectValue}
                    onChange={(e) => setForm((prev) => ({ ...prev, redirectValue: e.target.value }))}
                    placeholder={
                      form.redirectType === 'EXTERNAL_URL'
                        ? 'https://example.com'
                        : form.redirectType === 'CATEGORY'
                        ? 'Category ID or slug'
                        : form.redirectType === 'PRODUCT'
                        ? 'Product ID or slug'
                        : 'Subscription plan ID'
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Preview Helper */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Desktop Preview */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Desktop</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-white" style={{ aspectRatio: '2.75 / 1' }}>
                  {desktopPreview ? (
                    <img src={desktopPreview} alt="Desktop preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-sm text-gray-400">No desktop image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-white mx-auto" style={{ maxWidth: '200px', aspectRatio: '4 / 5' }}>
                  {mobilePreview ? (
                    <img src={mobilePreview} alt="Mobile preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-sm text-gray-400">No mobile image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Banner Guidelines</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Monitor className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Desktop Banner</p>
                  <p className="text-xs text-gray-500">1920 × 700 px · Landscape · 2.75:1 aspect ratio</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Mobile Banner</p>
                  <p className="text-xs text-gray-500">1080 × 1350 px · Portrait · 4:5 aspect ratio</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Safe Area</p>
                  <p className="text-xs text-gray-500">Keep important content inside the safe area. Avoid placing text near image edges.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ImageIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Image Format</p>
                  <p className="text-xs text-gray-500">WEBP preferred · Max {MAX_FILE_SIZE_MB}MB · JPG, PNG, WEBP accepted</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}