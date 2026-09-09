"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, GripVertical, Trash2, Edit3, Check } from "lucide-react";
import { useMenuStore } from "../hooks/useMenu";
import { Category, EMOJI_OPTIONS, COLOR_OPTIONS } from "../types/menu";

export function CategoryManager() {
  const { categoryModalOpen, closeCategoryModal, categories, addCategory, updateCategory, deleteCategory } = useMenuStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: "", emoji: "🌾", color: COLOR_OPTIONS[0].value, bgColor: COLOR_OPTIONS[0].bg });
  const [editForm, setEditForm] = useState({ name: "", emoji: "", color: "", bgColor: "" });

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    try {
      await addCategory({ name: form.name.trim(), slug: "", emoji: form.emoji, color: form.color, bgColor: form.bgColor });
      setForm({ name: "", emoji: "🌾", color: COLOR_OPTIONS[0].value, bgColor: COLOR_OPTIONS[0].bg });
      setShowAddForm(false);
    } catch {
      // error already logged in store
    }
  };

  const handleUpdate = (cat: Category) => {
    if (!editForm.name.trim()) return;
    updateCategory(cat.id, { name: editForm.name.trim(), emoji: editForm.emoji, color: editForm.color, bgColor: editForm.bgColor });
    setEditingId(null);
  };

  const handleDelete = (cat: Category) => {
    deleteCategory(cat.id);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, emoji: cat.emoji, color: cat.color, bgColor: cat.bgColor });
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
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Manage Categories</h2>
                <p className="text-sm text-gray-500">{categories.length} categories</p>
              </div>
              <button onClick={closeCategoryModal} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Category List */}
            <div className="max-h-[400px] overflow-y-auto px-6 py-4 space-y-2">
              {sorted.map((cat) => (
                <div key={cat.id} className="group">
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
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-gray-200 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <span className="text-xl">{cat.emoji}</span>
                        <div>
                          <span className={`text-sm font-semibold ${cat.color}`}>{cat.name}</span>
                          <span className="ml-2 text-[11px] text-gray-400">{cat.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(cat)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Form */}
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
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                  >
                    <Plus className="h-3 w-3" /> Add Category
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setForm({ name: "", emoji: "🌾", color: COLOR_OPTIONS[0].value, bgColor: COLOR_OPTIONS[0].bg }); }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
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
