import VenueDetailTemplate, { type VenueConfig } from "@/components/organisms/VenueDetailTemplate"

const CONFIG: VenueConfig = {
	name: "Lapangan Voli ITS",
	sport: "Voli",
	description:
		"Lapangan Voli ITS (Fasor Volleyball Court) adalah fasilitas olahraga outdoor yang dikelola oleh UPT Fasor ITS. Sarana ini dirancang khusus untuk memfasilitasi kebutuhan latihan rutin, pertandingan persahabatan, hingga turnamen bola voli kompetitif bagi civitas akademika maupun komunitas olahraga eksternal di Surabaya. Lapangan didesain tanpa atap pelindung (open-air court) untuk memberikan sensasi bermain voli luar ruangan yang dinamis dengan sirkulasi udara alami yang bebas.",
	rules: [
		"Dilarang keras menarik, menggantung, atau merusak jaring net dan tiang penopang bola voli.",
		"Lapangan hanya boleh digunakan untuk olahraga bola voli; dilarang keras menggunakannya untuk aktivitas lain tanpa izin tertulis dari pihak pengelola.",
		"Pengguna dilarang membuang sampah sembarangan, memaku, atau membawa benda tajam yang dapat membahayakan pemain lain di dalam perimeter lapangan.",
	],
	images: {
		main: "/images/lapangan voli its.png",
		img2: "/images/lapangan voli its 2.png",
		img3: "/images/lapangan voli its 3.png",
	},
	startingPrice: "Rp100.000",
	priceUnit: "Per Sesi",
	courts: ["Lapangan Voli ITS"],
	slots: [
		{ time: "07:00 - 09:00", price: 100000, statuses: ["booked"] },
		{ time: "09:00 - 11:00", price: 100000, statuses: ["kosong"] },
		{ time: "11:00 - 13:00", price: 100000, statuses: ["kosong"] },
		{ time: "13:00 - 15:00", price: 100000, statuses: ["kosong"] },
		{ time: "15:00 - 17:00", price: 100000, statuses: ["kosong"] },
	],
}

export default function LapanganVoliPage() {
	return <VenueDetailTemplate config={CONFIG} />
}
