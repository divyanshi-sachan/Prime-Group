"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Shield,
  IndianRupee,
  PieChart,
  TrendingUp,
  FileText,
  HelpCircle,
  Mail,
  X,
  KeyRound,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: BarChart3, description: "Overview & stats" },
  { name: "Auth users", href: "/admin/auth-users", icon: KeyRound, description: "Auth accounts" },
  { name: "Profiles", href: "/admin/profiles", icon: Users, description: "Manage profiles" },
  { name: "Blogs", href: "/admin/blogs", icon: FileText, description: "Create & edit posts" },
  { name: "FAQs", href: "/admin/faqs", icon: HelpCircle, description: "Manage FAQs" },
  { name: "Contact", href: "/admin/contact", icon: Mail, description: "Form submissions" },
  { name: "Categories", href: "/admin/categories", icon: PieChart, description: "Category breakdown" },
  { name: "Revenue", href: "/admin/revenue", icon: TrendingUp, description: "Revenue & analytics" },
  { name: "Pricing", href: "/admin/pricing", icon: IndianRupee, description: "Plans & prices" },
  { name: "Settings", href: "/admin/settings", icon: Settings, description: "Configuration" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  /** Mobile drawer: closes the overlay menu (desktop hides this control). */
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed = false, onToggle, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const { createAdminBrowserClient } = await import("@/lib/supabase/client-admin");
      const supabase = createAdminBrowserClient();
      await supabase.auth.signOut();
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col border-r transition-all duration-300 ease-in-out relative",
        "bg-white shadow-sm",
        collapsed ? "w-20" : "w-64"
      )}
      style={{ borderColor: "rgba(212, 175, 55, 0.25)" }}
    >
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute top-4 -right-3 w-6 h-6 bg-white border rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 z-10 hidden lg:flex"
          style={{ borderColor: "var(--accent-gold)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" style={{ color: "var(--primary-blue)" }} />
          ) : (
            <ChevronLeft className="w-4 h-4" style={{ color: "var(--primary-blue)" }} />
          )}
        </button>
      )}

      <div
        className={cn("border-b transition-all duration-300 relative", collapsed ? "p-4" : "p-6")}
        style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}
      >
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg border bg-white shadow-sm hover:bg-gray-50"
            style={{ borderColor: "var(--accent-gold)", color: "var(--primary-blue)" }}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className={cn("flex items-center gap-3 mb-2", onMobileClose && "lg:pr-0 pr-11")}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--primary-blue)" }}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
                Prime Group
              </h1>
              <p className="text-sm font-general font-medium opacity-90" style={{ color: "var(--primary-blue)" }}>
                Admin Panel
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {!collapsed && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold font-general uppercase tracking-wider px-3 opacity-90" style={{ color: "var(--primary-blue)" }}>
              Navigation
            </h3>
          </div>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-xl text-sm font-semibold font-general transition-all duration-200",
                collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                isActive
                  ? "text-white shadow-md"
                  : "opacity-80 hover:opacity-100 hover:bg-gray-100"
              )}
              style={
                isActive
                  ? { backgroundColor: "var(--primary-blue)", color: "white" }
                  : { color: "var(--primary-blue)" }
              }
              title={collapsed ? item.name : undefined}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                  style={{ backgroundColor: "var(--accent-gold)" }}
                />
              )}
              <div
                className={cn(
                  "rounded-lg flex items-center justify-center flex-shrink-0",
                  collapsed ? "w-10 h-10" : "w-8 h-8",
                  isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-white/50"
                )}
              >
                <Icon className={cn(collapsed ? "w-5 h-5" : "w-4 h-4")} />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{item.name}</div>
                  <div className={cn("text-sm font-medium", isActive ? "text-white/90" : "opacity-90")}>
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t transition-all duration-300", collapsed ? "p-3" : "p-4")} style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
        {!collapsed && (
          <div
            className="rounded-xl p-3 mb-3 font-general text-sm font-medium"
            style={{ backgroundColor: "rgba(226, 194, 133, 0.2)", color: "var(--primary-blue)" }}
          >
            <div className="flex items-center gap-2 mb-1 font-semibold">
              <UserCircle className="w-4 h-4" />
              Admin
            </div>
            <p className="opacity-90">Admin panel access</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          aria-busy={loggingOut}
          className={cn(
            "flex items-center w-full rounded-xl text-sm font-semibold font-general text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-60",
            collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <div className="rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 hover:bg-red-100" style={{ color: "var(--primary-blue)" }}>
            {loggingOut ? (
              <Loader2 className={cn("animate-spin", collapsed ? "w-5 h-5" : "w-4 h-4")} aria-hidden />
            ) : (
              <LogOut className={cn(collapsed ? "w-5 h-5" : "w-4 h-4")} aria-hidden />
            )}
          </div>
          {!collapsed && <span className="truncate">{loggingOut ? "Signing out…" : "Logout"}</span>}
        </button>
      </div>
    </div>
  );
}
