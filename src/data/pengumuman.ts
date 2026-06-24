import { useState, useEffect } from "react"

export type AnnouncementCategory = "Peraturan" | "Pemeliharaan" | "Info Harga" | "Promo"

export interface Announcement {
	id: number
	title: string
	category: AnnouncementCategory
	date: string
	preview: string
	image?: string
	content: AnnouncementContent[]
}

export type AnnouncementContent =
	| { type: "paragraph"; text: string }
	| { type: "heading"; text: string }
	| { type: "list"; items: string[] }
	| { type: "info"; lines: string[] }

export const CATEGORY_COLORS: Record<AnnouncementCategory, { bg: string; color: string; border: string }> = {
	Peraturan: { bg: "orange.50", color: "orange.600", border: "orange.200" },
	Pemeliharaan: { bg: "yellow.50", color: "yellow.700", border: "yellow.200" },
	"Info Harga": { bg: "blue.50", color: "blue.600", border: "blue.200" },
	Promo: { bg: "green.50", color: "green.600", border: "green.200" },
}

export const ANNOUNCEMENTS: Announcement[] = [
	{
		id: 1,
		title: "Protokol Penggunaan Fasilitas Olahraga",
		category: "Peraturan",
		date: "1 Mei 2026",
		preview:
			"PROTOKOL: Pemain sudah memakai kaos kaki dan sepatu olahraga untuk bermain. Setelah penggunaan, area harus dibersihkan dan diperiksa dari sampah.",
		content: [
			{
				type: "paragraph",
				text: "PROTOKOL PENGGUNAAN FASILITAS OLAHRAGA ITS",
			},
			{
				type: "paragraph",
				text: "Dalam rangka menjaga kualitas dan kenyamanan fasilitas olahraga kampus, kami menetapkan protokol berikut:",
			},
			{
				type: "heading",
				text: "Sebelum Bermain:",
			},
			{
				type: "list",
				items: [
					"Pemain sudah memakai kaos dan sepatu olahraga serta siap bermain",
					"Tunjukkan bukti booking kepada petugas lapangan",
					"Bawa perlengkapan pribadi (handuk, air minum, dll)",
				],
			},
			{
				type: "heading",
				text: "Selama Bermain:",
			},
			{
				type: "list",
				items: [
					"Gunakan sepatu yang sesuai dengan jenis lapangan",
					"Jaga kebersihan area bermain",
					"Patuhi waktu yang telah dibooking",
					"Dilarang merokok dan makan di area lapangan",
				],
			},
			{
				type: "heading",
				text: "Setelah Bermain:",
			},
			{
				type: "list",
				items: [
					"Area harus dibersihkan dan diperiksa dari sampah",
					"Kembalikan peralatan ke tempatnya (jika meminjam)",
					"Laporkan jika ada kerusakan fasilitas",
				],
			},
			{
				type: "paragraph",
				text: "Terima kasih atas kerjasamanya dalam menjaga fasilitas olahraga ITS!",
			},
		],
	},
	{
		id: 2,
		title: "Pemeliharaan GOR Bulutangkis pada Tanggal 27-28 April 2026",
		category: "Pemeliharaan",
		date: "12 April 2026",
		preview:
			"GOR Bulutangkis akan ditutup sementara untuk pemeliharaan rutin mulai tanggal 27 hingga 28 April 2026. Mohon maaf atas ketidaknyamanannya.",
		image: "/images/gor badminton its.png",
		content: [
			{
				type: "paragraph",
				text: "Kepada seluruh pengguna fasilitas GOR Bulutangkis Fasor ITS,",
			},
			{
				type: "paragraph",
				text: "Kami menginformasikan bahwa GOR Bulutangkis akan ditutup sementara untuk keperluan pemeliharaan rutin pada tanggal 27-28 April 2026. Selama periode pemeliharaan ini, seluruh lapangan bulutangkis tidak dapat digunakan.",
			},
			{
				type: "heading",
				text: "Detail Pemeliharaan:",
			},
			{
				type: "list",
				items: [
					"Tanggal: 27-28 April 2026 (Senin-Selasa)",
					"Lingkup pekerjaan: Pengecatan lantai lapangan, penggantian net, dan perawatan pencahayaan",
					"Seluruh pemesanan pada tanggal tersebut akan diproses pembatalannya",
					"Refund penuh akan diberikan untuk booking yang terdampak",
				],
			},
			{
				type: "paragraph",
				text: "Kami mohon maaf atas ketidaknyamanan yang ditimbulkan. Pemeliharaan ini dilakukan demi menjaga kualitas fasilitas agar tetap prima untuk seluruh pengguna. GOR Bulutangkis akan kembali beroperasi normal mulai tanggal 29 April 2026.",
			},
			{
				type: "paragraph",
				text: "Jika ada pertanyaan, silakan menghubungi kami melalui WhatsApp Halo Fasor di 0811-3918-7999 (Senin-Jumat, 08.00-16.00 WIB).",
			},
		],
	},
	{
		id: 3,
		title: "Update Harga Sewa Lapangan Indoor per Mei 2026",
		category: "Info Harga",
		date: "5 April 2026",
		preview:
			"Mulai 1 Juni 2026, harga sewa lapangan indoor akan disesuaikan. Lapangan futsal Indoor: Rp 250.000/jam, Lapangan basket: Rp 200.000/jam.",
		image: "/images/gor futsal its.png",
		content: [
			{
				type: "paragraph",
				text: "Kepada seluruh pengguna setia Fasor ITS,",
			},
			{
				type: "paragraph",
				text: "Dalam rangka peningkatan kualitas layanan dan pemeliharaan fasilitas, kami mengumumkan penyesuaian harga sewa lapangan indoor yang akan berlaku mulai 1 Juni 2026.",
			},
			{
				type: "heading",
				text: "Daftar Harga Baru (berlaku 1 Juni 2026):",
			},
			{
				type: "list",
				items: [
					"Lapangan Futsal Indoor (PLN): Rp 250.000/jam",
					"Lapangan Basket Semi-Indoor: Rp 200.000/jam",
					"Lapangan Bulutangkis (GOR): Rp 50.000/jam/lapangan",
					"Lapangan Tenis Indoor: Rp 60.000/jam",
				],
			},
			{
				type: "heading",
				text: "Catatan Penting:",
			},
			{
				type: "list",
				items: [
					"Harga di atas belum termasuk biaya peralatan (jika menyewa)",
					"Pemesanan yang sudah dikonfirmasi sebelum 1 Juni 2026 menggunakan harga lama",
					"Harga outdoor tidak mengalami perubahan",
				],
			},
			{
				type: "paragraph",
				text: "Kami memahami bahwa penyesuaian harga ini mungkin memerlukan adaptasi dari pengguna. Peningkatan harga ini semata-mata ditujukan untuk menjaga dan meningkatkan standar fasilitas Fasor ITS agar tetap berkualitas tinggi.",
			},
			{
				type: "paragraph",
				text: "Terima kasih atas pengertian dan dukungan Anda. Informasi lebih lanjut dapat diperoleh melalui WhatsApp Halo Fasor 0811-3918-7999.",
			},
		],
	},
	{
		id: 4,
		title: "Promo Spesial Hari Kemerdekaan - Diskon 17%",
		category: "Promo",
		date: "1 April 2026",
		preview:
			"Rayakan Hari Kemerdekaan RI dengan bermain olahraga! Dapatkan diskon 17% untuk semua jenis lapangan pada tanggal 17 Agustus 2026.",
		content: [
			{
				type: "paragraph",
				text: "Dalam rangka memperingati Hari Kemerdekaan Republik Indonesia yang ke-81, Fasor ITS dengan bangga mempersembahkan PROMO SPESIAL DISKON 17% untuk seluruh jenis lapangan!",
			},
			{
				type: "heading",
				text: "Detail Promo:",
			},
			{
				type: "list",
				items: [
					"Diskon: 17% untuk semua jenis lapangan",
					"Berlaku pada: 17 Agustus 2026",
					"Berlaku untuk: Semua sesi pagi, siang, dan malam",
					"Tidak perlu kode promo — diskon otomatis diterapkan saat booking",
				],
			},
			{
				type: "heading",
				text: "Syarat dan Ketentuan:",
			},
			{
				type: "list",
				items: [
					"Promo hanya berlaku untuk tanggal bermain 17 Agustus 2026",
					"Booking dapat dilakukan mulai hari ini melalui sistem Fasor ITS",
					"Slot terbatas, segera lakukan pemesanan sebelum penuh",
					"Tidak dapat digabungkan dengan promo lainnya",
				],
			},
			{
				type: "paragraph",
				text: "Ayo ajak keluarga, teman, dan rekan untuk merayakan kemerdekaan dengan berolahraga bersama di Fasor ITS! Merdeka!",
			},
		],
	},
	{
		id: 5,
		title: "Peraturan Baru: Batas Waktu Pembatalan Booking",
		category: "Peraturan",
		date: "30 Maret 2026",
		preview:
			"Mulai 1 Juni 2026, pembatalan booking hanya dapat dilakukan minimal 24 jam sebelum waktu bermain untuk mendapatkan refund penuh.",
		content: [
			{
				type: "paragraph",
				text: "Kepada seluruh pengguna Fasor ITS,",
			},
			{
				type: "paragraph",
				text: "Mulai 1 Juni 2026, kami memberlakukan kebijakan baru terkait pembatalan dan reschedule booking untuk menjaga ketersediaan lapangan yang lebih adil bagi semua pengguna.",
			},
			{
				type: "heading",
				text: "Ketentuan Pembatalan:",
			},
			{
				type: "list",
				items: [
					"Pembatalan minimal H-1 (24 jam sebelum waktu bermain): Refund penuh 100%",
					"Pembatalan kurang dari 24 jam sebelum waktu bermain: Tidak mendapatkan refund",
					"Pembatalan akibat force majeure (bencana, dll): Dapat mengajukan refund penuh dengan bukti",
				],
			},
			{
				type: "heading",
				text: "Ketentuan Reschedule:",
			},
			{
				type: "list",
				items: [
					"Reschedule jadwal maksimal H-7 sebelum penggunaan",
					"Reschedule Force Majeure, khusus untuk lapangan outdoor: jika saat jam penggunaan terjadi hujan, pengguna bisa merubah jadwal ke sesi dan tanggal lainnya disertai bukti foto",
				],
			},
			{
				type: "heading",
				text: "Jam Operasional Admin:",
			},
			{
				type: "list",
				items: [
					"Senin - Jum'at: 08.00 - 16.00 WIB",
					"Sabtu, Minggu, dan hari libur nasional: Tutup",
					"Untuk penggunaan fasilitas di hari Sabtu dan Minggu, reservasi terakhir melalui admin di hari Jum'at hingga pukul 16.00 WIB",
				],
			},
			{
				type: "paragraph",
				text: "Info lebih lanjut bisa menghubungi Halo Fasor 0811-3918-7999 untuk proses verifikasi (chat WA only) pada hari dan jam kerja (Senin - Jumat / 08.00 - 16.00). Pengguna WAJIB membawa STNK saat memasuki wilayah ITS jika membawa kendaraan bermotor.",
			},
		],
	},
	{
		id: 6,
		title: "Lapangan Padel Kini Tersedia di Fasor ITS",
		category: "Info Harga",
		date: "22 Maret 2026",
		preview:
			"Kami dengan senang hati mengumumkan pembukaan 4 lapangan padel baru! Harga sewa Rp 100.000/jam. Booking sekarang!",
		image: "/images/padel.png",
		content: [
			{
				type: "paragraph",
				text: "Fasor ITS terus berkomitmen menghadirkan fasilitas olahraga yang modern dan nyaman bagi civitas akademika maupun masyarakat umum. Kami dengan bangga mengumumkan bahwa kini telah tersedia 4 lapangan padel baru yang dapat digunakan untuk kegiatan olahraga, latihan, maupun bermain bersama teman dan komunitas.",
			},
			{
				type: "paragraph",
				text: "Padel merupakan olahraga yang saat ini semakin populer karena menggabungkan unsur tenis dan squash dengan permainan yang seru, dinamis, dan mudah dilakukan oleh berbagai kalangan, baik pemula maupun pemain berpengalaman. Kehadiran fasilitas padel ini diharapkan dapat menjadi pilihan aktivitas olahraga baru yang menyenangkan sekaligus mendukung gaya hidup sehat di lingkungan ITS.",
			},
			{
				type: "paragraph",
				text: "Keempat lapangan padel Fasor ITS dirancang dengan standar fasilitas yang nyaman untuk menunjang pengalaman bermain yang optimal. Area lapangan dilengkapi dengan pencahayaan yang memadai sehingga tetap nyaman digunakan pada sore maupun malam hari. Selain itu, lokasi lapangan yang berada di kawasan Fasor ITS juga mudah dijangkau dan memiliki area pendukung yang nyaman bagi pemain maupun penonton.",
			},
			{
				type: "paragraph",
				text: "Untuk menikmati fasilitas ini, pengguna dapat melakukan reservasi dengan harga sewa mulai dari Rp100.000 per jam. Proses booking dapat dilakukan secara online melalui sistem pemesanan Fasor ITS sehingga pengguna dapat melihat jadwal ketersediaan lapangan dengan lebih mudah dan praktis.",
			},
			{
				type: "paragraph",
				text: "Kami mengundang seluruh mahasiswa, dosen, staf, alumni, serta masyarakat umum untuk mencoba pengalaman bermain padel di Fasor ITS. Ajak teman dan komunitasmu untuk merasakan keseruan olahraga yang sedang tren ini!",
			},
			{
				type: "info",
				lines: [
					"Harga sewa: Rp100.000/jam",
					"Jumlah lapangan: 4 lapangan padel",
					"Lokasi: Fasor ITS",
					"Reservasi: Melalui sistem booking Fasor ITS",
				],
			},
			{
				type: "paragraph",
				text: "Yuk booking sekarang dan rasakan pengalaman bermain padel bersama Fasor ITS!",
			},
		],
	},
	{
		id: 7,
		title: "Perawatan Lapangan Mini Soccer pada Tanggal 22-23 Maret",
		category: "Pemeliharaan",
		date: "8 Maret 2026",
		preview:
			"Lapangan mini soccer akan ditutup untuk perawatan rumput sintetis pada tanggal 22-23 Maret 2026. Terima kasih atas pengertiannya.",
		image: "/images/lapangan mini soccer.png",
		content: [
			{
				type: "paragraph",
				text: "Kepada seluruh pengguna Lapangan Mini Soccer Fasor ITS,",
			},
			{
				type: "paragraph",
				text: "Kami menginformasikan bahwa Lapangan Mini Soccer akan ditutup sementara untuk perawatan rumput sintetis pada tanggal 22-23 Maret 2026.",
			},
			{
				type: "heading",
				text: "Detail Perawatan:",
			},
			{
				type: "list",
				items: [
					"Tanggal: 22-23 Maret 2026 (Minggu-Senin)",
					"Kegiatan: Perawatan dan pembersihan rumput sintetis, pengisian pasir silika, dan perbaikan garis lapangan",
					"Seluruh booking pada tanggal tersebut akan dibatalkan dan mendapat refund penuh",
				],
			},
			{
				type: "paragraph",
				text: "Perawatan berkala ini penting dilakukan untuk menjaga kualitas dan keamanan permukaan lapangan agar tetap optimal untuk digunakan. Kami memohon maaf atas ketidaknyamanan yang ditimbulkan.",
			},
			{
				type: "paragraph",
				text: "Lapangan Mini Soccer akan kembali beroperasi normal mulai tanggal 24 Maret 2026. Terima kasih atas pengertian dan kerjasamanya.",
			},
		],
	},
]

export function getAnnouncementById(id: number): Announcement | undefined {
	if (typeof window !== "undefined") {
		const saved = localStorage.getItem("fasor_announcements")
		if (saved) {
			try {
				const parsed = JSON.parse(saved)
				return parsed.find((a: Announcement) => a.id === id)
			} catch {}
		}
	}
	return ANNOUNCEMENTS.find((a) => a.id === id)
}

export function useAnnouncements() {
	const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS)

	useEffect(() => {
		const saved = localStorage.getItem("fasor_announcements")
		if (saved) {
			try {
				setAnnouncements(JSON.parse(saved) as Announcement[])
			} catch {}
		}
	}, [])

	return announcements
}

export function useAnnouncementById(id: number | undefined): Announcement | undefined {
	const announcements = useAnnouncements()
	if (!id) return undefined
	return announcements.find((a) => a.id === id)
}
