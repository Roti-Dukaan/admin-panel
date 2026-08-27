"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppHomePageSectionType } from "@/features/app-home-page/types/app-home-page";
import { SECTION_TYPE_OPTIONS } from "@/features/app-home-page/types/app-home-page";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (type: AppHomePageSectionType) => void;
}

export function AddSectionDialog({ open, onOpenChange, onContinue }: AddSectionDialogProps) {
  const [type, setType] = useState<AppHomePageSectionType>("BANNER");

  useEffect(() => {
    if (open) setType("BANNER");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">Choose section type:</p>
        <div className="space-y-2">
          {SECTION_TYPE_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50">
              <input
                type="radio"
                name="sectionType"
                checked={type === option.value}
                onChange={() => setType(option.value)}
              />
              <span className="text-sm font-semibold text-gray-800">{option.label}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={() => { onContinue(type); onOpenChange(false); }}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
