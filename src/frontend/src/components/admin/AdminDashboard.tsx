import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, Send, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Report, User } from "../../types";

interface AdminDashboardProps {
  reports: Report[];
  users: User[];
}

export function AdminDashboard({ reports, users }: AdminDashboardProps) {
  const totalLaporan = reports.length;
  const terkirim = reports.filter((r) => r.status === "Terkirim").length;
  const totalPengguna = users.length;
  const menunggu = users.filter((u) => u.status === "Menunggu").length;

  const stats = [
    {
      label: "Total Laporan",
      value: totalLaporan,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Laporan Terkirim",
      value: terkirim,
      icon: Send,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Total Pengguna",
      value: totalPengguna,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Menunggu Persetujuan",
      value: menunggu,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  const steps = [
    "Tinjau dan setujui pendaftaran pengguna baru di menu Manajemen Pengguna.",
    "Lihat semua laporan yang telah dikirim oleh Penyuluh KB di menu Semua Laporan.",
    "Laporan dapat diunduh dalam format PDF untuk keperluan dokumentasi.",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Dashboard Administrator</h3>
        <p className="text-sm text-muted-foreground">
          Ringkasan statistik sistem laporan rencana kerja harian
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {value}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${bg}`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Panduan Administrator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, i) => (
            <div key={step} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "oklch(var(--sidebar-primary))" }}
              >
                {i + 1}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
