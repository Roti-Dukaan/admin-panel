"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  GripVertical,
  X,
  Smartphone,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAppHomePageStore } from "@/features/app-home-page/hooks/useAppHomePageStore";
import { MobilePreview } from "@/features/app-home-page/components/MobilePreview";
import { AddSectionDialog } from "@/features/app-home-page/components/AddSectionDialog";
import { SectionEditorDialog } from "@/features/app-home-page/components/SectionEditorDialog";
import {
  sectionStatusLabel,
  sectionSummary,
  sectionTypeLabel,
} from "@/features/app-home-page/types/app-home-page";
import type { AppHomePageSection, AppHomePageSectionForm, AppHomePageSectionType, BannerUploadFiles } from "@/features/app-home-page/types/app-home-page";
import { citiesApi, type City } from "@/lib/api/master-data/cities.api";

export default function MobileAppHomePageCmsPage() {
  const {
    sections,
    previewSections,
    previewLocation,
    loading,
    saving,
    deleting,
    error,
    successMessage,
    editingSection,
    addSectionType,
    loadSections,
    setPreviewLocation,
    setEditingSection,
    setAddSectionType,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    clearMessages,
  } = useAppHomePageStore();

  const [addOpen, setAddOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<AppHomePageSectionType>("BANNER");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    loadSections();
    citiesApi.getAllActive().then((res) => setCities(res.data?.data ?? [])).catch(() => undefined);
  }, [loadSections]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(clearMessages, 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, clearMessages]);

  useEffect(() => {
    if (addSectionType) {
      setEditorType(addSectionType);
      setEditorOpen(true);
    }
  }, [addSectionType]);

  useEffect(() => {
    if (editingSection) {
      setEditorType(editingSection.sectionType);
      setEditorOpen(true);
    }
  }, [editingSection]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, index) => ({ id: s.id, order: index }));
    void reorderSections(reordered);
  };

  const openCreate = (type: AppHomePageSectionType) => {
    setEditingSection(null);
    setEditorType(type);
    setAddSectionType(type);
    setEditorOpen(true);
  };

  const handleSave = async (payload: AppHomePageSectionForm, files?: BannerUploadFiles) => {
    const ok = editingSection
      ? await updateSection(editingSection.id, payload, files)
      : await createSection(payload, files);
    if (ok) {
      setEditorOpen(false);
      setAddSectionType(null);
      setEditingSection(null);
    }
  };

  const formatMeta = (section: AppHomePageSection) => {
    const status = sectionStatusLabel(section);
    const dates =
      section.startAt || section.endAt
        ? `${section.startAt ? new Date(section.startAt).toLocaleDateString() : "—"} – ${section.endAt ? new Date(section.endAt).toLocaleDateString() : "—"}`
        : null;
    const locs = Array.isArray(section.targetLocations) && section.targetLocations.length
      ? section.targetLocations.join(", ")
      : "All locations";
    return [status, dates, locs].filter(Boolean).join(" | ");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Mobile App CMS"
        subtitle="Manage the mobile app home page with dynamic sections."
        actions={
          <Button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800">
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {(successMessage || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
            >
              {error ?? successMessage}
              <button onClick={clearMessages} className="ml-auto"><X className="h-4 w-4" /></button>
            </motion.div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="h-4 w-4" />
              Preview location
            </div>
            <select
              value={previewLocation}
              onChange={(e) => setPreviewLocation(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="">All locations</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>{city.name}</option>
              ))}
            </select>
            <button
              onClick={() => loadSections()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-500">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Loading sections...
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {sections.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
                      No sections yet. Add your first home page section.
                    </div>
                  ) : (
                    sections.map((section, index) => (
                      <SortableSectionRow
                        key={section.id}
                        section={section}
                        index={index}
                        meta={formatMeta(section)}
                        onEdit={() => setEditingSection(section)}
                        onDelete={() => { setDeleteId(section.id); setDeleteOpen(true); }}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <MobilePreview location={previewLocation || "All locations"} sections={previewSections} />
      </div>

      <AddSectionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onContinue={(type) => openCreate(type)}
      />

      <SectionEditorDialog
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) {
            setEditingSection(null);
            setAddSectionType(null);
            clearMessages();
          }
        }}
        sectionType={editorType}
        section={editingSection}
        saving={saving}
        saveError={error}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove Section"
        description="Remove this section from the mobile home page?"
        confirmLabel="Remove"
        variant="destructive"
        loading={deleting}
        onConfirm={async () => {
          if (deleteId) {
            await deleteSection(deleteId);
            setDeleteOpen(false);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}

function SortableSectionRow({
  section,
  index,
  meta,
  onEdit,
  onDelete,
}: {
  section: AppHomePageSection;
  index: number;
  meta: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 cursor-grab text-gray-300 hover:text-gray-500">
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">{index + 1}.</span>
            <h3 className="text-sm font-bold text-gray-900">{sectionTypeLabel(section.sectionType)}</h3>
          </div>
          <p className="mt-1 text-sm text-gray-700">{sectionSummary(section)}</p>
          <p className="mt-1 text-xs text-gray-500">{meta}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Edit">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Remove">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
