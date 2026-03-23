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

const SIGNATURE_STORAGE_KEY = (username: string) => `rkh_signature_${username}`;
const LOCAL_USERS_KEY = "rkh_pending_users";
const LOCAL_REPORTS_KEY = "rkh_local_reports";

interface LocalUser {
  id: string;
  nama: string;
  wilayah: string;
  nip: string;
  username: string;
  password: string;
  status: "Menunggu" | "Aktif";
  tanggalDaftar: string;
}

function getLocalUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalUser[]) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]): void {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function localUserToUI(u: LocalUser): User {
  return {
    id: u.id,
    nama: u.nama,
    wilayah: u.wilayah,
    nip: u.nip,
    username: u.username,
    password: u.password,
    status: u.status,
    tanggalDaftar: u.tanggalDaftar,
    tandatangan:
      localStorage.getItem(SIGNATURE_STORAGE_KEY(u.username)) ?? undefined,
  };
}

function getLocalReports(): Report[] {
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    return raw ? (JSON.parse(raw) as Report[]) : [];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: Report[]): void {
  localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
}

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
    tandatangan: undefined,
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
    lampiran: undefined,
  };
}

export default function App() {
  const { actor, isFetching } = useActor();
  const isActorReady = !!actor && !isFetching;
  const [appState, setAppState] = useState<AppState>("login");
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      let backendUsers: User[] = [];
      if (actor) {
        const raw = await actor.getAllUsers({});
        backendUsers = raw.map(toUIUser);
      }

      // Merge localStorage pending users, deduplicate by username
      const localUsers = getLocalUsers();
      const backendUsernames = new Set(backendUsers.map((u) => u.username));
      const filteredLocal = localUsers.filter(
        (lu) => !backendUsernames.has(lu.username),
      );
      // Update localStorage to remove any that made it to backend
      saveLocalUsers(filteredLocal);

      const merged = [...backendUsers, ...filteredLocal.map(localUserToUI)];
      setUsers(merged);
    } catch (err) {
      console.error(err);
      // On backend failure, still load local users
      const localUsers = getLocalUsers();
      setUsers(localUsers.map(localUserToUI));
    } finally {
      setLoadingUsers(false);
    }
  }, [actor]);

  const loadReports = useCallback(
    async (penyuluh?: string) => {
      setLoadingReports(true);
      try {
        let backendReports: Report[] = [];
        if (actor) {
          try {
            let raw: RKH_Laporan[];
            if (penyuluh) {
              raw = await actor.getLaporanByPenyuluh({ penyuluh });
            } else {
              raw = await actor.getAllLaporan({});
            }
            backendReports = raw.map(toUIReport);
          } catch (err) {
            console.error("Backend loadReports error:", err);
          }
        }

        // Merge localStorage reports
        const allLocal = getLocalReports();
        const localReports = penyuluh
          ? allLocal.filter((r) => r.penyuluh === penyuluh)
          : allLocal;

        // Deduplicate: prefer backend version if same id
        const backendIds = new Set(backendReports.map((r) => r.id));
        const uniqueLocal = localReports.filter((r) => !backendIds.has(r.id));

        setReports([...backendReports, ...uniqueLocal]);
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
    // Try backend first
    if (actor) {
      try {
        const backendUser = await actor.loginUser({ username, password });
        if (backendUser != null) {
          const uiUser = toUIUser(backendUser);
          const savedSignature = localStorage.getItem(
            SIGNATURE_STORAGE_KEY(uiUser.username),
          );
          if (savedSignature) {
            uiUser.tandatangan = savedSignature;
          }
          setCurrentUser(uiUser);
          await loadReports(uiUser.nama);
          setAppState("app-penyuluh");
          return "ok";
        }
        // User not found in backend, check if pending in backend
        try {
          const allUsers = await actor.getAllUsers({});
          const found = allUsers.find(
            (u) => u.username === username && u.password === password,
          );
          if (found) return "pending";
        } catch {
          // ignore
        }
      } catch (err) {
        console.error("Backend login error:", err);
        // Fall through to localStorage check
      }
    }

    // Check localStorage fallback
    const localUsers = getLocalUsers();
    const localUser = localUsers.find(
      (u) => u.username === username && u.password === password,
    );
    if (localUser) {
      if (localUser.status === "Menunggu") return "pending";
      if (localUser.status === "Aktif") {
        const uiUser = localUserToUI(localUser);
        setCurrentUser(uiUser);
        await loadReports(uiUser.nama);
        setAppState("app-penyuluh");
        return "ok";
      }
    }

    if (!actor) {
      toast.error("Koneksi ke server belum siap, coba beberapa saat lagi");
    }
    return "invalid";
  };

  const handleLogout = () => {
    setAppState("login");
    setCurrentPage("dashboard");
    setCurrentUser(null);
    setUsers([]);
    setReports([]);
  };

  const handleRegisterUser = async (userData: Omit<User, "id">) => {
    // Save signature to localStorage BEFORE calling backend (avoid 2MB ICP limit)
    if (userData.tandatangan) {
      localStorage.setItem(
        SIGNATURE_STORAGE_KEY(userData.username),
        userData.tandatangan,
      );
    }

    // Try backend first
    if (actor) {
      try {
        await actor.registerUser({
          nama: userData.nama,
          wilayah: userData.wilayah,
          nip: userData.nip || undefined,
          username: userData.username,
          password: userData.password,
          tandatangan: undefined,
        });
        toast.success("Pendaftaran berhasil! Menunggu persetujuan admin.");
        handleNavigate("pending");
        return;
      } catch (err) {
        console.error(
          "Backend registration error, using localStorage fallback:",
          err,
        );
        // Fall through to localStorage fallback
      }
    }

    // localStorage fallback
    try {
      const localUsers = getLocalUsers();
      // Check if username already taken
      const duplicate = localUsers.find(
        (u) => u.username === userData.username,
      );
      if (duplicate) {
        toast.error("Username sudah digunakan. Silakan pilih username lain.");
        return;
      }
      const newLocalUser: LocalUser = {
        id: `local_${Date.now()}`,
        nama: userData.nama,
        wilayah: userData.wilayah,
        nip: userData.nip || "",
        username: userData.username,
        password: userData.password,
        status: "Menunggu",
        tanggalDaftar: new Date().toISOString().split("T")[0],
      };
      localUsers.push(newLocalUser);
      saveLocalUsers(localUsers);
      toast.success("Pendaftaran berhasil! Menunggu persetujuan admin.");
      handleNavigate("pending");
    } catch (localErr) {
      console.error("localStorage fallback error:", localErr);
      toast.error("Pendaftaran gagal. Silakan coba lagi.");
    }
  };

  const handleSaveReport = async (
    data: Omit<Report, "id"> & { id?: string },
  ) => {
    if (!currentUser) return;

    // Try backend first
    if (actor) {
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
        // After reload, attach lampiran & tandatangan to the newly created report
        if (data.lampiran && data.lampiran.length > 0) {
          setReports((prev) => {
            const updated = [...prev];
            const idx = updated.findLastIndex(
              (r) => r.penyuluh === data.penyuluh && !r.lampiran,
            );
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                lampiran: data.lampiran,
                tandatangan: data.tandatangan,
              };
            }
            return updated;
          });
        }
        setEditingReport(null);
        setCurrentPage("riwayat");
        return;
      } catch (err) {
        console.error("Backend save report error, using localStorage:", err);
        // Fall through to localStorage
      }
    }

    // localStorage fallback
    try {
      const localReports = getLocalReports();

      if (data.id?.startsWith("local_report_")) {
        // Update existing local report
        const updated = localReports.map((r) =>
          r.id === data.id
            ? {
                ...r,
                nomorLaporan: data.nomorLaporan,
                tanggal: data.tanggal,
                namaKegiatan: data.namaKegiatan,
                sasaran: data.sasaran,
                metode: data.metode,
                lokasi: data.lokasi,
                indikator: data.indikator,
                waktu: data.waktu,
                detail: data.detail,
                status: data.status,
                penyuluh: data.penyuluh,
                tandatangan: data.tandatangan,
                lampiran: data.lampiran,
              }
            : r,
        );
        saveLocalReports(updated);
      } else {
        // Create new local report
        const newReport: Report = {
          id: `local_report_${Date.now()}`,
          nomorLaporan: data.nomorLaporan,
          tanggal: data.tanggal,
          namaKegiatan: data.namaKegiatan,
          sasaran: data.sasaran,
          metode: data.metode,
          lokasi: data.lokasi,
          indikator: data.indikator,
          waktu: data.waktu,
          detail: data.detail,
          status: data.status,
          penyuluh: data.penyuluh,
          tandatangan: data.tandatangan,
          lampiran: data.lampiran,
        };
        localReports.push(newReport);
        saveLocalReports(localReports);
      }

      toast.success("Laporan berhasil disimpan (offline)");
      await loadReports(currentUser.nama);
      setEditingReport(null);
      setCurrentPage("riwayat");
    } catch (localErr) {
      console.error("localStorage report save error:", localErr);
      toast.error("Gagal menyimpan laporan");
    }
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setCurrentPage("buat-laporan");
  };

  const handleDeleteReport = async (id: string) => {
    if (id.startsWith("local_report_")) {
      const localReports = getLocalReports();
      saveLocalReports(localReports.filter((r) => r.id !== id));
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApproveUser = async (id: string) => {
    // Handle localStorage users
    if (id.startsWith("local_")) {
      const localUsers = getLocalUsers();
      const updated = localUsers.map((u) =>
        u.id === id ? { ...u, status: "Aktif" as const } : u,
      );
      saveLocalUsers(updated);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "Aktif" as const } : u)),
      );
      // Fire-and-forget: try to register in backend
      const localUser = localUsers.find((u) => u.id === id);
      if (localUser && actor) {
        actor
          .registerUser({
            nama: localUser.nama,
            wilayah: localUser.wilayah,
            nip: localUser.nip || undefined,
            username: localUser.username,
            password: localUser.password,
            tandatangan: undefined,
          })
          .catch(console.error);
      }
      return;
    }

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
    if (id.startsWith("local_")) {
      const localUsers = getLocalUsers();
      saveLocalUsers(localUsers.filter((u) => u.id !== id));
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleDeleteUser = async (id: string) => {
    if (id.startsWith("local_")) {
      const localUsers = getLocalUsers();
      saveLocalUsers(localUsers.filter((u) => u.id !== id));
    }
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
          isActorReady={isActorReady}
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
          isActorReady={isActorReady}
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
            userName={currentUser?.nama}
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
