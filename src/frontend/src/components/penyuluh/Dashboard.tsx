import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Download,
  Edit,
  FileText,
  Info,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import type { Report } from "../../types";

interface DashboardProps {
  reports: Report[];
  onCreateReport: () => void;
  onViewHistory: () => void;
}

export function PenyuluhDashboard({
  reports,
  onCreateReport,
  onViewHistory,
}: DashboardProps) {
  const total = reports.length;
  const terkirim = reports.filter((r) => r.status === "Terkirim").length;
  const draf = reports.filter((r) => r.status === "Draf").length;

  const stats = [
    {
      label: "Total Laporan",
      value: total,
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
      label: "Laporan Draf",
      value: draf,
      icon: Edit,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Dashboard</h3>
        <p className="text-sm text-muted-foreground">
          Ringkasan aktivitas laporan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card data-ocid="dashboard.stats.card">
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
          <CardTitle className="text-base">Tentang Sistem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sistem ini digunakan untuk mencatat dan mengelola Laporan Rencana
            Kerja Harian (RKH) Penyuluh KB sesuai dengan Peraturan Menteri Nomor
            10.
          </p>
          <div className="space-y-2.5">
            {[
              {
                icon: Info,
                text: "Setiap Penyuluh KB wajib mengisi laporan harian yang mencakup kegiatan terencana, sasaran, indikator keberhasilan, dan informasi pelaksanaan kegiatan.",
              },
              {
                icon: CheckCircle,
                text: "Berdasarkan Peraturan Menteri (Permen) Nomor 10 tentang Penyuluh Keluarga Berencana.",
              },
              {
                icon: Download,
                text: "Laporan dapat diunduh dalam format PDF untuk keperluan dokumentasi.",
              },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              data-ocid="dashboard.create_report_button"
              className="bg-primary text-primary-foreground"
              onClick={onCreateReport}
            >
              Buat Laporan Baru
            </Button>
            <Button
              data-ocid="dashboard.history_button"
              variant="outline"
              onClick={onViewHistory}
            >
              Lihat Riwayat
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-primary/80">
            Lihat semua laporan yang telah dikirim oleh Penyuluh KB di menu
            Semua Laporan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
