import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  PenLine,
  Plus,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { LampiranFile, Report, ReportStatus } from "../../types";

interface ReportFormProps {
  initialReport?: Partial<Report>;
  userTandatangan?: string;
  userName?: string;
  onSave: (report: Omit<Report, "id"> & { id?: string }) => void;
  onCancel: () => void;
}

const emptyForm = {
  nomorLaporan: "",
  tanggal: "",
  namaKegiatan: "",
  sasaran: "",
  metode: "",
  lokasi: "",
  indikator: "",
  waktu: "",
  detail: "",
};

function getFileIcon(type: string) {
  if (type === "application/pdf") {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FileText className="w-5 h-5 text-blue-500" />;
  }
  if (
    type === "application/vnd.ms-powerpoint" ||
    type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return <FileType className="w-5 h-5 text-orange-500" />;
  }
  if (
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  }
  if (type.startsWith("image/")) {
    return <FileImage className="w-5 h-5 text-emerald-500" />;
  }
  return <FileText className="w-5 h-5 text-muted-foreground" />;
}

export function ReportForm({
  initialReport,
  userTandatangan,
  userName,
  onSave,
  onCancel,
}: ReportFormProps) {
  const [form, setForm] = useState({ ...emptyForm, ...initialReport });
  const [lampiran, setLampiran] = useState<LampiranFile[]>(
    initialReport?.lampiran ?? [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (lampiran.length >= 2) {
      toast.error("Maksimal 2 lampiran");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLampiran((prev) => [
        ...prev,
        { name: file.name, type: file.type, dataUrl },
      ]);
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (idx: number) => {
    setLampiran((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = (status: ReportStatus) => {
    if (!form.nomorLaporan || !form.tanggal) {
      toast.error("Nomor Laporan dan Tanggal wajib diisi");
      return;
    }
    onSave({
      ...(initialReport?.id ? { id: initialReport.id } : {}),
      ...form,
      status,
      penyuluh: userName || "",
      tandatangan: userTandatangan,
      lampiran,
    });
    toast.success(
      status === "Terkirim"
        ? "Laporan berhasil dikirim!"
        : "Laporan disimpan sebagai draf.",
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Buat Laporan</h3>
        <p className="text-sm text-muted-foreground">
          Daftar laporan rencana kerja harian yang pernah dibuat
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Form Laporan RKH</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nomor">
                Nomor Laporan <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="report_form.nomor_input"
                id="nomor"
                value={form.nomorLaporan}
                onChange={(e) => set("nomorLaporan", e.target.value)}
                placeholder="RKH-001"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tanggal">
                Tanggal <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="report_form.tanggal_input"
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => set("tanggal", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kegiatan">Nama Kegiatan yang Direncanakan</Label>
            <Input
              data-ocid="report_form.kegiatan_input"
              id="kegiatan"
              value={form.namaKegiatan}
              onChange={(e) => set("namaKegiatan", e.target.value)}
              placeholder="Nama kegiatan yang akan dilaksanakan"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sasaran">
                Sasaran <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="report_form.sasaran_input"
                id="sasaran"
                value={form.sasaran}
                onChange={(e) => set("sasaran", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="metode">
                Metode Kegiatan <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="report_form.metode_input"
                id="metode"
                value={form.metode}
                onChange={(e) => set("metode", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lokasi">
                Lokasi Kegiatan <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="report_form.lokasi_input"
                id="lokasi"
                value={form.lokasi}
                onChange={(e) => set("lokasi", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="waktu">Waktu Pelaksanaan</Label>
              <Input
                data-ocid="report_form.waktu_input"
                id="waktu"
                value={form.waktu}
                onChange={(e) => set("waktu", e.target.value)}
                placeholder="09:00 - 11:00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="indikator">Indikator Keberhasilan</Label>
            <Textarea
              data-ocid="report_form.indikator_textarea"
              id="indikator"
              value={form.indikator}
              onChange={(e) => set("indikator", e.target.value)}
              placeholder="Indikator pencapaian keberhasilan kegiatan"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="detail">Detail Pelaksanaan</Label>
            <Textarea
              data-ocid="report_form.detail_textarea"
              id="detail"
              value={form.detail}
              onChange={(e) => set("detail", e.target.value)}
              placeholder="Catatan tambahan mengenai pelaksanaan"
              rows={3}
            />
          </div>

          {/* Lampiran */}
          <div className="space-y-2">
            <Label>Lampiran (Maks. 2 berkas)</Label>
            <div className="space-y-2">
              {lampiran.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  data-ocid={`report_form.lampiran.item.${idx + 1}`}
                  className="flex items-center gap-3 border border-border rounded-lg px-3 py-2.5 bg-muted/20"
                >
                  <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.type || "Berkas"}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`report_form.lampiran_remove.${idx + 1}`}
                    onClick={() => handleRemoveFile(idx)}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {lampiran.length < 2 && (
                <button
                  type="button"
                  data-ocid="report_form.lampiran_upload"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 text-sm text-muted-foreground cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    Tambah Lampiran
                    {lampiran.length === 1
                      ? " (sisa 1 slot)"
                      : " (PDF, Word, PPT, Excel, Gambar, dll)"}
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="*"
                className="hidden"
                onChange={handleAddFile}
              />
            </div>
          </div>

          {/* Tanda Tangan Penyuluh */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <PenLine className="w-3.5 h-3.5" />
              Tanda Tangan Penyuluh
            </Label>
            {userTandatangan ? (
              <div className="border border-border rounded-lg p-4 bg-muted/10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground">
                    Tanda tangan otomatis dari profil Anda
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <img
                    src={userTandatangan}
                    alt="Tanda tangan penyuluh"
                    className="max-h-20 max-w-[200px] object-contain border border-border/40 rounded p-1 bg-white"
                  />
                  <p className="text-xs text-muted-foreground font-medium">
                    {userName || ""}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Penyuluh KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-lg p-4 bg-muted/5 text-center">
                <PenLine className="w-5 h-5 text-muted-foreground/40 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">
                  Tanda tangan belum diunggah. Silakan unggah tanda tangan saat
                  pendaftaran akun.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              data-ocid="report_form.cancel_button"
              variant="outline"
              onClick={onCancel}
            >
              Batal
            </Button>
            <Button
              data-ocid="report_form.draft_button"
              variant="outline"
              onClick={() => submit("Draf")}
            >
              Simpan Draf
            </Button>
            <Button
              data-ocid="report_form.submit_button"
              className="bg-primary text-primary-foreground"
              onClick={() => submit("Terkirim")}
            >
              Kirim Laporan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
