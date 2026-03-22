import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { PendingPage } from "./components/PendingPage";
import { RegisterPage } from "./components/RegisterPage";
import { AppLayout } from "./components/Sidebar";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AllReports } from "./components/admin/AllReports";
import { UserManagement } from "./components/admin/UserManagement";
import { PenyuluhDashboard } from "./components/penyuluh/Dashboard";
import { ReportForm } from "./components/penyuluh/ReportForm";
import { ReportHistory } from "./components/penyuluh/ReportHistory";
import { mockReports, mockUsers } from "./data/mockData";
import type { AppState, Report, User } from "./types";

type Page =
  | "dashboard"
  | "buat-laporan"
  | "riwayat"
  | "manajemen-pengguna"
  | "semua-laporan";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  "buat-laporan": "Buat Laporan",
  riwayat: "Riwayat Laporan",
  "manajemen-pengguna": "Manajemen Pengguna",
  "semua-laporan": "Semua Laporan",
};

export default function App() {
  const [appState, setAppState] = useState<AppState>("login");
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleNavigate = (state: AppState) => {
    setAppState(state);
    setCurrentPage("dashboard");
  };

  const handleLoginUser = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setAppState("login");
    setCurrentPage("dashboard");
    setCurrentUser(null);
  };

  const handleRegisterUser = (userData: Omit<User, "id">) => {
    const newUser: User = { ...userData, id: String(Date.now()) };
    setUsers((prev) => [...prev, newUser]);
  };

  const handleSaveReport = (data: Omit<Report, "id"> & { id?: string }) => {
    if (data.id) {
      setReports((prev) =>
        prev.map((r) => (r.id === data.id ? ({ ...r, ...data } as Report) : r)),
      );
    } else {
      const newReport: Report = { ...data, id: String(Date.now()) } as Report;
      setReports((prev) => [newReport, ...prev]);
    }
    setEditingReport(null);
    setCurrentPage("riwayat");
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setCurrentPage("buat-laporan");
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApproveUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "Aktif" as const } : u)),
    );
  };

  const handleRejectUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleUpdateUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  if (appState === "login") {
    return (
      <>
        <LoginPage
          onNavigate={handleNavigate}
          users={users}
          onLoginUser={handleLoginUser}
        />
        <Toaster />
      </>
    );
  }
  if (appState === "register") {
    return (
      <>
        <RegisterPage
          onNavigate={handleNavigate}
          onRegisterUser={handleRegisterUser}
        />
        <Toaster />
      </>
    );
  }
  if (appState === "pending") {
    return (
      <>
        <PendingPage onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  const role = appState === "app-admin" ? "admin" : "penyuluh";
  const myReports =
    role === "penyuluh" && currentUser
      ? reports.filter((r) => r.penyuluh === currentUser.nama)
      : reports;

  const renderPage = () => {
    if (role === "penyuluh") {
      if (currentPage === "dashboard") {
        return (
          <PenyuluhDashboard
            reports={myReports}
            onCreateReport={() => {
              setEditingReport(null);
              setCurrentPage("buat-laporan");
            }}
            onViewHistory={() => setCurrentPage("riwayat")}
          />
        );
      }
      if (currentPage === "buat-laporan") {
        return (
          <ReportForm
            initialReport={editingReport ?? undefined}
            userTandatangan={currentUser?.tandatangan}
            onSave={handleSaveReport}
            onCancel={() =>
              setCurrentPage(editingReport ? "riwayat" : "dashboard")
            }
          />
        );
      }
      if (currentPage === "riwayat") {
        return (
          <ReportHistory
            reports={myReports}
            onEdit={handleEditReport}
            onDelete={handleDeleteReport}
          />
        );
      }
    } else {
      if (currentPage === "dashboard") {
        return <AdminDashboard reports={reports} users={users} />;
      }
      if (currentPage === "manajemen-pengguna") {
        return (
          <UserManagement
            users={users}
            onApprove={handleApproveUser}
            onReject={handleRejectUser}
            onDelete={handleDeleteUser}
            onUpdate={handleUpdateUser}
          />
        );
      }
      if (currentPage === "semua-laporan") {
        return <AllReports reports={reports} onDelete={handleDeleteReport} />;
      }
    }
    return null;
  };

  return (
    <>
      <AppLayout
        role={role}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        pageTitle={pageTitles[currentPage] ?? ""}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </AppLayout>
      <Toaster />
    </>
  );
}
