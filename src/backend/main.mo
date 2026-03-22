import Array "mo:base/Array";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

actor {
  // ========== OLD TYPES (kept for stable variable compatibility) ==========

  type OldUser = {
    id : Nat;
    nama : Text;
    wilayah : Text;
    nip : Text;
    username : Text;
    password : Text;
    tandatangan : Text;
    status : Text;
    tanggalDaftar : Text;
  };

  type OldReport = {
    id : Nat;
    nomorLaporan : Text;
    tanggal : Text;
    namaKegiatan : Text;
    sasaran : Text;
    metode : Text;
    lokasi : Text;
    indikator : Text;
    waktu : Text;
    detail : Text;
    status : Text;
    penyuluh : Text;
    tandatangan : Text;
  };

  // ========== NEW TYPES ==========

  type User = {
    id : Nat;
    nip : ?Text;
    status : Text;
    username : Text;
    password : Text;
    nama : Text;
    createdAt : Int;
    tandatangan : ?Text;
    updatedAt : Int;
    wilayah : Text;
  };

  type RKH_Laporan = {
    id : Nat;
    status : Text;
    metode : Text;
    indikator : Text;
    tanggal : Text;
    createdAt : Int;
    lokasi : Text;
    penyuluh : Text;
    detail : Text;
    tandatangan : ?Text;
    updatedAt : Int;
    waktu : Text;
    nomorLaporan : Nat;
    sasaran : Text;
    namaKegiatan : Text;
  };

  // ========== STABLE VARIABLES (old kept for compatibility) ==========

  // Old stable vars -- kept to avoid M0169/M0170 errors on upgrade
  stable var users : [OldUser] = [];
  stable var reports : [OldReport] = [];
  stable var nextReportId : Nat = 1;

  // New stable vars
  stable var usersV2 : [User] = [];
  stable var laporans : [RKH_Laporan] = [];
  stable var nextUserId : Nat = 1;
  stable var nextLaporanId : Nat = 1;
  stable var nextNomorLaporan : Nat = 1;
  stable var migrated : Bool = false;

  // ========== MIGRATION ==========

  system func postupgrade() {
    if (not migrated and users.size() > 0) {
      let now = Time.now();
      let migratedUsers : [User] = Array.map<OldUser, User>(users, func(u) {
        {
          id = u.id;
          nip = if (u.nip == "") null else ?u.nip;
          status = u.status;
          username = u.username;
          password = u.password;
          nama = u.nama;
          createdAt = now;
          tandatangan = if (u.tandatangan == "") null else ?u.tandatangan;
          updatedAt = now;
          wilayah = u.wilayah;
        }
      });
      usersV2 := migratedUsers;
      // Set next id to avoid collisions
      if (users.size() > 0) {
        nextUserId := users.size() + 1;
      };
      users := [];
      reports := [];
    };
    migrated := true;
  };

  // ========== AUTH ==========

  public query func adminLogin(arg0 : { username : Text; password : Text }) : async Bool {
    arg0.username == "admin" and arg0.password == "Admin@2024"
  };

  public query func loginUser(arg0 : { username : Text; password : Text }) : async ?User {
    Array.find<User>(usersV2, func(u) {
      u.username == arg0.username and u.password == arg0.password and u.status == "Aktif"
    })
  };

  public query func isUsernameTaken(arg0 : { username : Text }) : async Bool {
    switch (Array.find<User>(usersV2, func(u) { u.username == arg0.username })) {
      case null { false };
      case (?_) { true };
    }
  };

  // ========== USER MANAGEMENT ==========

  public query func getAllUsers(arg0 : {}) : async [User] {
    ignore arg0;
    usersV2
  };

  public func registerUser(arg0 : {
    nip : ?Text;
    username : Text;
    password : Text;
    nama : Text;
    tandatangan : ?Text;
    wilayah : Text;
  }) : async { userId : Nat } {
    let id = nextUserId;
    nextUserId += 1;
    let now = Time.now();
    let newUser : User = {
      id;
      nip = arg0.nip;
      username = arg0.username;
      password = arg0.password;
      nama = arg0.nama;
      tandatangan = arg0.tandatangan;
      wilayah = arg0.wilayah;
      status = "Menunggu";
      createdAt = now;
      updatedAt = now;
    };
    usersV2 := Array.append(usersV2, [newUser]);
    { userId = id }
  };

  public func approveUser(arg0 : { userId : Nat }) : async Bool {
    var found = false;
    let now = Time.now();
    usersV2 := Array.map<User, User>(usersV2, func(u) {
      if (u.id == arg0.userId) {
        found := true;
        {
          id = u.id;
          nip = u.nip;
          username = u.username;
          password = u.password;
          nama = u.nama;
          tandatangan = u.tandatangan;
          wilayah = u.wilayah;
          status = "Aktif";
          createdAt = u.createdAt;
          updatedAt = now;
        }
      } else { u }
    });
    found
  };

  // ========== LAPORAN ==========

  public query func getAllLaporan(arg0 : {}) : async [RKH_Laporan] {
    ignore arg0;
    laporans
  };

  public query func getLaporanByPenyuluh(arg0 : { penyuluh : Text }) : async [RKH_Laporan] {
    Array.filter<RKH_Laporan>(laporans, func(r) { r.penyuluh == arg0.penyuluh })
  };

  public func createLaporan(arg0 : {
    metode : Text;
    indikator : Text;
    tanggal : Text;
    lokasi : Text;
    penyuluh : Text;
    detail : Text;
    waktu : Text;
    sasaran : Text;
    namaKegiatan : Text;
  }) : async { id : Nat } {
    let id = nextLaporanId;
    nextLaporanId += 1;
    let nomorLaporan = nextNomorLaporan;
    nextNomorLaporan += 1;
    let now = Time.now();
    let newLaporan : RKH_Laporan = {
      id;
      nomorLaporan;
      tanggal = arg0.tanggal;
      namaKegiatan = arg0.namaKegiatan;
      sasaran = arg0.sasaran;
      metode = arg0.metode;
      lokasi = arg0.lokasi;
      indikator = arg0.indikator;
      waktu = arg0.waktu;
      detail = arg0.detail;
      penyuluh = arg0.penyuluh;
      status = "Terkirim";
      tandatangan = null;
      createdAt = now;
      updatedAt = now;
    };
    laporans := Array.append(laporans, [newLaporan]);
    { id }
  };
};
