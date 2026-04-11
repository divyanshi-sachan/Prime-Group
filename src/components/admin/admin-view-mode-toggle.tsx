"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminViewMode } from "@/hooks/use-admin-view-mode";

export function AdminViewModeToggle({
  value,
  onChange,
  className = "",
}: {
  value: AdminViewMode;
  onChange: (v: AdminViewMode) => void;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex rounded-xl border p-1 bg-gray-50/80 shrink-0 ${className}`}
      style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
      role="group"
      aria-label="Table layout"
    >
      <Button
        type="button"
        variant={value === "list" ? "default" : "ghost"}
        size="sm"
        className={`gap-2 rounded-lg font-general ${value === "list" ? "text-white shadow-sm" : "text-gray-600"}`}
        style={value === "list" ? { backgroundColor: "var(--primary-blue)" } : undefined}
        onClick={() => onChange("list")}
        aria-pressed={value === "list"}
      >
        <LayoutList className="w-4 h-4" aria-hidden />
        List
      </Button>
      <Button
        type="button"
        variant={value === "cards" ? "default" : "ghost"}
        size="sm"
        className={`gap-2 rounded-lg font-general ${value === "cards" ? "text-white shadow-sm" : "text-gray-600"}`}
        style={value === "cards" ? { backgroundColor: "var(--primary-blue)" } : undefined}
        onClick={() => onChange("cards")}
        aria-pressed={value === "cards"}
      >
        <LayoutGrid className="w-4 h-4" aria-hidden />
        Cards
      </Button>
    </div>
  );
}
