import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, PenLine, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import type { AppState, User } from "../types";
import { AuthLayout } from "./AuthPanel";

interface RegisterPageProps {
  onNavigate: (state: AppState) => void;
  onRegisterUser: (user: Omit<User, "id">) => Promise<void>;
  actor: backendInterface | null;
  isActorReady: boolean;
}

// Compress image to max 400x150 JPEG to stay well under ICP's 2MB message limit
function compressSignatureImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 400;
      const maxH = 150;
      let w = img.width;
      let h = img.height;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }
      if (h > maxH) {
        w = Math.round((w * maxH) / h);
        h = maxH;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function RegisterPage({
  onNavigate,
  onRegisterUser,
  actor,
  isActorReady,
}: RegisterPageProps) {
  const [form, setForm] = useState({
    nama: "",
    wilayah: "",
    nip: "",
    username: "",
    password: "",
    konfirmasiPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [tandatangan, setTandatangan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, dll)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const compressed = await compressSignatureImage(
          ev.target?.result as string,
        );
        setTandatangan(compressed);
      } catch {
        toast.error("Gagal memproses gambar tanda tangan");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCheckUsername = async (username: string) => {
    if (!actor || !username) return;
    try {
      const taken = await actor.isUsernameTaken({ username });
      if (taken) {
        toast.error("Username sudah digunakan, pilih yang lain");
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.wilayah || !form.username || !form.password) {
      toast.error("Nama, Wilayah Kerja, Username, dan Password wajib diisi");
      return;
    }
    if (form.password !== form.konfirmasiPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      await onRegisterUser({
        nama: form.nama,
        wilayah: form.wilayah,
        nip: form.nip,
        username: form.username,
        password: form.password,
        status: "Menunggu",
        tanggalDaftar: new Date().toISOString().split("T")[0],
        tandatangan: tandatangan ?? undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="shadow-md border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Daftar Akun Baru</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Isi data di bawah untuk mendaftarkan akun Anda. Akun akan aktif
            setelah disetujui oleh Admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isActorReady && (
              <div
                data-ocid="register.loading_state"
                className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2"
              >
                <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                <span>
                  Menghubungkan ke server... Pendaftaran akan diproses setelah
                  terhubung.
                </span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="nama">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="register.input"
                id="nama"
                placeholder="Masukkan nama lengkap"
                value={form.nama}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nama: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wilayah">
                Wilayah Kerja <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="register.wilayah_input"
                id="wilayah"
                placeholder="Contoh: BKKBN Provinsi Jawa Barat"
                value={form.wilayah}
                onChange={(e) =>
                  setForm((p) => ({ ...p, wilayah: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nip">Nomor Induk Pegawai (NIP)</Label>
              <Input
                data-ocid="register.nip_input"
                id="nip"
                placeholder="NIP (opsional)"
                value={form.nip}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nip: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="register.username_input"
                id="username"
                placeholder="Buat username unik Anda"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                onBlur={() => handleCheckUsername(form.username)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  data-ocid="register.password_input"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="konfirmasi">
                Konfirmasi Password <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="register.konfirmasi_input"
                id="konfirmasi"
                type="password"
                placeholder="Ulangi password Anda"
                value={form.konfirmasiPassword}
                onChange={(e) =>
                  setForm((p) => ({ ...p, konfirmasiPassword: e.target.value }))
                }
                autoComplete="new-password"
              />
            </div>

            {/* Tandatangan upload */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5" />
                Tanda Tangan
              </Label>
              {tandatangan ? (
                <div className="relative border border-border rounded-lg p-3 bg-muted/20">
                  <img
                    src={tandatangan}
                    alt="Tanda tangan"
                    className="max-h-24 mx-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTandatangan(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Klik X untuk hapus dan unggah ulang
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  data-ocid="register.tandatangan_dropzone"
                  className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Klik untuk mengunggah gambar tanda tangan
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    PNG, JPG, maksimal 5MB
                  </p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <Button
              data-ocid="register.submit_button"
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                "Daftar & Minta Persetujuan"
              )}
            </Button>
            <div className="text-center">
              <button
                type="button"
                data-ocid="register.link"
                className="text-sm text-primary hover:underline"
                onClick={() => onNavigate("login")}
              >
                ← Kembali ke halaman login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
