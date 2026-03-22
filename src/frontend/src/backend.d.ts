export interface User {
  id: bigint;
  nip: [] | [string];
  status: string;
  username: string;
  password: string;
  nama: string;
  createdAt: bigint;
  tandatangan: [] | [string];
  updatedAt: bigint;
  wilayah: string;
}

export interface RKH_Laporan {
  id: bigint;
  status: string;
  metode: string;
  indikator: string;
  tanggal: string;
  createdAt: bigint;
  lokasi: string;
  penyuluh: string;
  detail: string;
  tandatangan: [] | [string];
  updatedAt: bigint;
  waktu: string;
  nomorLaporan: bigint;
  sasaran: string;
  namaKegiatan: string;
}

export interface backendInterface {
  adminLogin(arg: { username: string; password: string }): Promise<boolean>;
  loginUser(arg: { username: string; password: string }): Promise<[] | [User]>;
  isUsernameTaken(arg: { username: string }): Promise<boolean>;
  getAllUsers(arg: {}): Promise<Array<User>>;
  registerUser(arg: {
    nip: [] | [string];
    username: string;
    password: string;
    nama: string;
    tandatangan: [] | [string];
    wilayah: string;
  }): Promise<{ userId: bigint }>;
  approveUser(arg: { userId: bigint }): Promise<boolean>;
  getAllLaporan(arg: {}): Promise<Array<RKH_Laporan>>;
  getLaporanByPenyuluh(arg: { penyuluh: string }): Promise<Array<RKH_Laporan>>;
  createLaporan(arg: {
    metode: string;
    indikator: string;
    tanggal: string;
    lokasi: string;
    penyuluh: string;
    detail: string;
    waktu: string;
    sasaran: string;
    namaKegiatan: string;
  }): Promise<{ id: bigint }>;
}
