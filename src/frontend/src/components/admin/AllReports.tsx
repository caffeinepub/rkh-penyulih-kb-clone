import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { FileText, Loader2, Printer, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Report } from "../../types";

interface AllReportsProps {
  reports: Report[];
  loading?: boolean;
  onDelete: (id: string) => void;
}

export function AllReports({ reports, loading, onDelete }: AllReportsProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [penyuluhFilter, setPenyuluhFilter] = useState("semua");

  const penyuluhList = [...new Set(reports.map((r) => r.penyuluh))].sort();

  const filtered = reports.filter((r) => {
    const matchSearch =
      !search ||
      r.namaKegiatan.toLowerCase().includes(search.toLowerCase()) ||
      r.penyuluh.toLowerCase().includes(search.toLowerCase()) ||
      r.nomorLaporan.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || r.status === statusFilter;
    const matchPenyuluh =
      penyuluhFilter === "semua" || r.penyuluh === penyuluhFilter;
    return matchSearch && matchStatus && matchPenyuluh;
  });

  const handlePrint = () => {
    window.print();
    toast.info("Membuka dialog cetak...");
  };

  if (loading) {
    return (
      <div
        data-ocid="reports.loading_state"
        className="flex items-center justify-center py-24"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat laporan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Semua Laporan</h3>
          <p className="text-sm text-muted-foreground">
            Rekap seluruh laporan dari semua Penyuluh KB
          </p>
        </div>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Cetak
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="reports.search_input"
            placeholder="Cari laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            data-ocid="reports.status_select"
            className="w-full sm:w-40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="Draf">Draf</SelectItem>
            <SelectItem value="Terkirim">Terkirim</SelectItem>
          </SelectContent>
        </Select>
        <Select value={penyuluhFilter} onValueChange={setPenyuluhFilter}>
          <SelectTrigger
            data-ocid="reports.penyuluh_select"
            className="w-full sm:w-48"
          >
            <SelectValue />
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

      {filtered.length === 0 ? (
        <div
          data-ocid="reports.empty_state"
          className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card"
        >
          <FileText className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Tidak ada laporan ditemukan</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table data-ocid="reports.table">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>No. Laporan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Kegiatan</TableHead>
                  <TableHead>Penyuluh</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((report, idx) => (
                  <TableRow
                    key={report.id}
                    data-ocid={`reports.item.${idx + 1}`}
                  >
                    <TableCell className="text-sm font-mono">
                      {report.nomorLaporan}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.tanggal}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {report.namaKegiatan}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.penyuluh}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          report.status === "Terkirim"
                            ? "bg-success/15 text-success border-0"
                            : "bg-muted text-muted-foreground border-0"
                        }
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        data-ocid={`reports.delete_button.${idx + 1}`}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => {
                          onDelete(report.id);
                          toast.success("Laporan dihapus");
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
