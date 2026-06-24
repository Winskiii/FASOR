export const TARIF_MOCK = [
	// 1. GOR Futsal Indoor -> GOR Futsal Pertamina ITS
	{ id: 101, fasilitas: "GOR Futsal Pertamina ITS", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 160000, shif: "pagi", waktu: "06.00–14.00", durasi: "1 Jam", aktif: true },
	{ id: 102, fasilitas: "GOR Futsal Pertamina ITS", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 200000, shif: "pagi", waktu: "06.00–14.00", durasi: "1 Jam", aktif: true },
	{ id: 103, fasilitas: "GOR Futsal Pertamina ITS", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 180000, shif: "sore", waktu: "14.00–18.00", durasi: "1 Jam", aktif: true },
	{ id: 104, fasilitas: "GOR Futsal Pertamina ITS", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 225000, shif: "sore", waktu: "14.00–18.00", durasi: "1 Jam", aktif: true },
	{ id: 105, fasilitas: "GOR Futsal Pertamina ITS", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 200000, shif: "malam", waktu: "18.00–22.00", durasi: "1 Jam", aktif: true },
	{ id: 106, fasilitas: "GOR Futsal Pertamina ITS", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 250000, shif: "malam", waktu: "18.00–22.00", durasi: "1 Jam", aktif: true },

	// 2. GOR Futsal Outdoor -> Lapangan Futsal PLN
	{ id: 201, fasilitas: "Lapangan Futsal PLN", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 75000, shif: "pagi", waktu: "06.00–11.00", durasi: "1 Jam", aktif: true },
	{ id: 202, fasilitas: "Lapangan Futsal PLN", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 85000, shif: "pagi", waktu: "06.00–11.00", durasi: "1 Jam", aktif: true },
	{ id: 203, fasilitas: "Lapangan Futsal PLN", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 55000, shif: "sore", waktu: "11.00–15.00", durasi: "1 Jam", aktif: true },
	{ id: 204, fasilitas: "Lapangan Futsal PLN", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 65000, shif: "sore", waktu: "11.00–15.00", durasi: "1 Jam", aktif: true },
	{ id: 205, fasilitas: "Lapangan Futsal PLN", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 85000, shif: "malam", waktu: "15.00–22.00", durasi: "1 Jam", aktif: true },
	{ id: 206, fasilitas: "Lapangan Futsal PLN", olahraga: "Futsal", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 95000, shif: "malam", waktu: "15.00–22.00", durasi: "1 Jam", aktif: true },

	// 3. Lapangan Basket Semi Indoor -> Lapangan Basket Semi Indoor
	{ id: 301, fasilitas: "Lapangan Basket Semi Indoor", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 125000, shif: "pagi", waktu: "06.00–14.00", durasi: "2 Jam", aktif: true },
	{ id: 302, fasilitas: "Lapangan Basket Semi Indoor", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 150000, shif: "pagi", waktu: "06.00–14.00", durasi: "2 Jam", aktif: true },
	{ id: 303, fasilitas: "Lapangan Basket Semi Indoor", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 140000, shif: "sore", waktu: "14.00–18.00", durasi: "2 Jam", aktif: true },
	{ id: 304, fasilitas: "Lapangan Basket Semi Indoor", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 175000, shif: "sore", waktu: "14.00–18.00", durasi: "2 Jam", aktif: true },
	{ id: 305, fasilitas: "Lapangan Basket Semi Indoor", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 155000, shif: "malam", waktu: "18.00–22.00", durasi: "2 Jam", aktif: true },
	{ id: 306, fasilitas: "Lapangan Basket Semi Indoor", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 185000, shif: "malam", waktu: "18.00–22.00", durasi: "2 Jam", aktif: true },

	// 4. Lapangan Basket Outdoor -> Lapangan Basket Flexy
	{ id: 401, fasilitas: "Lapangan Basket Flexy", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 100000, shif: "pagi", waktu: "06.00–14.00", durasi: "2 Jam", aktif: true },
	{ id: 402, fasilitas: "Lapangan Basket Flexy", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 115000, shif: "pagi", waktu: "06.00–14.00", durasi: "2 Jam", aktif: true },
	{ id: 403, fasilitas: "Lapangan Basket Flexy", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 115000, shif: "sore", waktu: "14.00–18.00", durasi: "2 Jam", aktif: true },
	{ id: 404, fasilitas: "Lapangan Basket Flexy", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 130000, shif: "sore", waktu: "14.00–18.00", durasi: "2 Jam", aktif: true },
	{ id: 405, fasilitas: "Lapangan Basket Flexy", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 125000, shif: "malam", waktu: "18.00–22.00", durasi: "2 Jam", aktif: true },
	{ id: 406, fasilitas: "Lapangan Basket Flexy", olahraga: "Basket", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 140000, shif: "malam", waktu: "18.00–22.00", durasi: "2 Jam", aktif: true },

	// 5. GOR Badminton -> GOR Bulutangkis ITS (Latihan / Insidentil)
	{ id: 501, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 50000, shif: "pagi", waktu: "06.00–13.00", durasi: "1 Jam", aktif: true },
	{ id: 502, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 75000, shif: "pagi", waktu: "06.00–13.00", durasi: "1 Jam", aktif: true },
	{ id: 503, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 45000, shif: "sore", waktu: "13.00–16.00", durasi: "1 Jam", aktif: true },
	{ id: 504, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 60000, shif: "sore", waktu: "13.00–16.00", durasi: "1 Jam", aktif: true },
	{ id: 505, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 60000, shif: "malam", waktu: "16.00–23.00", durasi: "1 Jam", aktif: true },
	{ id: 506, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 85000, shif: "malam", waktu: "16.00–23.00", durasi: "1 Jam", aktif: true },

	// 5. GOR Badminton -> GOR Bulutangkis ITS (Rutin per Bulan)
	{ id: 507, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Rutin (per Bulan)", jenis_pengguna: "Internal", harga: 500000, shif: "pagi", waktu: "08.00–14.00", durasi: "3 Jam", aktif: true },
	{ id: 508, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Rutin (per Bulan)", jenis_pengguna: "Umum", harga: 750000, shif: "pagi", waktu: "08.00–14.00", durasi: "3 Jam", aktif: true },
	{ id: 509, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Rutin (per Bulan)", jenis_pengguna: "Internal", harga: 450000, shif: "sore", waktu: "14.00–17.00", durasi: "3 Jam", aktif: true },
	{ id: 510, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Rutin (per Bulan)", jenis_pengguna: "Umum", harga: 600000, shif: "sore", waktu: "14.00–17.00", durasi: "3 Jam", aktif: true },
	{ id: 511, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Rutin (per Bulan)", jenis_pengguna: "Internal", harga: 600000, shif: "malam", waktu: "17.00–23.00", durasi: "3 Jam", aktif: true },
	{ id: 512, fasilitas: "GOR Bulutangkis ITS", olahraga: "Bulutangkis", kegiatan: "Rutin (per Bulan)", jenis_pengguna: "Umum", harga: 850000, shif: "malam", waktu: "17.00–23.00", durasi: "3 Jam", aktif: true },

	// 6. Lapangan Tenis -> Lapangan Tenis ITS (Insidentil)
	{ id: 601, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 75000, shif: "pagi", waktu: "06.00–15.00", durasi: "per-3 Jam", aktif: true },
	{ id: 602, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 120000, shif: "pagi", waktu: "06.00–15.00", durasi: "per-3 Jam", aktif: true },
	{ id: 603, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 80000, shif: "sore", waktu: "15.00–18.00", durasi: "per-3 Jam", aktif: true },
	{ id: 604, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 130000, shif: "sore", waktu: "15.00–18.00", durasi: "per-3 Jam", aktif: true },
	{ id: 605, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 80000, shif: "malam", waktu: "18.00–22.00", durasi: "per-2 Jam", aktif: true },
	{ id: 606, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 130000, shif: "malam", waktu: "18.00–22.00", durasi: "per-2 Jam", aktif: true },

	// 6. Lapangan Tenis -> Lapangan Tenis ITS (Rutin)
	{ id: 607, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Rutin", jenis_pengguna: "Internal", harga: 205000, shif: "pagi", waktu: "06.00–15.00", durasi: "per-3 Jam", aktif: true },
	{ id: 608, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Rutin", jenis_pengguna: "Umum", harga: 450000, shif: "pagi", waktu: "06.00–15.00", durasi: "per-3 Jam", aktif: true },
	{ id: 609, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Rutin", jenis_pengguna: "Internal", harga: 220000, shif: "sore", waktu: "15.00–18.00", durasi: "per-3 Jam", aktif: true },
	{ id: 610, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Rutin", jenis_pengguna: "Umum", harga: 500000, shif: "sore", waktu: "15.00–18.00", durasi: "per-3 Jam", aktif: true },
	{ id: 611, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Rutin", jenis_pengguna: "Internal", harga: 240000, shif: "malam", waktu: "18.00–22.00", durasi: "per-2 Jam", aktif: true },
	{ id: 612, fasilitas: "Lapangan Tenis ITS", olahraga: "Tenis", kegiatan: "Latihan / Rutin", jenis_pengguna: "Umum", harga: 500000, shif: "malam", waktu: "18.00–22.00", durasi: "per-2 Jam", aktif: true },

	// 7. Stadion Sepak Bola -> Stadion ITS
	{ id: 701, fasilitas: "Stadion ITS", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 750000, shif: "pagi", waktu: "06.00–18.00 (Senin–Jumat)", durasi: "per-2 Jam", aktif: true },
	{ id: 702, fasilitas: "Stadion ITS", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 800000, shif: "pagi", waktu: "06.00–18.00 (Senin–Jumat)", durasi: "per-2 Jam", aktif: true },
	{ id: 703, fasilitas: "Stadion ITS", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 850000, shif: "pagi", waktu: "06.00–18.00 (Sabtu & Minggu)", durasi: "per-2 Jam", aktif: true },
	{ id: 704, fasilitas: "Stadion ITS", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 900000, shif: "pagi", waktu: "06.00–18.00 (Sabtu & Minggu)", durasi: "per-2 Jam", aktif: true },
	{ id: 705, fasilitas: "Stadion ITS", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 1100000, shif: "malam", waktu: "19.00–23.00 (Sabtu & Minggu)", durasi: "per-2 Jam", aktif: true },
	{ id: 706, fasilitas: "Stadion ITS", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 1200000, shif: "malam", waktu: "19.00–23.00 (Sabtu & Minggu)", durasi: "per-2 Jam", aktif: true },
	{ id: 707, fasilitas: "Stadion ITS", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 1100000, shif: "malam", waktu: "06.00–23.00 (Senin–Jumat)", durasi: "per-2 Jam", aktif: true },
	{ id: 708, fasilitas: "Stadion ITS", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 1200000, shif: "malam", waktu: "06.00–23.00 (Senin–Jumat)", durasi: "per-2 Jam", aktif: true },

	// 8. Mini Soccer -> Lapangan Mini Soccer
	{ id: 801, fasilitas: "Lapangan Mini Soccer", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 150000, shif: "pagi", waktu: "07.00–17.00", durasi: "per-2 Jam", aktif: true },
	{ id: 802, fasilitas: "Lapangan Mini Soccer", olahraga: "Sepakbola", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 200000, shif: "pagi", waktu: "07.00–17.00", durasi: "per-2 Jam", aktif: true },

	// 9. Lapangan Voli Outdoor -> Lapangan Voli ITS
	{ id: 901, fasilitas: "Lapangan Voli ITS", olahraga: "Voli", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Internal", harga: 85000, shif: "pagi", waktu: "07.00–17.00", durasi: "per-2 Jam", aktif: true },
	{ id: 902, fasilitas: "Lapangan Voli ITS", olahraga: "Voli", kegiatan: "Latihan / Insidentil", jenis_pengguna: "Umum", harga: 100000, shif: "pagi", waktu: "07.00–17.00", durasi: "per-2 Jam", aktif: true },
]
