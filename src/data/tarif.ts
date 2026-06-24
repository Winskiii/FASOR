// DATA TARIF LAPANGAN STATIS — Pengganti API /tarif

export interface TarifItem {
  kategori: string
  harga: string
  keterangan: string
}

export interface TarifLapangan {
  namaLapangan: string
  tarif: TarifItem[]
}

export const TARIF_DATA: TarifLapangan[] = [
  {
    namaLapangan: "GOR Futsal Indoor",
    tarif: [
      { kategori: "Mahasiswa ITS",   harga: "Rp 80.000 / jam",  keterangan: "Berlaku hari Senin–Jumat (jam kerja)" },
      { kategori: "Umum",            harga: "Rp 150.000 / jam", keterangan: "Berlaku semua hari" },
      { kategori: "Malam (> 18.00)", harga: "Rp 100.000 / jam", keterangan: "Khusus mahasiswa ITS" },
    ],
  },
  {
    namaLapangan: "Lapangan Futsal Outdoor (PLN)",
    tarif: [
      { kategori: "Mahasiswa ITS", harga: "Rp 60.000 / jam",  keterangan: "Berlaku hari Senin–Jumat" },
      { kategori: "Umum",         harga: "Rp 120.000 / jam", keterangan: "Berlaku semua hari" },
    ],
  },
  {
    namaLapangan: "GOR Badminton",
    tarif: [
      { kategori: "Mahasiswa ITS", harga: "Rp 25.000 / jam", keterangan: "Per orang, berlaku hari kerja" },
      { kategori: "Umum",         harga: "Rp 50.000 / jam",  keterangan: "Per lapangan" },
    ],
  },
  {
    namaLapangan: "Lapangan Tenis",
    tarif: [
      { kategori: "Mahasiswa ITS", harga: "Rp 30.000 / jam", keterangan: "Per orang" },
      { kategori: "Umum",         harga: "Rp 60.000 / jam",  keterangan: "Per lapangan" },
    ],
  },
  {
    namaLapangan: "Lapangan Basket Semi Indoor",
    tarif: [
      { kategori: "Mahasiswa ITS", harga: "Rp 50.000 / jam",  keterangan: "Berlaku semua hari" },
      { kategori: "Umum",         harga: "Rp 100.000 / jam", keterangan: "Berlaku semua hari" },
    ],
  },
  {
    namaLapangan: "Lapangan Basket Outdoor",
    tarif: [
      { kategori: "Mahasiswa ITS", harga: "Rp 40.000 / jam", keterangan: "Berlaku semua hari" },
      { kategori: "Umum",         harga: "Rp 80.000 / jam",  keterangan: "Berlaku semua hari" },
    ],
  },
  {
    namaLapangan: "Stadion Sepak Bola",
    tarif: [
      { kategori: "Mahasiswa ITS", harga: "Rp 200.000 / jam", keterangan: "Minimal 2 jam" },
      { kategori: "Umum",         harga: "Rp 400.000 / jam", keterangan: "Minimal 2 jam" },
    ],
  },
  {
    namaLapangan: "Mini Soccer",
    tarif: [
      { kategori: "Mahasiswa ITS", harga: "Rp 120.000 / jam", keterangan: "Minimal 1 jam" },
      { kategori: "Umum",         harga: "Rp 250.000 / jam", keterangan: "Minimal 1 jam" },
    ],
  },
  {
    namaLapangan: "Lapangan Voli Outdoor",
    tarif: [
      { kategori: "Mahasiswa ITS", harga: "Rp 30.000 / jam", keterangan: "Per lapangan" },
      { kategori: "Umum",         harga: "Rp 60.000 / jam",  keterangan: "Per lapangan" },
    ],
  },
]
