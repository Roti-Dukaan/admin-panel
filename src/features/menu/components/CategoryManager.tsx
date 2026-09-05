"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { X, Plus, GripVertical, Trash2, Edit3, Check } from "lucide-react";
import { useMenuStore } from "../hooks/useMenu";
import { Category, EMOJI_OPTIONS, COLOR_OPTIONS } from "../types/menu";
import { FoodImageUploader } from "./FoodImageUploader";

const CATEGORY_IMAGE_HINT = [
  "Recommended: 800 x 800 px",
  "Square image works best",
  "Formats: PNG, JPG, WebP, SVG | Max: 2MB",
];

function resetAddForm() {
  return { name: "", emoji: "🌾", color: COLOR_OPTIONS[0].value, bgColor: COLOR_OPTIONS[0].bg };
}

export function CategoryManager() {
  const {
    categoryModalOpen,
    closeCategoryModal,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useMenuStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(resetAddForm());
  const [editForm, setEditForm] = useState({ name: "", emoji: "", color: "", bgColor: "" });
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt),
    [categories],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleAddImageSelect = (file: File) => {
    setAddImageFile(file);
    setAddImagePreview(URL.createObjectURL(file));
  };

  const handleEditImageSelect = (file: File) => {
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const clearAddImage = () => {
    setAddImageFile(null);
    setAddImagePreview("");
  };

  const clearEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview("");
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await addCategory(
        { name: form.name.trim(), slug: "", emoji: form.emoji, color: form.color, bgColor: form.bgColor },
        addImageFile ?? undefined,
      );
      setForm(resetAddForm());
      clearAddImage();
      setShowAddForm(false);
    } catch {
      // error already logged in store
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (cat: Category) => {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      await updateCategory(
        cat.id,
        { name: editForm.name.trim(), emoji: editForm.emoji, color: editForm.color, bgColor: editForm.bgColor },
        editImageFile ?? undefined,
      );
      setEditingId(null);
      clearEditImage();
    } catch {
      // error already logged in store
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat: Category) => {
    deleteCategory(cat.id);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, emoji: cat.emoji, color: cat.color, bgColor: cat.bgColor });
    setEditImageFile(null);
    setEditImagePreview(cat.imageUrl || "");
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setForm(resetAddForm());
    clearAddImage();
  };

  const cancelEdit = () => {
    setEditingId(null);
    clearEditImage();
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || editingId) return;

    const oldIndex = sorted.findIndex((cat) => cat.id === active.id);
    const newIndex = sorted.findIndex((cat) => cat.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(sorted, oldIndex, newIndex).map((cat, index) => ({
      id: cat.id,
      displayOrder: index,
    }));

    setReorderError(null);
    try {
      await reorderCategories(reordered);
    } catch {
      setReorderError("Failed to save category order. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {categoryModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={closeCategoryModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Manage Categories</h2>
                <p className="text-sm text-gray-500">
                  {categories.length} categories · drag to reorder
                </p>
              </div>
              <button onClick={closeCategoryModal} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {reorderError ? (
              <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {reorderError}
              </div>
            ) : null}

            <div className="max-h-[400px] overflow-y-auto px-6 py-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={sorted.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sorted.map((cat, index) => (
                      <div key={cat.id}>
                        {editingId === cat.id ? (
                          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                              placeholder="Category name"
                              autoFocus
                            />
                            <FoodImageUploader
                              title="Category Image"
                              recommendations={CATEGORY_IMAGE_HINT}
                              accept="image/jpeg,image/png,image/webp,image/svg+xml"
                              compact
                              value={editImagePreview}
                              onChange={(url) => {
                                setEditImagePreview(url);
                                if (!url) clearEditImage();
                              }}
                              onFileSelect={handleEditImageSelect}
                            />
                            <div>
                              <p className="mb-1.5 text-xs font-medium text-gray-500">Emoji</p>
                              <div className="flex flex-wrap gap-1">
                                {EMOJI_OPTIONS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, emoji })}
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${
                                      editForm.emoji === emoji ? "bg-gray-900 ring-2 ring-gray-900" : "bg-gray-100 hover:bg-gray-200"
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="mb-1.5 text-xs font-medium text-gray-500">Color</p>
                              <div className="flex flex-wrap gap-1.5">
                                {COLOR_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, color: opt.value, bgColor: opt.bg })}
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${
                                      editForm.color === opt.value ? "ring-2 ring-gray-900" : "hover:ring-1 hover:ring-gray-300"
                                    } ${opt.bg}`}
                                  >
                                    <span className={`text-xs font-bold ${opt.value}`}>A</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleUpdate(cat)}
                                disabled={saving}
                                className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                              >
                                <Check className="h-3 w-3" /> {saving ? "Saving…" : "Save"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <SortableCategoryRow
                            cat={cat}
                            index={index}
                            onEdit={() => startEdit(cat)}
                            onDelete={() => handleDelete(cat)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {showAddForm && (
              <div className="mx-6 mb-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 space-y-3">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  placeholder="Category name"
                  autoFocus
                />
                <FoodImageUploader
                  title="Category Image"
                  recommendations={CATEGORY_IMAGE_HINT}
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  compact
                  value={addImagePreview}
                  onChange={(url) => {
                    setAddImagePreview(url);
                    if (!url) clearAddImage();
                  }}
                  onFileSelect={handleAddImageSelect}
                />
                <div>
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Emoji</p>
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setForm({ ...form, emoji })}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${
                          form.emoji === emoji ? "bg-gray-900 ring-2 ring-gray-900" : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Color</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, color: opt.value, bgColor: opt.bg })}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${
                          form.color === opt.value ? "ring-2 ring-gray-900" : "hover:ring-1 hover:ring-gray-300"
                        } ${opt.bg}`}
                      >
                        <span className={`text-xs font-bold ${opt.value}`}>A</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleAdd}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" /> {saving ? "Adding…" : "Add Category"}
                  </button>
                  <button
                    onClick={cancelAdd}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="border-t px-6 py-4">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4" /> Add Category
                </button>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SortableCategoryRow({
  cat,
  index,
  onEdit,
  onDelete,
}: {
  cat: Category;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between rounded-xl border bg-white px-4 py-3 transition-all ${
        isDragging ? "border-gray-300 shadow-md ring-2 ring-gray-200" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
          aria-label={`Drag to reorder ${cat.name}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="w-5 shrink-0 text-xs font-bold text-gray-400">{index + 1}</span>
        {cat.imageUrl ? (
          <img src={cat.imageUrl} alt={cat.name} className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-gray-200" />
        ) : (
          <span className="shrink-0 text-xl">{cat.emoji}</span>
        )}
        <div className="min-w-0">
          <span className={`text-sm font-semibold ${cat.color}`}>{cat.name}</span>
          <span className="ml-2 text-[11px] text-gray-400">{cat.slug}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
