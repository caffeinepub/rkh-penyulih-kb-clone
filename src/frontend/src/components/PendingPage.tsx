import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { AppState } from "../types";
import { AuthLayout } from "./AuthPanel";

interface PendingPageProps {
  onNavigate: (state: AppState) => void;
}

export function PendingPage({ onNavigate }: PendingPageProps) {
  return (
    <AuthLayout>
      <Card className="shadow-md border-border">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-warning/15">
            <Clock
              className="w-8 h-8"
              style={{ color: "oklch(var(--warning))" }}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              Menunggu Persetujuan Admin
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Pendaftaran Anda telah diterima. Akun Anda sedang menunggu
              persetujuan dari Administrator. Silakan hubungi Admin atau periksa
              kembali nanti.
            </p>
          </div>
          <Button
            data-ocid="pending.primary_button"
            variant="outline"
            onClick={() => onNavigate("login")}
          >
            Periksa Kembali
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
