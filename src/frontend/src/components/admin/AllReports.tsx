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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileX, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Report } from "../../types";

interface AllReportsProps {
  reports: Report[];
  onDelete: (id: string) => void;
}

function StatusBadge({ status }: { status: Report["status"] }) {
  if (status === "Terkirim") {
    return (
      <Badge className="bg-success/15 text-success border-0">Terkirim</Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-muted-foreground">
      Draf
    </Badge>
  );
}

function printReport(report: Report) {
  const win = window.open("", "_blank");
  if (!win) return;
  const ttHtml = report.tandatangan
    ? `<img src="${report.tandatangan}" style="max-height:80px;max-width:180px;object-fit:contain" alt="Tanda Tangan" />`
    : "<p style='font-style:italic;color:#999'>Tanda tangan tidak tersedia</p>";
  win.document.write(`
    <html><head><title>Laporan ${report.nomorLaporan}</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;max-width:700px;margin:auto}h2{margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:8px 12px;border:1px solid #ddd;vertical-align:top}td:first-child{width:200px;font-weight:600;background:#f5f5f5}.signature-section{margin-top:32px;text-align:right}.signature-box{display:inline-block;text-align:center;min-width:180px}</style>
    </head><body>
    <h2>Rencana Kerja Harian</h2>
    <p style="color:#666;margin-top:0">${report.nomorLaporan}</p>
    <table>
      <tr><td>Tanggal</td><td>${report.tanggal}</td></tr>
      <tr><td>Penyuluh</td><td>${report.penyuluh}</td></tr>
      <tr><td>Nama Kegiatan</td><td>${report.namaKegiatan}</td></tr>
      <tr><td>Sasaran</td><td>${report.sasaran}</td></tr>
      <tr><td>Metode</td><td>${report.metode}</td></tr>
      <tr><td>Lokasi</td><td>${report.lokasi}</td></tr>
      <tr><td>Waktu</td><td>${report.waktu}</td></tr>
      <tr><td>Indikator Keberhasilan</td><td>${report.indikator}</td></tr>
      <tr><td>Detail Pelaksanaan</td><td>${report.detail}</td></tr>
      <tr><td>Status</td><td>${report.status}</td></tr>
    </table>
    <div class="signature-section">
      <div class="signature-box">
        <p style="margin-bottom:8px;font-size:13px">Penyuluh KB,</p>
        ${ttHtml}
        <p style="margin-top:8px;font-weight:600;font-size:13px">${report.penyuluh}</p>
      </div>
    </div>
    </body></html>
  `);
  win.document.close();
  win.print();
}

export function AllReports({ reports, onDelete }: AllReportsProps) {
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterPenyuluh, setFilterPenyuluh] = useState("semua");

  const penyuluhList = Array.from(new Set(reports.map((r) => r.penyuluh)));

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.namaKegiatan.toLowerCase().includes(search.toLowerCase()) ||
      r.penyuluh.toLowerCase().includes(search.toLowerCase()) ||
      r.nomorLaporan.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "semua" || r.status === filterStatus;
    const matchPenyuluh =
      filterPenyuluh === "semua" || r.penyuluh === filterPenyuluh;
    return matchSearch && matchStatus && matchPenyuluh;
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Semua Laporan</h3>
        <p className="text-sm text-muted-foreground">
          Daftar seluruh laporan dari semua Penyuluh KB
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="Terkirim">Terkirim</SelectItem>
            <SelectItem value="Draf">Draf</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPenyuluh} onValueChange={setFilterPenyuluh}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Penyuluh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Penyuluh</SelectItem>
            {penyuluhList.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        {filtered.length === 0 ? (
          <div
            data-ocid="all_reports.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <FileX className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Tidak ada laporan ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="all_reports.table">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Laporan</TableHead>
                  <TableHead>Penyuluh</TableHead>
                  <TableHead>Nama Kegiatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((report, idx) => (
                  <TableRow
                    key={report.id}
                    data-ocid={`all_reports.item.${idx + 1}`}
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
                    <TableCell className="text-sm text-muted-foreground">
                      {report.nomorLaporan}
                    </TableCell>
                    <TableCell className="text-sm">{report.penyuluh}</TableCell>
                    <TableCell className="font-medium text-sm">
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
                          data-ocid={`all_reports.download_button.${idx + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title="Cetak laporan"
                          onClick={() => printReport(report)}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-ocid={`all_reports.delete_button.${idx + 1}`}
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
                ["Penyuluh", viewReport.penyuluh],
                ["Nama Kegiatan", viewReport.namaKegiatan],
                ["Sasaran", viewReport.sasaran],
                ["Metode", viewReport.metode],
                ["Lokasi", viewReport.lokasi],
                ["Waktu", viewReport.waktu],
                ["Indikator Keberhasilan", viewReport.indikator],
                ["Detail Pelaksanaan", viewReport.detail],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-muted-foreground w-44 flex-shrink-0">
                    {label}:
                  </span>
                  <span>{value || "-"}</span>
                </div>
              ))}
              <div className="flex gap-2">
                <span className="text-muted-foreground w-44 flex-shrink-0">
                  Status:
                </span>
                <StatusBadge status={viewReport.status} />
              </div>

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
                  size="sm"
                  variant="outline"
                  onClick={() => printReport(viewReport)}
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Cetak Laporan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="all_reports.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="all_reports.cancel_button">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="all_reports.confirm_button"
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
