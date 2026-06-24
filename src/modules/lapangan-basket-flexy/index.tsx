import VenueDetailTemplate, { type VenueConfig } from "@/components/organisms/VenueDetailTemplate"

const CONFIG: VenueConfig = {
	name: "Lapangan Basket Flexy ITS",
	sport: "Basket",
	description:
		"Lapangan Basket Flexy ITS adalah salah satu fasilitas olahraga outdoor unggulan yang dikelola oleh UPT Fasor ITS. Dinamakan \"Flexy\" karena permukaan lantainya dilapisi dengan material cat khusus berteknologi Flexi Pave yang berlekung. Sistem pelapisan ini dirancang untuk area terbuka guna memberikan daya cengkeram sol sepatu yang optimal (anti-slip), meredam benturan ringan, serta tahan terhadap paparan cuaca panas dan hujan di Surabaya.",
	rules: [
		"Pemain wajib menggunakan sepatu olahraga bersol karet datar (non-marking) yang bersih. Dilarang keras memakai sepatu dengan sol keras berbahan logam atau paku yang dapat mengelupas lapisan cat flexi.",
		"Karena posisinya yang outdoor, pengguna dilarang membawa makanan berat, puntung rokok, dan meninggalkan sampah botol plastik di dalam perimeter garis lapangan.",
		"Keadaan cuaca (force majeure) seperti hujan lebat menjadi risiko pengguna area outdoor. Jadwal penggunaan kembali atau pengajuan keluhan teknis wajib dikoordinasikan langsung bersama pihak pengelola.",
	],
	images: {
		main: "/images/lapangan basket flexy.png",
		img2: "/images/lapangan basket flexy 2.png",
		img3: "/images/lapangan basket flexy 3.png",
	},
	startingPrice: "Rp115.000",
	priceUnit: "Per Sesi",
	courts: ["Lapangan Basket Flexy ITS"],
	slots: [
		{ time: "06:00 - 08:00", price: 115000, statuses: ["booked"] },
		{ time: "08:00 - 10:00", price: 115000, statuses: ["kosong"] },
		{ time: "10:00 - 12:00", price: 115000, statuses: ["kosong"] },
		{ time: "12:00 - 14:00", price: 115000, statuses: ["kosong"] },
		{ time: "14:00 - 16:00", price: 120000, statuses: ["kosong"] },
		{ time: "16:00 - 18:00", price: 120000, statuses: ["kosong"] },
		{ time: "18:00 - 20:00", price: 140000, statuses: ["kosong"] },
		{ time: "20:00 - 22:00", price: 140000, statuses: ["booked"] },
	],
}

export default function LapanganBasketFlexyPage() {
	return <VenueDetailTemplate config={CONFIG} />
}
