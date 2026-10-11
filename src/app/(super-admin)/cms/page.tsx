"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Plus,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  GripVertical,
  Image,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
} from "lucide-react";
import { useHomepageBannerStore } from "@/features/homepage-banners/hooks/useHomepageBanners";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export default function CmsBannersPage() {
  const router = useRouter();
  const {
    banners,
    total,
    loading,
    saving,
    deleting,
    error,
    successMessage,
    searchQuery,
    statusFilter,
    loadBanners,
    deleteBanner,
    toggleBannerStatus,
    setSearchQuery,
    setStatusFilter,
    setActiveTab,
    setEditingBanner,
    clearMessages,
  } = useHomepageBannerStore();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    if (successMessage || error) {
      const t = setTimeout(clearMessages, 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, error, clearMessages]);

  const handleDelete = (id: string) => {
    setBannerToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (bannerToDelete) {
      await deleteBanner(bannerToDelete);
      setDeleteConfirmOpen(false);
      setBannerToDelete(null);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleBannerStatus(id, !currentStatus);
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    router.push(`/cms/banners/${banner.id}`);
  };

  const handleCreate = () => {
    router.push('/cms/banners/new');
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updated = [...banners];
    const [dragged] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, dragged);

    const reordered = updated.map((banner, index) => ({
      id: banner.id,
      displayOrder: index,
    }));

    useHomepageBannerStore.getState().reorderBanners(reordered);
    setDraggedIndex(null);
  };

  const filteredBanners = banners.filter((banner) => {
    if (statusFilter === 'active' && !banner.isActive) return false;
    if (statusFilter === 'inactive' && banner.isActive) return false;
    if (searchQuery && !banner.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Website Banners"
        subtitle="Manage carousel banners for the customer website."
        actions={
          <Button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            New Banner
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Toast */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {successMessage}
            <button onClick={clearMessages} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
            <button onClick={clearMessages} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search banners..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "active", "inactive"] as const).map((filter) => {
              const labels = { all: "All", active: "Active", inactive: "Inactive" };
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    statusFilter === filter
                      ? "bg-gray-900 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => loadBanners()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </motion.div>

        {/* Banners Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-sm text-gray-500">Loading banners...</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 w-10"></th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Banner</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Order</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Start Date</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">End Date</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Created By</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBanners.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                        No banners found. Create your first homepage banner.
                      </td>
                    </tr>
                  ) : (
                    filteredBanners.map((banner, index) => (
                      <tr
                        key={banner.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className="hover:bg-gray-50/50 transition-colors cursor-grab"
                      >
                        <td className="px-6 py-4">
                          <GripVertical className="h-4 w-4 text-gray-300" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                              {banner.desktopImageUrl ? (
                                <img
                                  src={banner.desktopImageUrl}
                                  alt={banner.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Image className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{banner.title}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {banner.subtitle || "No subtitle"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={banner.isActive ? "default" : "secondary"}
                            className={banner.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}
                          >
                            {banner.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{banner.displayOrder}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{banner.createdBy || "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                              className={`rounded-lg p-1.5 transition-colors ${
                                banner.isActive
                                  ? "text-orange-500 hover:bg-orange-50"
                                  : "text-emerald-500 hover:bg-emerald-50"
                              }`}
                              title={banner.isActive ? "Deactivate" : "Activate"}
                            >
                              {banner.isActive ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(banner)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(banner.id)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Banner"
        description="Are you sure you want to delete this banner? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}