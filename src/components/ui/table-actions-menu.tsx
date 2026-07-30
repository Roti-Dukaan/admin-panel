"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TableActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  menuClassName?: string;
  menuWidth?: number;
}

export function TableActionsMenu({
  isOpen,
  onClose,
  onToggle,
  trigger,
  children,
  className,
  menuClassName,
  menuWidth = 208,
}: TableActionsMenuProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const showBelow = spaceBelow > Math.min(menuHeight, 160);
    const top = showBelow ? rect.bottom + 4 : Math.max(8, rect.top - menuHeight);

    let left = rect.right - menuWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    setCoords({ top, left });
  }, [isOpen, menuWidth]);

  return (
    <div ref={triggerRef} className={cn("relative inline-block", className)}>
      <div
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "fixed z-50 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg",
                menuClassName
              )}
              style={{ top: coords.top, left: coords.left, width: menuWidth }}
            >
              {children}
            </motion.div>
          </>,
          document.body
        )}
    </div>
  );
}
