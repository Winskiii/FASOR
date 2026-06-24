import VenueDetailTemplate, { type VenueConfig } from "@/components/organisms/VenueDetailTemplate"

const CONFIG: VenueConfig = {
name: "GOR Bulutangkis ITS",
sport: "Bulutangkis",
description:
"GOR Bulutangkis ITS adalah fasilitas olahraga bulu tangkis indoor milik Institut Teknologi Sepuluh Nopember Surabaya yang dikelola oleh UPT Fasor. GOR ini dilengkapi dengan 5 lapangan berstandar nasional yang siap menunjang kegiatan latihan rutin, pertandingan persahabatan, hingga turnamen resmi civitas akademika ITS dan masyarakat umum Surabaya. Lantai kayu yang terawat serta sistem penerangan yang memadai menjadikan GOR ini salah satu fasilitas bulutangkis terbaik di lingkungan kampus.",
rules: [
"Pemain wajib menggunakan sepatu khusus bulutangkis indoor bersol karet non-marking yang bersih. Dilarang menggunakan sepatu outdoor atau bersol hitam yang dapat merusak dan mengotori permukaan lantai.",
"Dilarang membawa makanan dan minuman ke dalam area lapangan permainan. Konsumsi hanya diperbolehkan di area luar atau tribun yang telah disediakan.",
"Pengguna yang memesan lebih dari satu lapangan wajib memastikan seluruh lapangan benar-benar terpakai. Pemesanan yang tidak digunakan tanpa pembatalan sebelumnya akan dikenai sanksi sesuai ketentuan pengelola.",
],

images: {
main: "/images/gor badminton its.png",
img2: "/images/badminton 1.png",
img3: "/images/badminton 2.png",
},
	startingPrice: "Rp60.000",
	priceUnit: "Per Jam",
	courts: [
		"Bulutangkis Line 1",
		"Bulutangkis Line 2",
		"Bulutangkis Line 3",
		"Bulutangkis Line 4",
		"Bulutangkis Line 5",
	],
	slots: [
		{ time: "06:00 - 07:00", price: 75000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "07:00 - 08:00", price: 75000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "08:00 - 09:00", price: 75000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "09:00 - 10:00", price: 75000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "10:00 - 11:00", price: 75000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "11:00 - 12:00", price: 75000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "12:00 - 13:00", price: 75000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "13:00 - 14:00", price: 60000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "14:00 - 15:00", price: 60000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "15:00 - 16:00", price: 60000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "16:00 - 17:00", price: 85000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "17:00 - 18:00", price: 85000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "18:00 - 19:00", price: 85000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "19:00 - 20:00", price: 85000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "20:00 - 21:00", price: 85000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "21:00 - 22:00", price: 85000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "22:00 - 23:00", price: 85000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "23:00 - 00:00", price: 85000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
	],
	rutinSlots: [
		{ time: "08:00 - 11:00", price: 750000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "11:00 - 14:00", price: 750000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "14:00 - 17:00", price: 600000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "17:00 - 20:00", price: 850000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
		{ time: "20:00 - 23:00", price: 850000, statuses: ["kosong", "kosong", "kosong", "kosong", "kosong"] },
	],
}

export default function GorBulutangkisPage() {
return <VenueDetailTemplate config={CONFIG} />
}
