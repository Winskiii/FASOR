import VenueDetailTemplate, { type VenueConfig } from "@/components/organisms/VenueDetailTemplate"

const CONFIG: VenueConfig = {
	name: "Lapangan Futsal PLN ITS",
	sport: "Futsal",
	description:
		"Lapangan Futsal PLN ITS adalah fasilitas olahraga outdoor yang dibangun atas kerja sama hibah dan sinergi pendidikan antara Institut Teknologi Sepuluh Nopember dengan PT PLN (Persero). Menjadi penanda sejarah penting, lapangan ini merupakan arena futsal terbuka pertama sekaligus paling populer di Jawa Timur yang dibuka resmi untuk turnamen futsal pada pertandingan tahun 2005.",
	rules: [
		"Pemain wajib menggunakan sepatu olahraga bersol karet datar (non-marking) yang bersih. Dilarang keras memakai sepatu bola dengan sol tajam (pul tajam) karena akan merusak permukaan lapangan.",
		"Karena lokasinya yang terbuka, pengguna dilarang membuang sampah sembarangan (seperti botol plastik atau bungkus makanan) dan dilarang merokok di area perimeter garis lapangan.",
		"Lapangan hanya boleh digunakan untuk kegiatan futsal. Segala bentuk kegiatan non-olahraga atau komersial lainnya wajib mengantong izin tertulis khusus dari pihak pengelola kampus.",
	],
	images: {
		main: "/images/lapangan futsal pln.png",
		img2: "/images/lapangan futsal pln 2.png",
		img3: "/images/lapangan futsal pln 3.png",
	},
	startingPrice: "Rp65.000",
	priceUnit: "Per Jam",
	courts: ["Lapangan Futsal PLN ITS"],
	slots: [
		{ time: "06:00 - 07:00", price: 65000, statuses: ["booked"] },
		{ time: "07:00 - 08:00", price: 65000, statuses: ["kosong"] },
		{ time: "08:00 - 09:00", price: 65000, statuses: ["kosong"] },
		{ time: "09:00 - 10:00", price: 65000, statuses: ["kosong"] },
		{ time: "10:00 - 11:00", price: 65000, statuses: ["kosong"] },
		{ time: "11:00 - 12:00", price: 65000, statuses: ["kosong"] },
		{ time: "12:00 - 13:00", price: 65000, statuses: ["kosong"] },
		{ time: "13:00 - 14:00", price: 65000, statuses: ["kosong"] },
		{ time: "14:00 - 15:00", price: 65000, statuses: ["kosong"] },
		{ time: "15:00 - 16:00", price: 65000, statuses: ["kosong"] },
		{ time: "16:00 - 17:00", price: 65000, statuses: ["kosong"] },
		{ time: "17:00 - 18:00", price: 65000, statuses: ["kosong"] },
		{ time: "18:00 - 19:00", price: 65000, statuses: ["kosong"] },
		{ time: "19:00 - 20:00", price: 65000, statuses: ["kosong"] },
		{ time: "20:00 - 21:00", price: 65000, statuses: ["booked"] },
		{ time: "21:00 - 22:00", price: 65000, statuses: ["kosong"] },
	],
}

export default function LapanganFutsalPlnPage() {
	return <VenueDetailTemplate config={CONFIG} />
}
