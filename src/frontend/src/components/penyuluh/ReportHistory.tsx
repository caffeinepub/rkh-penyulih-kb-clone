import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileX,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Report } from "../../types";

interface ReportHistoryProps {
  reports: Report[];
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
}

function StatusBadge({ status }: { status: Report["status"] }) {
  if (status === "Terkirim") {
    return (
      <Badge className="bg-success/15 text-success border-0 hover:bg-success/20">
        Terkirim
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-muted-foreground">
      Draf
    </Badge>
  );
}

function getFileIcon(type: string) {
  if (type === "application/pdf") {
    return <FileText className="w-4 h-4 text-red-500" />;
  }
  if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FileText className="w-4 h-4 text-blue-500" />;
  }
  if (
    type === "application/vnd.ms-powerpoint" ||
    type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return <FileType className="w-4 h-4 text-orange-500" />;
  }
  if (
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
  }
  if (type.startsWith("image/")) {
    return <FileImage className="w-4 h-4 text-emerald-500" />;
  }
  return <FileText className="w-4 h-4 text-muted-foreground" />;
}

function downloadReport(report: Report) {
  const ttHtml = report.tandatangan
    ? `<img src="${report.tandatangan}" style="max-height:80px;max-width:180px;object-fit:contain" alt="Tanda Tangan" />`
    : "<p style='font-style:italic;color:#999'>Tanda tangan tidak tersedia</p>";

  const lampiranHtml =
    report.lampiran && report.lampiran.length > 0
      ? `<tr><td>Lampiran</td><td><ul style="margin:0;padding-left:16px">${report.lampiran.map((f) => `<li>${f.name}</li>`).join("")}</ul></td></tr>`
      : "";

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Laporan ${report.nomorLaporan}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; max-width: 700px; margin: auto; color: #1a1a1a; }
    h2 { margin-bottom: 4px; color: #1e3a5f; }
    .subtitle { color: #666; margin-top: 0; margin-bottom: 24px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    td { padding: 8px 12px; border: 1px solid #ddd; vertical-align: top; font-size: 14px; }
    td:first-child { width: 200px; font-weight: 600; background: #f5f5f5; }
    .signature-section { margin-top: 40px; text-align: right; }
    .signature-box { display: inline-block; text-align: center; min-width: 180px; }
    .signature-label { font-size: 13px; color: #444; margin-bottom: 8px; }
    .signature-name { margin-top: 8px; font-weight: 700; font-size: 13px; }
    .signature-role { font-size: 12px; color: #666; }
    .footer { margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px; font-size: 11px; color: #aaa; }
  </style>
</head>
<body>
  <h2>Rencana Kerja Harian</h2>
  <p class="subtitle">${report.nomorLaporan} &mdash; ${report.status}</p>
  <table>
    <tr><td>Tanggal</td><td>${report.tanggal || "-"}</td></tr>
    <tr><td>Nama Kegiatan</td><td>${report.namaKegiatan || "-"}</td></tr>
    <tr><td>Sasaran</td><td>${report.sasaran || "-"}</td></tr>
    <tr><td>Metode</td><td>${report.metode || "-"}</td></tr>
    <tr><td>Lokasi</td><td>${report.lokasi || "-"}</td></tr>
    <tr><td>Waktu</td><td>${report.waktu || "-"}</td></tr>
    <tr><td>Indikator Keberhasilan</td><td>${report.indikator || "-"}</td></tr>
    <tr><td>Detail Pelaksanaan</td><td>${report.detail || "-"}</td></tr>
    ${lampiranHtml}
  </table>
  <div class="signature-section">
    <div class="signature-box">
      <p class="signature-label">Penyuluh KB,</p>
      ${ttHtml}
      <p class="signature-name">${report.penyuluh || "-"}</p>
      <p class="signature-role">Penyuluh KB</p>
    </div>
  </div>
  <div class="footer">Dibuat dengan RKH Penyuluh KB &mdash; BKKBN</div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_${report.nomorLaporan.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Laporan berhasil diunduh");
}

export function ReportHistory({
  reports,
  onEdit,
  onDelete,
}: ReportHistoryProps) {
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Riwayat Laporan</h3>
        <p className="text-sm text-muted-foreground">
          Daftar laporan rencana kerja harian yang pernah dibuat
        </p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        {reports.length === 0 ? (
          <div
            data-ocid="history.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <FileX className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">
              Belum ada laporan
            </p>
            <p className="text-sm text-muted-foreground/60">
              Mulai buat laporan pertama Anda
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="history.table">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nomor Laporan</TableHead>
                  <TableHead>Nama Kegiatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report, idx) => (
                  <TableRow
                    key={report.id}
                    data-ocid={`history.item.${idx + 1}`}
                    className="cursor-pointer hover:bg-muted/20"
                    onClick={() => setViewReport(report)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setViewReport(report)
                    }
                    tabIndex={0}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="text-sm">{report.tanggal}</TableCell>
                    <TableCell className="font-medium text-sm">
                      {report.nomorLaporan}
                    </TableCell>
                    <TableCell className="text-sm">
                      {report.namaKegiatan}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Button
                          data-ocid={`history.edit_button.${idx + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => onEdit(report)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-ocid={`history.download_button.${idx + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => downloadReport(report)}
                          title="Unduh laporan"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-ocid={`history.delete_button.${idx + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(report.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewReport?.nomorLaporan} - Detail Laporan
            </DialogTitle>
          </DialogHeader>
          {viewReport && (
            <div className="space-y-3 text-sm">
              {[
                ["Tanggal", viewReport.tanggal],
                ["Nama Kegiatan", viewReport.namaKegiatan],
                ["Sasaran", viewReport.sasaran],
                ["Metode", viewReport.metode],
                ["Lokasi", viewReport.lokasi],
                ["Waktu", viewReport.waktu],
                ["Indikator Keberhasilan", viewReport.indikator],
                ["Detail Pelaksanaan", viewReport.detail],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-muted-foreground w-40 flex-shrink-0">
                    {label}:
                  </span>
                  <span className="text-foreground">{value || "-"}</span>
                </div>
              ))}
              <div className="flex gap-2">
                <span className="text-muted-foreground w-40 flex-shrink-0">
                  Status:
                </span>
                <StatusBadge status={viewReport.status} />
              </div>

              {/* Lampiran */}
              {viewReport.lampiran && viewReport.lampiran.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-40 flex-shrink-0">
                    Lampiran:
                  </span>
                  <div className="space-y-1">
                    {viewReport.lampiran.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        className="flex items-center gap-1.5"
                      >
                        {getFileIcon(f.type)}
                        <span className="text-xs">{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tanda tangan */}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-end">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Penyuluh KB,
                    </p>
                    {viewReport.tandatangan ? (
                      <img
                        src={viewReport.tandatangan}
                        alt="Tanda tangan"
                        className="max-h-16 max-w-[150px] object-contain border border-border/40 rounded p-1 bg-white"
                      />
                    ) : (
                      <div className="w-32 h-12 border border-dashed border-border/40 rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground/40">
                          -
                        </span>
                      </div>
                    )}
                    <p className="text-xs font-semibold">
                      {viewReport.penyuluh}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <Button
                  data-ocid="history.download_button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadReport(viewReport)}
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Unduh Laporan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="history.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Laporan akan dihapus secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="history.cancel_button">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="history.confirm_button"
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  toast.success("Laporan berhasil dihapus");
                  setDeleteId(null);
                }
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
