export type AppState =
  | "login"
  | "register"
  | "pending"
  | "app-penyuluh"
  | "app-admin";

export type UserStatus = "Aktif" | "Menunggu";
export type ReportStatus = "Draf" | "Terkirim";

export interface User {
  id: string;
  nama: string;
  wilayah: string;
  nip: string;
  username: string;
  password: string;
  status: UserStatus;
  tanggalDaftar: string;
  tandatangan?: string; // base64 image
}

export interface Report {
  id: string;
  nomorLaporan: string;
  tanggal: string;
  namaKegiatan: string;
  sasaran: string;
  metode: string;
  lokasi: string;
  indikator: string;
  waktu: string;
  detail: string;
  status: ReportStatus;
  penyuluh: string;
  tandatangan?: string; // base64 image from user profile
}
