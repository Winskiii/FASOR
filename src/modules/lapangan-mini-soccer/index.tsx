import VenueDetailTemplate, { type VenueConfig } from "@/components/organisms/VenueDetailTemplate"

const CONFIG: VenueConfig = {
	name: "Lapangan Mini Soccer ITS",
	sport: "Sepak Bola",
	description:
		"Lapangan Mini Soccer ITS adalah salah satu fasilitas olahraga outdoor yang dirancang khusus menggunakan permukaan rumput yang lembut dan berkualitas tinggi untuk mengakomodasi kebutuhan para pencinta sepak bola skala kecil, baik dari kalangan mahasiswa, dosen, alumni, maupun masyarakat umum di Surabaya.",
	rules: [
		"Pemain wajib menggunakan sepatu olahraga sepak bola/mini soccer yang sesuai guna meminimalkan kerusakan pada permukaan rumput lapangan.",
		"Pengguna dilarang keras membuang sampah botol plastik, puntung rokok, atau sisa makanan di sekitar perimeter rumput lembut lapangan mini soccer.",
		"Pengguna wajib menjaga kondisi gawang dan tiang. Melompat dan bergantung pada gawang dilarang keras demi keamanan bersama.",
	],
	images: {
		main: "/images/lapangan mini soccer.png",
		img2: "/images/lapangan mini soccer 2.png",
		img3: "/images/lapangan mini soccer.png",
	},
	startingPrice: "Rp100.000",
	priceUnit: "Per Sesi",
	courts: ["Lapangan Mini Soccer ITS"],
	slots: [
		{ time: "07:00 - 09:00", price: 100000, statuses: ["booked"] },
		{ time: "09:00 - 11:00", price: 100000, statuses: ["kosong"] },
		{ time: "11:00 - 13:00", price: 120000, statuses: ["kosong"] },
		{ time: "13:00 - 15:00", price: 120000, statuses: ["kosong"] },
		{ time: "15:00 - 17:00", price: 135000, statuses: ["kosong"] },
	],
}

export default function LapanganMiniSoccerPage() {
	return <VenueDetailTemplate config={CONFIG} />
}
