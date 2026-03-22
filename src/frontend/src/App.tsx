import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { User as BackendUser, RKH_Laporan } from "./backend";
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
import { useActor } from "./hooks/useActor";
import type { AppState, Report, User } from "./types";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin@2024";

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

function toUIUser(u: BackendUser): User {
  const createdMs = Number(u.createdAt) / 1_000_000;
  const tanggalDaftar = createdMs
    ? new Date(createdMs).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  return {
    id: String(u.id),
    nama: u.nama,
    wilayah: u.wilayah,
    nip: u.nip ?? "",
    username: u.username,
    password: u.password,
    status: u.status === "Aktif" ? "Aktif" : "Menunggu",
    tanggalDaftar,
    tandatangan: u.tandatangan,
  };
}

function toUIReport(r: RKH_Laporan): Report {
  return {
    id: String(r.id),
    nomorLaporan: String(r.nomorLaporan),
    tanggal: r.tanggal,
    namaKegiatan: r.namaKegiatan,
    sasaran: r.sasaran,
    metode: r.metode,
    lokasi: r.lokasi,
    indikator: r.indikator,
    waktu: r.waktu,
    detail: r.detail,
    status: r.status === "Terkirim" ? "Terkirim" : "Draf",
    penyuluh: r.penyuluh,
    tandatangan: r.tandatangan,
  };
}

export default function App() {
  const { actor, isFetching } = useActor();
  const [appState, setAppState] = useState<AppState>("login");
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!actor) return;
    setLoadingUsers(true);
    try {
      const backendUsers = await actor.getAllUsers({});
      setUsers(backendUsers.map(toUIUser));
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoadingUsers(false);
    }
  }, [actor]);

  const loadReports = useCallback(
    async (penyuluh?: string) => {
      if (!actor) return;
      setLoadingReports(true);
      try {
        let backendReports: RKH_Laporan[];
        if (penyuluh) {
          backendReports = await actor.getLaporanByPenyuluh({ penyuluh });
        } else {
          backendReports = await actor.getAllLaporan({});
        }
        setReports(backendReports.map(toUIReport));
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat laporan");
      } finally {
        setLoadingReports(false);
      }
    },
    [actor],
  );

  const handleNavigate = (state: AppState) => {
    setAppState(state);
    setCurrentPage("dashboard");
  };

  const handleLoginAdmin = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Load data if actor available, but don't block login
      if (actor) {
        loadUsers().catch(console.error);
        loadReports().catch(console.error);
      }
      setAppState("app-admin");
      return true;
    }
    return false;
  };

  const handleLoginPenyuluh = async (
    username: string,
    password: string,
  ): Promise<"ok" | "pending" | "invalid"> => {
    if (!actor) {
      toast.error("Koneksi ke server belum siap, coba beberapa saat lagi");
      return "invalid";
    }
    try {
      const backendUser = await actor.loginUser({ username, password });
      if (!backendUser) {
        // Check if user exists but is pending approval
        try {
          const allUsers = await actor.getAllUsers({});
          const found = allUsers.find(
            (u) => u.username === username && u.password === password,
          );
          if (found) return "pending";
        } catch {
          // ignore
        }
        return "invalid";
      }
      const uiUser = toUIUser(backendUser);
      setCurrentUser(uiUser);
      await loadReports(uiUser.nama);
      setAppState("app-penyuluh");
      return "ok";
    } catch (err) {
      console.error(err);
      return "invalid";
    }
  };

  const handleLogout = () => {
    setAppState("login");
    setCurrentPage("dashboard");
    setCurrentUser(null);
    setUsers([]);
    setReports([]);
  };

  const handleRegisterUser = async (userData: Omit<User, "id">) => {
    if (!actor) {
      toast.error("Koneksi ke server belum siap, coba beberapa saat lagi");
      return;
    }
    try {
      await actor.registerUser({
        nama: userData.nama,
        wilayah: userData.wilayah,
        nip: userData.nip || undefined,
        username: userData.username,
        password: userData.password,
        tandatangan: userData.tandatangan || undefined,
      });
      toast.success("Pendaftaran berhasil! Menunggu persetujuan admin.");
      handleNavigate("pending");
    } catch (err) {
      console.error(err);
      toast.error("Pendaftaran gagal, coba lagi.");
    }
  };

  const handleSaveReport = async (
    data: Omit<Report, "id"> & { id?: string },
  ) => {
    if (!actor || !currentUser) return;
    try {
      await actor.createLaporan({
        namaKegiatan: data.namaKegiatan,
        tanggal: data.tanggal,
        sasaran: data.sasaran,
        metode: data.metode,
        lokasi: data.lokasi,
        indikator: data.indikator,
        waktu: data.waktu,
        detail: data.detail,
        penyuluh: data.penyuluh,
      });
      toast.success("Laporan berhasil disimpan");
      await loadReports(currentUser.nama);
      setEditingReport(null);
      setCurrentPage("riwayat");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan laporan");
    }
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setCurrentPage("buat-laporan");
  };

  const handleDeleteReport = async (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApproveUser = async (id: string) => {
    if (!actor) return;
    try {
      const ok = await actor.approveUser({ userId: BigInt(id) });
      if (ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, status: "Aktif" as const } : u,
          ),
        );
      } else {
        toast.error("Gagal menyetujui pengguna");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyetujui pengguna");
    }
  };

  const handleRejectUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleDeleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleUpdateUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const handlePageChange = async (page: Page) => {
    setCurrentPage(page);
    if (page === "manajemen-pengguna") {
      await loadUsers();
    } else if (page === "semua-laporan") {
      await loadReports();
    }
  };

  if (appState === "login") {
    return (
      <>
        <LoginPage
          onNavigate={handleNavigate}
          onLoginAdmin={handleLoginAdmin}
          onLoginPenyuluh={handleLoginPenyuluh}
          isActorReady={!!actor && !isFetching}
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
          actor={actor}
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
            loading={loadingUsers}
            onApprove={handleApproveUser}
            onReject={handleRejectUser}
            onDelete={handleDeleteUser}
            onUpdate={handleUpdateUser}
          />
        );
      }
      if (currentPage === "semua-laporan") {
        return (
          <AllReports
            reports={reports}
            loading={loadingReports}
            onDelete={handleDeleteReport}
          />
        );
      }
    }
    return null;
  };

  return (
    <>
      <AppLayout
        role={role}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
        pageTitle={pageTitles[currentPage] ?? ""}
        currentUser={currentUser}
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
