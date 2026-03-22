import { Button } from "@/components/ui/button";
import {
  CirclePlus,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { AppState } from "../types";

type Page =
  | "dashboard"
  | "buat-laporan"
  | "riwayat"
  | "manajemen-pengguna"
  | "semua-laporan";

interface SidebarProps {
  role: "penyuluh" | "admin";
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onLogout: () => void;
}

const penyuluhNav = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "buat-laporan" as Page, label: "Buat Laporan", icon: CirclePlus },
  { id: "riwayat" as Page, label: "Riwayat Laporan", icon: History },
];

const adminNav = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  {
    id: "manajemen-pengguna" as Page,
    label: "Manajemen Pengguna",
    icon: Users,
  },
  { id: "semua-laporan" as Page, label: "Semua Laporan", icon: FileText },
];

function SidebarContent({
  role,
  currentPage,
  onPageChange,
  onLogout,
  onClose,
}: SidebarProps & { onClose?: () => void }) {
  const navItems = role === "admin" ? adminNav : penyuluhNav;
  const userName = role === "admin" ? "Administrator" : "Budi Santoso";
  const userRole = role === "admin" ? "Admin Sistem" : "Penyuluh KB";

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img
            src="/assets/uploads/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_-2024-.svg-1.png"
            alt="BKKBN"
            className="h-10 w-auto object-contain"
          />
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 px-5 py-4 border-b border-sidebar-border">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-sidebar-primary-foreground flex-shrink-0"
          style={{ backgroundColor: "oklch(var(--sidebar-primary))" }}
        >
          {userName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {userName}
          </p>
          <p className="text-xs text-sidebar-foreground/50">{userRole}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            data-ocid={`nav.${id}.link`}
            onClick={() => {
              onPageChange(id);
              onClose?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              currentPage === id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-5">
        <Button
          data-ocid="nav.logout_button"
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 text-sm"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Keluar
        </Button>
      </div>
    </div>
  );
}

export function AppLayout({
  role,
  currentPage,
  onPageChange,
  onLogout,
  pageTitle,
  children,
}: SidebarProps & { pageTitle: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const userName = role === "admin" ? "Administrator" : "Budi Santoso";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden md:flex md:w-64 flex-col flex-shrink-0">
        <SidebarContent
          role={role}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onLogout={onLogout}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 z-50 md:hidden"
            >
              <SidebarContent
                role={role}
                currentPage={currentPage}
                onPageChange={onPageChange}
                onLogout={onLogout}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-foreground">
              {pageTitle}
            </h2>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground"
            style={{ backgroundColor: "oklch(var(--sidebar-primary))" }}
          >
            {userName.charAt(0)}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export type { AppState };
