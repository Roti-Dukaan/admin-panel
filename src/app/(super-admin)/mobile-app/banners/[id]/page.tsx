"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Smartphone,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHomepageBannerStore } from "@/features/homepage-banners/hooks/useHomepageBanners";
import {
  MOBILE_APP_REDIRECT_OPTIONS,
  apiToPreset,
  presetToApiRedirect,
  type MobileAppRedirectPreset,
} from "@/features/homepage-banners/utils/mobile-banner-redirect";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const MOBILE_RECOMMENDED = { width: 1080, height: 384, aspectRatio: "2.8 : 1" };
const MAX_FILE_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function MobileAppBannerEditPage({ params }: { params: { id: string } }) {
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
    clearMessages,
  } = useHomepageBannerStore();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    redirectPreset: "NONE" as MobileAppRedirectPreset,
    redirectValue: "",
    isActive: false,
  });

  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
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
      const mapped = apiToPreset(editingBanner.redirectType, editingBanner.redirectValue);
      setForm({
        title: editingBanner.title || "",
        subtitle: editingBanner.subtitle || "",
        redirectPreset: mapped.preset,
        redirectValue: mapped.redirectValue,
        isActive: editingBanner.isActive ?? false,
      });
      setMobilePreview(editingBanner.mobileImageUrl ?? editingBanner.desktopImageUrl ?? null);
    }
  }, [isNew, editingBanner]);

  useEffect(() => {
    if (successMessage && !saving) {
      router.push("/mobile-app/banners");
    }
  }, [successMessage, saving, router]);

  const validateImage = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Allowed: JPG, PNG, WEBP`;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      return `File size (${sizeMb.toFixed(2)}MB) exceeds limit of ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const imageError = validateImage(file);
    if (imageError) {
      setMobileWarning(imageError);
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

  const removeMobileImage = () => {
    setMobileImage(null);
    setMobilePreview(null);
    setMobileWarning(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (isNew && !mobileImage && !mobilePreview) {
      setMobileWarning("Upload a mobile banner image before saving.");
      return;
    }

    const redirect = presetToApiRedirect(form.redirectPreset, form.redirectValue);
    const formData = {
      title: form.title.trim() || "Banner",
      subtitle: form.subtitle.trim() || undefined,
      redirectType: redirect.redirectType,
      redirectValue: redirect.redirectValue,
      isActive: form.isActive,
    };

    if (isNew) {
      await createBanner(formData, null, mobileImage);
    } else {
      await updateBanner(id, formData, null, mobileImage);
    }
  };

  const selectedRedirect = MOBILE_APP_REDIRECT_OPTIONS.find((item) => item.value === form.redirectPreset);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title={isNew ? "Create Mobile App Banner" : "Edit Mobile App Banner"}
        subtitle="Upload a banner for the mobile home carousel and choose where it should redirect."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/mobile-app/banners">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900">Mobile Banner Image</h3>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 text-xs text-amber-800">
              Recommended: {MOBILE_RECOMMENDED.width} × {MOBILE_RECOMMENDED.height} px ({MOBILE_RECOMMENDED.aspectRatio}) landscape banner for the home carousel. Max {MAX_FILE_SIZE_MB}MB.
            </div>

            {mobilePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 max-w-xl">
                <img src={mobilePreview} alt="Mobile preview" className="w-full aspect-[2.8/1] object-cover" />
                <button
                  type="button"
                  onClick={removeMobileImage}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center hover:border-gray-300 transition-colors max-w-xl">
                <ImageIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Upload mobile app banner</p>
                <label className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 cursor-pointer">
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

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Banner Text (optional)</h3>
            <p className="text-sm text-gray-500 -mt-3">
              Leave title empty for a full-image banner. Add title/subtitle to show text overlay on the left side.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Order Fresh Rotis Now"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g., Homemade Food, Fast Delivery"
                />
              </div>
              <div className="flex items-center justify-between sm:col-span-2">
                <Label htmlFor="isActive">Active on mobile app</Label>
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900">Redirect Page</h3>
            </div>
            <p className="text-sm text-gray-500 -mt-3">
              Choose where the customer goes when they tap this banner in the mobile app.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="redirectPreset">App page</Label>
                <Select
                  value={form.redirectPreset}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      redirectPreset: value as MobileAppRedirectPreset,
                      redirectValue: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOBILE_APP_REDIRECT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRedirect && (
                  <p className="text-xs text-gray-500 pt-1">{selectedRedirect.description}</p>
                )}
              </div>
              {selectedRedirect?.needsValue && (
                <div className="space-y-1.5">
                  <Label htmlFor="redirectValue">{selectedRedirect.valueLabel}</Label>
                  <Input
                    id="redirectValue"
                    value={form.redirectValue}
                    onChange={(e) => setForm((prev) => ({ ...prev, redirectValue: e.target.value }))}
                    placeholder={selectedRedirect.valuePlaceholder}
                  />
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
