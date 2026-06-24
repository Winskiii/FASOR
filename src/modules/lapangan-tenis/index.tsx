import VenueDetailTemplate, { type VenueConfig } from "@/components/organisms/VenueDetailTemplate"

const CONFIG: VenueConfig = {
	name: "Lapangan Tenis ITS",
	sport: "Tenis",
	description:
		"Lapangan Tenis ITS (Fasor Tennis Court) adalah bagian dari kompleks Fasilitas Olahraga (Fasor) Institut Teknologi Sepuluh Nopember Surabaya. Arena olahraga ini dirancang dengan konsep outdoor (luar ruangan) yang representatif untuk mendukung kegiatan latihan rutin, penyaluran hobi, hingga ajang turnamen kompetitif baik bagi civitas akademika maupun masyarakat umum.",
	rules: [
		"Seluruh pemain diwajibkan menggunakan sepatu khusus tenis. Dilarang keras memakai sepatu bersol hitam pekat atau tipe sepatu lain yang berpotensi merusak struktur atau mengotori permukaan cat lapangan.",
		"Pemain diwajibkan telah mengenakan pakaian olahraga yang sopan dari rumah dan membawa perlengkapan pribadi (seperti raket dan bola tenis) secara mandiri.",
	],
	images: {
		main: "/images/lapangan tennis its.png",
		img2: "/images/lapangan tennis its 2.png",
		img3: "/images/lapangan tennis its 3.png",
	},
	startingPrice: "Rp75.000",
	priceUnit: "Per Sesi",
	courts: ["Lapangan Tenis 1", "Lapangan Tenis 2"],
	slots: [
		{ time: "06:00 - 09:00", price: 75000,  statuses: ["booked",  "kosong"] },
		{ time: "09:00 - 12:00", price: 75000,  statuses: ["kosong",  "kosong"] },
		{ time: "12:00 - 15:00", price: 75000,  statuses: ["kosong",  "kosong"] },
		{ time: "15:00 - 18:00", price: 80000,  statuses: ["kosong",  "kosong"] },
		{ time: "18:00 - 20:00", price: 80000,  statuses: ["kosong",  "kosong"] },
		{ time: "20:00 - 22:00", price: 80000,  statuses: ["booked",  "kosong"] },
	],
}

export default function LapanganTenisPage() {
	return <VenueDetailTemplate config={CONFIG} />
}
