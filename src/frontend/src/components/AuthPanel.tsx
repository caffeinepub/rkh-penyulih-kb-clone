import { CheckCircle, Download, Monitor, Shield } from "lucide-react";
import { motion } from "motion/react";

export function AuthLeftPanel() {
  return (
    <div className="hidden md:flex md:w-1/2 flex-col justify-between p-10 bg-sidebar text-sidebar-foreground">
      <div className="space-y-6">
        <div>
          <img
            src="/assets/uploads/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_-2024-.svg-1.png"
            alt="BKKBN Logo"
            className="h-20 w-auto object-contain mb-6"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold leading-snug">
            Sistem Laporan <br />
            <span style={{ color: "oklch(var(--sidebar-primary))" }}>
              Rencana Kerja Harian
            </span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Dashboard digital untuk Penyuluh KB dalam mencatat dan mengelola
            laporan rencana kerja harian sesuai Permen No. 10.
          </p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="space-y-3 mt-4"
        >
          {[
            "Pencatatan laporan digital yang mudah",
            "Manajemen pengguna berbasis persetujuan",
            "Unduh laporan dalam format PDF",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm text-white/80"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: "oklch(var(--sidebar-primary))" }}
              />
              {item}
            </li>
          ))}
        </motion.ul>
      </div>

      <p className="text-white/40 text-xs">
        © {new Date().getFullYear()} BKKBN Kemendukbangga
      </p>
    </div>
  );
}

export function AuthRightPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AuthLeftPanel />
      {/* Mobile header */}
      <div className="md:hidden bg-sidebar text-sidebar-foreground px-6 py-5">
        <img
          src="/assets/uploads/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_-2024-.svg-1.png"
          alt="BKKBN Logo"
          className="h-12 w-auto object-contain mb-2"
        />
        <p className="text-sm font-semibold">
          Sistem Laporan{" "}
          <span style={{ color: "oklch(var(--sidebar-primary))" }}>RKH</span>
        </p>
      </div>
      <AuthRightPanel>{children}</AuthRightPanel>
    </div>
  );
}

export { Shield, Monitor, CheckCircle, Download };
