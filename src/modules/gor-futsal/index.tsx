import VenueDetailTemplate, { type VenueConfig } from "@/components/organisms/VenueDetailTemplate"

const CONFIG: VenueConfig = {
	name: "GOR Futsal Pertamina ITS",
	sport: "Futsal",
	description:
		"GOR Futsal Pertamina ITS (Gedung Olahraga Futsal Indoor ITS) adalah fasilitas olahraga indoor utama yang terletak di area kompleks Fasilitas Olahraga (Fasor) Institut Teknologi Sepuluh Nopember, Sukolilo, Surabaya. Gedung ini dibangun atas kerja sama hibah CSR antara PT Pertamina (Persero) dan ITS, menjadikannya salah satu arena futsal tertutup terbesar dan paling representatif di lingkungan kampus Surabaya.",
	rules: [
		"Pemain wajib menggunakan sepatu futsal dengan sol karet datar (flat) berwarna terang atau tipe non-marking.",
		"Dilarang keras menggunakan sepatu bola yang memiliki pul (sepatu bola lapangan rumput) karena dapat merusak lapangan tenis GOR.",
		"Dilarang menggantungkan benda berat pada jaring gawang, merusak papan skor, atau mengotori area tribun penonton.",
	],
	images: {
		main: "/images/gor futsal its.png",
		img2: "/images/gor futsal its 2.png",
		img3: "/images/gor futsal its 3.png",
	},
	startingPrice: "Rp200.000",
	priceUnit: "Per Jam",
	courts: ["GOR Futsal Pertamina ITS"],
	slots: [
		{ time: "06:00 - 07:00", price: 200000, statuses: ["booked"] },
		{ time: "07:00 - 08:00", price: 200000, statuses: ["kosong"] },
		{ time: "08:00 - 09:00", price: 200000, statuses: ["kosong"] },
		{ time: "09:00 - 10:00", price: 200000, statuses: ["kosong"] },
		{ time: "10:00 - 11:00", price: 200000, statuses: ["kosong"] },
		{ time: "11:00 - 12:00", price: 200000, statuses: ["kosong"] },
		{ time: "12:00 - 13:00", price: 200000, statuses: ["kosong"] },
		{ time: "13:00 - 14:00", price: 200000, statuses: ["kosong"] },
		{ time: "14:00 - 15:00", price: 225000, statuses: ["kosong"] },
		{ time: "15:00 - 16:00", price: 225000, statuses: ["kosong"] },
		{ time: "16:00 - 17:00", price: 225000, statuses: ["kosong"] },
		{ time: "17:00 - 18:00", price: 225000, statuses: ["kosong"] },
		{ time: "18:00 - 19:00", price: 250000, statuses: ["kosong"] },
		{ time: "19:00 - 20:00", price: 250000, statuses: ["kosong"] },
		{ time: "20:00 - 21:00", price: 250000, statuses: ["booked"] },
		{ time: "21:00 - 22:00", price: 250000, statuses: ["kosong"] },
	],
}

export default function GorFutsalPage() {
	return <VenueDetailTemplate config={CONFIG} />
}
