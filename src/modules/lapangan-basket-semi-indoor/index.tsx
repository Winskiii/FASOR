import VenueDetailTemplate, { type VenueConfig } from "@/components/organisms/VenueDetailTemplate"

const CONFIG: VenueConfig = {
	name: "Lapangan Basket Semi Indoor ITS",
	sport: "Basket",
	description:
		"Lapangan Basket Semi Indoor ITS adalah salah satu fasilitas olahraga utama yang dikelola oleh Institut Teknologi Sepuluh Nopember di Surabaya. Lapangan ini dirancang dengan konsep semi-terbuka (beratap namun memiliki sirkulasi udara luar yang bebas) guna memberikan kenyamanan maksimal bagi pemain agar terhidar dari terik matahari langsung maupun hujan, sekaligus menjaga sirkulasi udara tetap optimal.",
	rules: [
		"Lapangan basket hanya boleh digunakan untuk olahraga bola basket, tidak diperkenankan untuk jenis olahraga atau kegiatan lain tanpa izin pengelola.",
		"Pengguna wajib mengenakan pakaian olahraga yang sopan dan sepatu olahraga yang sesuai (sepatu basket/sport sol karet) guna menjaga kualitas permukaan lapangan.",
		"Pengguna kendaraan bermotor dari luar wajib membawa STNK untuk ditunjukkan saat memasuki wilayah gerbang kampus ITS.",
	],
	images: {
		main: "/images/lapangan basket semi indoor.png",
		img2: "/images/lapangan basket semi indoor 2.png",
		img3: "/images/lapangan basket semi indoor 3.png",
	},
	startingPrice: "Rp150.000",
	priceUnit: "Per Sesi",
	courts: ["Lapangan Basket Semi Indoor ITS"],
	slots: [
		{ time: "06:00 - 08:00", price: 150000, statuses: ["booked"] },
		{ time: "08:00 - 10:00", price: 150000, statuses: ["kosong"] },
		{ time: "10:00 - 12:00", price: 150000, statuses: ["kosong"] },
		{ time: "12:00 - 14:00", price: 150000, statuses: ["kosong"] },
		{ time: "14:00 - 16:00", price: 175000, statuses: ["kosong"] },
		{ time: "16:00 - 18:00", price: 175000, statuses: ["kosong"] },
		{ time: "18:00 - 20:00", price: 185000, statuses: ["kosong"] },
		{ time: "20:00 - 22:00", price: 185000, statuses: ["booked"] },
	],
}

export default function LapanganBasketSemiIndoorPage() {
	return <VenueDetailTemplate config={CONFIG} />
}
