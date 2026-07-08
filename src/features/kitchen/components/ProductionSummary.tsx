"use client";

import { motion } from "motion/react";
import { mockProductionData } from "../mock/kitchen-orders";

export function ProductionSummary() {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Production Summary</h2>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          Today&apos;s Targets
        </span>
      </div>

      <div className="space-y-5">
        {mockProductionData.map((category) => (
          <div key={category.label}>
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-gray-400">
              {category.label}
            </h3>
            <div className="space-y-2.5">
              {category.items.map((item) => {
                const remaining = item.required - item.prepared;
                const pct = Math.min(Math.round((item.prepared / item.required) * 100), 100);
                const isComplete = remaining <= 0;

                return (
                  <div key={item.name} className="group">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <span>{item.emoji}</span>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        <span className={`font-semibold ${isComplete ? "text-emerald-600" : "text-gray-900"}`}>
                          {item.prepared}
                        </span>
                        <span className="text-gray-400"> / {item.required}</span>
                        {!isComplete && (
                          <span className="ml-1 text-orange-500">({remaining} left)</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          isComplete ? "bg-emerald-500" : pct > 60 ? "bg-blue-500" : "bg-amber-400"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
