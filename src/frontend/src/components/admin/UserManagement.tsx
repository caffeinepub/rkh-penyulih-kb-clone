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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Pencil, Trash2, UserX, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { User } from "../../types";

interface UserManagementProps {
  users: User[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (user: User) => void;
}

export function UserManagement({
  users,
  onApprove,
  onReject,
  onDelete,
  onUpdate,
}: UserManagementProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ nama: "", wilayah: "", nip: "" });

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ nama: user.nama, wilayah: user.wilayah, nip: user.nip });
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    if (!editForm.nama || !editForm.wilayah) {
      toast.error("Nama dan Wilayah Kerja wajib diisi");
      return;
    }
    onUpdate({ ...editUser, ...editForm });
    toast.success("Data pengguna berhasil diperbarui");
    setEditUser(null);
  };

  const pending = users.filter((u) => u.status === "Menunggu");
  const active = users.filter((u) => u.status === "Aktif");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Manajemen Pengguna</h3>
        <p className="text-sm text-muted-foreground">
          Daftar seluruh pengguna Penyuluh KB
        </p>
      </div>

      {pending.length > 0 && (
        <div className="rounded-lg border border-warning/40 bg-warning/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-warning/20">
            <h4
              className="text-sm font-semibold"
              style={{ color: "oklch(var(--warning))" }}
            >
              Menunggu Persetujuan ({pending.length})
            </h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead>Nama</TableHead>
                  <TableHead>Wilayah Kerja</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((user, idx) => (
                  <TableRow
                    key={user.id}
                    data-ocid={`users.pending.${idx + 1}`}
                  >
                    <TableCell className="font-medium text-sm">
                      {user.nama}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.wilayah}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.nip || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.tanggalDaftar}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-success border-success/40 hover:bg-success/10"
                          onClick={() => {
                            onApprove(user.id);
                            toast.success(`${user.nama} disetujui`);
                          }}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
                          onClick={() => {
                            onReject(user.id);
                            toast.success(`${user.nama} ditolak`);
                          }}
                        >
                          <XCircle className="w-3 h-3 mr-1" /> Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <h4 className="text-sm font-semibold">
            Pengguna Aktif ({active.length})
          </h4>
        </div>
        {active.length === 0 ? (
          <div
            data-ocid="users.empty_state"
            className="flex flex-col items-center justify-center py-16"
          >
            <UserX className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Belum ada pengguna aktif</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="users.table">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Nama</TableHead>
                  <TableHead>Wilayah Kerja</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((user, idx) => (
                  <TableRow key={user.id} data-ocid={`users.item.${idx + 1}`}>
                    <TableCell className="font-medium text-sm">
                      {user.nama}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.wilayah}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.nip || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-success/15 text-success border-0">
                        Aktif
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.tanggalDaftar}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          data-ocid={`users.edit_button.${idx + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-ocid={`users.delete_button.${idx + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(user.id)}
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

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Data Pengguna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                value={editForm.nama}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, nama: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Wilayah Kerja <span className="text-destructive">*</span>
              </Label>
              <Input
                value={editForm.wilayah}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, wilayah: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>NIP</Label>
              <Input
                value={editForm.nip}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, nip: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="users.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="users.cancel_button">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="users.confirm_button"
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  toast.success("Pengguna berhasil dihapus");
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
