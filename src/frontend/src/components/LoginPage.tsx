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
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, LogIn, Monitor, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppState } from "../types";
import { AuthLayout } from "./AuthPanel";

interface LoginPageProps {
  onNavigate: (state: AppState) => void;
  onLoginAdmin: (username: string, password: string) => Promise<boolean>;
  onLoginPenyuluh: (
    username: string,
    password: string,
  ) => Promise<"ok" | "pending" | "invalid">;
  isActorReady: boolean;
}

export function LoginPage({
  onNavigate,
  onLoginAdmin,
  onLoginPenyuluh,
  isActorReady,
}: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Username dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      // Try admin first (no actor needed - checked in frontend)
      const isAdmin = await onLoginAdmin(username, password);
      if (isAdmin) return; // navigation handled inside

      // Penyuluh login needs actor
      if (!isActorReady) {
        toast.error("Koneksi ke server belum siap, coba beberapa saat lagi");
        return;
      }

      // Try penyuluh
      const result = await onLoginPenyuluh(username, password);
      if (result === "invalid") {
        toast.error("Username atau password salah");
      } else if (result === "pending") {
        onNavigate("pending");
      }
      // "ok" → navigation handled inside onLoginPenyuluh
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="shadow-md border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Masuk / Login</CardTitle>
              <CardDescription className="text-xs">
                Sistem Laporan RKH Penyuluh KB
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-ocid="login.input"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-ocid="login.password_input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            {!isActorReady && (
              <div
                data-ocid="login.loading_state"
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Menghubungkan ke server... (login Admin tetap bisa dilakukan)
              </div>
            )}

            <Button
              data-ocid="login.submit_button"
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Masuk
                </>
              )}
            </Button>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium text-center">
                Akses Demo (untuk mencoba aplikasi):
              </p>
              <Button
                data-ocid="login.demo_penyuluh_button"
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={() => onNavigate("app-penyuluh")}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Demo: Masuk sebagai Penyuluh KB
              </Button>
              <Button
                data-ocid="login.demo_admin_button"
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={() => onNavigate("app-admin")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Demo: Masuk sebagai Admin
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                data-ocid="login.register_link"
                className="text-sm text-primary hover:underline"
                onClick={() => onNavigate("register")}
              >
                Belum memiliki akun? Daftar di sini
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Sistem ini digunakan untuk mencatat dan mengelola Laporan Rencana
              Kerja Harian (RKH) Penyuluh KB sesuai dengan Peraturan Menteri
              Nomor 10.
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
