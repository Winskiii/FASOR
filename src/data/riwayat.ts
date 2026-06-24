// DATA RIWAYAT PEMESANAN STATIS — Pengganti API /reservasi

export type StatusReservasi = "menunggu" | "dikonfirmasi" | "selesai" | "dibatalkan"

export interface Reservasi {
  id: string
  kodeBooking: string
  namaLapangan: string
  tanggal: string
  waktu: string
  durasi: string
  status: StatusReservasi
  totalHarga: string
  imageLapangan: string
}

export const STATUS_COLORS: Record<
  StatusReservasi,
  { bg: string; color: string; label: string }
> = {
  menunggu:     { bg: "#FEF3C7", color: "#92400E", label: "Menunggu Konfirmasi" },
  dikonfirmasi: { bg: "#DBEAFE", color: "#1D4ED8", label: "Dikonfirmasi" },
  selesai:      { bg: "#D1FAE5", color: "#065F46", label: "Selesai" },
  dibatalkan:   { bg: "#FEE2E2", color: "#991B1B", label: "Dibatalkan" },
}

export const RIWAYAT_DATA: Reservasi[] = [
  {
    id: "1",
    kodeBooking: "FASOR-2026-001",
    namaLapangan: "GOR Futsal Indoor",
    tanggal: "20 Juni 2026",
    waktu: "10:00 - 11:00",
    durasi: "1 jam",
    status: "selesai",
    totalHarga: "Rp 80.000",
    imageLapangan: "/images/gor futsal its.png",
  },
  {
    id: "2",
    kodeBooking: "FASOR-2026-002",
    namaLapangan: "Lapangan Tenis",
    tanggal: "25 Juni 2026",
    waktu: "14:00 - 16:00",
    durasi: "2 jam",
    status: "dikonfirmasi",
    totalHarga: "Rp 60.000",
    imageLapangan: "/images/lapangan tennis its.png",
  },
  {
    id: "3",
    kodeBooking: "FASOR-2026-003",
    namaLapangan: "GOR Badminton",
    tanggal: "27 Juni 2026",
    waktu: "08:00 - 09:00",
    durasi: "1 jam",
    status: "menunggu",
    totalHarga: "Rp 25.000",
    imageLapangan: "/images/gor badminton its.png",
  },
  {
    id: "4",
    kodeBooking: "FASOR-2026-004",
    namaLapangan: "Lapangan Basket Outdoor",
    tanggal: "15 Juni 2026",
    waktu: "16:00 - 18:00",
    durasi: "2 jam",
    status: "dibatalkan",
    totalHarga: "Rp 0",
    imageLapangan: "/images/lapangan basket flexy.png",
  },
]
