import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { sanitizeText } from "@/utils/sanitize"
import {
	Box,
	Flex,
	Grid,
	VStack,
	HStack,
	Text,
	Button,
	Icon,
	IconButton,
	Divider,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
	useClipboard,
	Spinner,
	Center,
	useToast,
} from "@chakra-ui/react"
import Image from "next/image"
import { FaCheck, FaCopy, FaWhatsapp, FaPrint, FaExchangeAlt, FaFileAlt } from "react-icons/fa"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import FasorFooter from "@/components/organisms/FasorFooter"
import RescheduleRefundModal, { type RescheduleSubmitData } from "./RescheduleRefundModal"


const formatRupiah = (n: number) =>
	"Rp" + n.toLocaleString("id-ID").replace(/\./g, ".")

const pad = (n: number) => String(n).padStart(2, "0")

const formatVA = (s: string) => s.match(/.{1,4}/g)?.join(" ") ?? s

const mapFacilityToImage = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("bulutangkis") || n.includes("badminton")) return "/images/gor badminton its.png";
  if (n.includes("tennis") || n.includes("tenis")) return "/images/lapangan tennis its.png";
  if (n.includes("basket semi indoor")) return "/images/lapangan basket semi indoor.png";
  if (n.includes("basket")) return "/images/lapangan basket flexy.png";
  if (n.includes("futsal indoor") || n.includes("gor futsal")) return "/images/gor futsal its.png";
  if (n.includes("futsal")) return "/images/lapangan futsal pln.png";
  if (n.includes("stadion")) return "/images/stadion its.png";
  if (n.includes("mini soccer")) return "/images/lapangan mini soccer.png";
  if (n.includes("volly") || n.includes("voli")) return "/images/lapangan voli its.png";
  return "/images/stadion its.png";
};


const isIdInternal = (id: string): boolean => {
	if (!id) return false
	const cleanId = id.trim().replace(/\s/g, "")
	return cleanId.length === 10 || cleanId.length === 18
}

const terbilang = (nilai: number): string => {
	if (nilai === 0) return "Nol"
	const bilangan = [
		"", "Satu", "Dua", "Tiga", "Empat", "Lima",
		"Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
	]
	let temp = ""
	if (nilai < 12) {
		temp = " " + bilangan[Math.floor(nilai)]
	} else if (nilai < 20) {
		temp = terbilang(nilai - 10) + " Belas"
	} else if (nilai < 100) {
		temp = terbilang(Math.floor(nilai / 10)) + " Puluh" + (nilai % 10 > 0 ? terbilang(nilai % 10) : "")
	} else if (nilai < 200) {
		temp = " Seratus" + (nilai - 100 > 0 ? terbilang(nilai - 100) : "")
	} else if (nilai < 1000) {
		temp = terbilang(Math.floor(nilai / 100)) + " Ratus" + (nilai % 100 > 0 ? terbilang(nilai % 100) : "")
	} else if (nilai < 2000) {
		temp = " Seribu" + (nilai - 1000 > 0 ? terbilang(nilai - 1000) : "")
	} else if (nilai < 1000000) {
		temp = terbilang(Math.floor(nilai / 1000)) + " Ribu" + (nilai % 1000 > 0 ? terbilang(nilai % 1000) : "")
	} else if (nilai < 1000000000) {
		temp = terbilang(Math.floor(nilai / 1000000)) + " Juta" + (nilai % 1000000 > 0 ? terbilang(nilai % 1000000) : "")
	} else if (nilai < 1000000000000) {
		temp = terbilang(Math.floor(nilai / 1000000000)) + " Miliar" + (nilai % 1000000000 > 0 ? terbilang(nilai % 1000000000) : "")
	}
	return temp.trim()
}

const getSession = (waktuStr: string): string => {
	if (!waktuStr) return ""
	const start = waktuStr.split(" - ")[0]?.trim()
	if (!start) return ""
	
	const startShort = start.slice(0, 5)
	
	if (startShort === "06:00" || startShort === "06.00") return "Sesi 1"
	if (startShort === "08:00" || startShort === "08.00") return "Sesi 2"
	if (startShort === "09:00" || startShort === "09.00") return "Sesi 2"
	if (startShort === "10:00" || startShort === "10.00") return "Sesi 3"
	if (startShort === "12:00" || startShort === "12.00") return "Sesi 4"
	if (startShort === "14:00" || startShort === "14.00") return "Sesi 5"
	if (startShort === "15:00" || startShort === "15.00") return "Sesi 4"
	if (startShort === "16:00" || startShort === "16.00") return "Sesi 6"
	if (startShort === "18:00" || startShort === "18.00") return "Sesi 5"
	if (startShort === "20:00" || startShort === "20.00") return "Sesi 6"
	if (startShort === "21:00" || startShort === "21.00") return "Sesi 5" // matching the PDF
	if (startShort === "22:00" || startShort === "22.00") return "Sesi 9"
	
	const hour = parseInt(startShort.split(":")[0], 10)
	if (isNaN(hour)) return ""
	const calculatedSesi = Math.max(1, Math.floor((hour - 6) / 2) + 1)
	return `Sesi ${calculatedSesi}`
}

const formatDatePdf = (dateStr: string): string => {
	if (!dateStr) return ""
	try {
		const parts = dateStr.split("-")
		if (parts.length === 3) {
			const year = parseInt(parts[0], 10)
			const monthIdx = parseInt(parts[1], 10) - 1
			const day = parseInt(parts[2], 10)
			const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
			if (monthIdx >= 0 && monthIdx < 12) {
				return `${day} ${months[monthIdx]} ${year}`
			}
		}
		const d = new Date(dateStr)
		if (!isNaN(d.getTime())) {
			const day = d.getDate()
			const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
			return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`
		}
	} catch (e) {}
	return dateStr
}


const STEP_LABELS = ["Reservasi Dibuat", "Konfirmasi WhatsApp", "Pembayaran", "Selesai"]

const BANNER_CONFIG = [
	{
		bg: "#F59E0B",
		title: "Menunggu Konfirmasi Whatsapp",
		desc: "Konfirmasi kode booking Anda ke admin untuk melanjutkan proses pemesanan.",
	},
	{
		bg: "#008FFF",
		title: "Menunggu Pembayaran",
		desc: "Virtual Account telah tersedia. Segera lakukan pembayaran sebelum batas waktu.",
	},
	{
		bg: "#22C55E",
		title: "Pembayaran Berhasil",
		desc: "Pemesanan lapangan Anda telah dikonfirmasi. Sampai jumpa di lapangan!",
	},
]


const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<VStack align="start" spacing={0}>
		<Text fontSize="xs" color="gray.600">
			{label}
		</Text>
		<Text fontSize="sm" fontWeight="700" color="gray.800">
			{value}
		</Text>
	</VStack>
)

interface StepperProps {
	currentStep: number
}

const Stepper = ({ currentStep }: StepperProps) => {
	const isDone = (i: number) => currentStep >= 2 || i <= currentStep
	const isActive = (i: number) => currentStep < 2 && i === currentStep + 1

	const progressW =
		currentStep === 0
			? "calc((100% - 30px) / 3)"
			: currentStep === 1
			? "calc((100% - 30px) * 2 / 3)"
			: "calc(100% - 30px)"

	return (
		<Box w="full" mb={8} position="relative">
			<Box position="absolute" top="14px" left="15px" right="15px" h="2px" bg="gray.200" />
			<Box
				position="absolute"
				top="14px"
				left="15px"
				h="2px"
				bg="#008FFF"
				w={progressW}
				transition="width 0.4s ease"
			/>
			<Flex justify="space-between" position="relative">
				{STEP_LABELS.map((label, i) => (
					<VStack key={i} spacing={1} align="center">
						<Box
							w="30px"
							h="30px"
							borderRadius="full"
							bg={
								isDone(i)
									? "green.500"
									: isActive(i)
									? "#008FFF"
									: "gray.200"
							}
							display="flex"
							alignItems="center"
							justifyContent="center"
							flexShrink={0}
						>
							{isDone(i) ? (
								<Icon as={FaCheck} color="white" boxSize="11px" />
							) : (
								<Box
									w="10px"
									h="10px"
									borderRadius="full"
									bg={isActive(i) ? "white" : "gray.400"}
								/>
							)}
						</Box>
						<Text
							fontSize="xs"
							color={isDone(i) || isActive(i) ? "gray.700" : "gray.400"}
							textAlign="center"
							maxW="72px"
							lineHeight="1.2"
						>
							{label}
						</Text>
					</VStack>
				))}
			</Flex>
		</Box>
	)
}
const parseLocalDate = (dateStr: string) => {
	if (!dateStr) return new Date();
	const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
	const [y, m, d] = cleanDate.split("-").map(Number);
	return new Date(y, m - 1, d);
}

const DetailPemesananPage = () => {
	const router = useRouter()
	const { code } = router.query as Record<string, string>
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"
	const toast = useToast()


	const [loading, setLoading] = useState(true)
	const [currentUser, setCurrentUser] = useState<any>(null)
	const [bookingData, setBookingData] = useState({
		bookingCode: "",
		idFasilitas: "",
		facility: "",
		image: "",
		lapangan: "",
		tanggal: "",
		waktu: "",
		hargaPerUnit: "0",
		satuan: "Jam",
		durasi: "0",
		total: "0",
		nama: "",
		noTelp: "",
		status: "waiting_confirmation",
		created_at: null as string | null,
		expires_at: null as string | null,
		rutin_dates: [] as string[],
		tipeUser: "",
	})

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get(`${baseUrl}/auth/user`, {
					withCredentials: true,
					headers: { Accept: "application/json" },
				})
				if (res.data?.data) {
					setCurrentUser(res.data.data)
				}
			} catch (e) {
				console.error("Failed to fetch current user:", e)
			}
		}
		fetchUser()
	}, [baseUrl])

	useEffect(() => {
		if (!code) return
		
		const fetchBooking = async () => {
			try {
				const response = await axios.get(`${baseUrl}/fasilitas/reservasi/${code}`, {
					withCredentials: true,
					headers: {
						Accept: "application/json",
						"X-Requested-With": "XMLHttpRequest",
					},
				})
				
				if (response.data.status === "success") {
					const d = response.data.data
					setBookingData({
						bookingCode: d.booking_code || code || "FSR9A2X",
						idFasilitas: d.fasilitas.id_fasilitas,
						facility: d.fasilitas.nama,
						image: mapFacilityToImage(d.fasilitas.nama),
						lapangan: d.lapangan?.nama || d.lapangan || d.fasilitas.nama,
						tanggal: d.tgl_reservasi,
						waktu: `${d.jam_mulai} - ${d.jam_selesai}`,
						hargaPerUnit: String(d.harga_per_unit ?? d.total_harga),
						satuan: d.satuan ?? "Jam",
						durasi: String(d.durasi ?? "1"),
						total: String(d.total_harga),
						nama: "Daffa Diandra Rizky",
						noTelp: "085708049979",
						status: d.status,
						created_at: d.created_at ?? null,
						expires_at: d.expires_at ?? null,
						rutin_dates: d.rutin_dates || [],
						tipeUser: d.tipe_user ?? "",
					})
					if (d.reschedule_status === "pending") {
						setPendingSubmission({
							type: "reschedule",
							rescheduleData: {
								newDate: parseLocalDate(d.reschedule_tgl),
								newSlot: `${d.reschedule_jam_mulai.substring(0, 5)} - ${d.reschedule_jam_selesai.substring(0, 5)}`,
								alasan: d.reschedule_alasan,
								file: null,
								otherText: d.reschedule_alasan,
							},
							submittedAt: new Date(d.reschedule_requested_at)
						})
					}
				}
			} catch (error) {
				console.error("Failed to fetch booking:", error)
			} finally {
				setLoading(false)
			}
		}

		fetchBooking()
	}, [code, baseUrl])

	const { bookingCode, idFasilitas, facility, image, lapangan, tanggal, waktu, hargaPerUnit, satuan, durasi, total, nama, noTelp, status, rutin_dates, tipeUser } = bookingData

	const isRutin = rutin_dates && rutin_dates.length > 0;
	
	const rutinDatesDisplay = isRutin ? rutin_dates.map((d: string) => {
		const dt = parseLocalDate(d)
		const DAY_ID_SHORT = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
		const MONTH_ID_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
		return `${DAY_ID_SHORT[dt.getDay()]}, ${dt.getDate()} ${MONTH_ID_SHORT[dt.getMonth()]} ${dt.getFullYear()}`
	}) : []

	const displayTotal = total
	const displayHargaPerUnit = isRutin ? String(Math.round(Number(total) / rutin_dates.length)) : hargaPerUnit
	const displaySatuan = satuan
	const displayDurasi = durasi

	const statusToStep: Record<string, number> = {
		"waiting_confirmation": 0,
		"waiting_payment": 1,
		"paid": 2,
		"cancelled": 3,
	}
	const currentStep = router.query.step ? Number(router.query.step) : (statusToStep[status] ?? 0)
	const hargaNum = Number(displayHargaPerUnit) || 0
	const totalNum = Number(displayTotal) || 0
	const durasiNum = Number(displayDurasi) || 0

	const rawId = (currentUser?.preferred_username || currentUser?.nik || "");
	const resolvedNrp = rawId && rawId !== "-" ? rawId : "-";
	const isInternal = tipeUser === "internal" || isIdInternal(resolvedNrp) || currentUser?.user_type === "internal";
	const keteranganVal = isInternal ? "Dosen, Tenaga Kependidikan dan Mahasiswa" : "Masyarakat Umum";
	const bottomReceiverName = nama || currentUser?.name || "-";

	const handleCetakKwitansi = () => {
		const receiptRecord = {
			bookingCode,
			transactionNo: noTransaksi,
			facilityName: facility,
			lapangan: lapangan || facility,
			tanggal: tanggal,
			waktu: isRutin ? (waktu || "Sesuai Jadwal") : waktu,
			nama: nama,
			noTelp: noTelp,
			jenisSewa: tipeUser,
			kegiatan: isRutin ? "Latihan Rutin" : "Latihan Insidentil",
			keterangan: keteranganVal,
			sesi: getSession(waktu),
			total: totalNum,
			status: "paid",
			printedAt: new Date().toISOString(),
		}

		const existing = JSON.parse(localStorage.getItem("fasor_receipts") || "[]")
		existing.push(receiptRecord)
		localStorage.setItem("fasor_receipts", JSON.stringify(existing))

		window.print()
	}

	const vaNumber =
		(bookingCode || "").length === 6
			? `8888${bookingCode}${bookingCode}` // 16 digits
			: "8888000000000000"

	const today = new Date()
	const noTransaksi = `${pad(today.getDate())}${pad(today.getMonth() + 1)}${String(
		today.getFullYear()
	).slice(-2)}${pad(today.getHours())}${pad(today.getMinutes())}${bookingCode}`

	const [timeLeft, setTimeLeft] = useState(30 * 60)
	const expiresAt = bookingData?.expires_at ? new Date(bookingData.expires_at).getTime() : null

	useEffect(() => {
		if (currentStep !== 1 || !bookingCode) return
		const key = `fasor_deadline_${bookingCode}`
		let deadline = expiresAt ?? Number(localStorage.getItem(key))
		if (!deadline || deadline <= Date.now()) {
			deadline = Date.now() + 30 * 60 * 1000
			localStorage.setItem(key, String(deadline))
		}
		const update = () => {
			const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
			setTimeLeft(remaining)
		}
		update()
		const id = setInterval(update, 1000)
		return () => clearInterval(id)
	}, [currentStep, bookingCode, expiresAt])

	const hours = Math.floor(timeLeft / 3600)
	const minutes = Math.floor((timeLeft % 3600) / 60)
	const seconds = timeLeft % 60

	const [waTimeLeft, setWaTimeLeft] = useState(2 * 3600)
	
	useEffect(() => {
		if (currentStep !== 0 || !bookingCode) return
		const waKey = `fasor_wa_deadline_${bookingCode}`
		let deadline = expiresAt ?? Number(localStorage.getItem(waKey))
		if (!deadline || deadline <= Date.now()) {
			const start = bookingData.created_at ? new Date(bookingData.created_at) : new Date();
			
			let d = new Date(start.getTime());
			let remainingMinutes = 2 * 60;
			
			while (remainingMinutes > 0) {
				let hour = d.getHours();
				
				if (hour < 8) {
					d.setHours(8, 0, 0, 0);
					continue;
				}
				
				if (hour >= 22) {
					d.setDate(d.getDate() + 1);
					d.setHours(8, 0, 0, 0);
					continue;
				}
				
				let endOfDay = new Date(d);
				endOfDay.setHours(22, 0, 0, 0);
				
				let minutesLeftToday = Math.floor((endOfDay.getTime() - d.getTime()) / 60000);
				
				if (remainingMinutes <= minutesLeftToday) {
					d.setMinutes(d.getMinutes() + remainingMinutes);
					remainingMinutes = 0;
				} else {
					remainingMinutes -= minutesLeftToday;
					d.setDate(d.getDate() + 1);
					d.setHours(8, 0, 0, 0);
				}
			}
			
			deadline = d.getTime();
			localStorage.setItem(waKey, String(deadline));
		}
		
		const update = () => {
			const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
			setWaTimeLeft(remaining)
		}
		update()
		const id = setInterval(update, 1000)
		return () => clearInterval(id)
	}, [currentStep, bookingCode, bookingData.created_at, expiresAt])

	const waHours = Math.floor(waTimeLeft / 3600)
	const waMinutes = Math.floor((waTimeLeft % 3600) / 60)
	const waSeconds = waTimeLeft % 60

	const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)

	type PendingType = "reschedule"
	interface PendingSubmission {
		type: PendingType
		rescheduleData?: RescheduleSubmitData
		submittedAt: Date
	}
	const [pendingSubmission, setPendingSubmission] = useState<PendingSubmission | null>(null)

	const DAY_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
	const MONTH_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

	const formatDateLong = (d: Date) =>
		`${DAY_ID[d.getDay()]}, ${d.getDate()} ${MONTH_ID[d.getMonth()]} ${d.getFullYear()}`

	const formatDateTime = (d: Date) =>
		`${DAY_ID[d.getDay()]}, ${d.getDate()} ${MONTH_ID[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`

	const handleRescheduleSubmit = async (data: RescheduleSubmitData) => {
		try {
			const formData = new FormData()
			const yyyy = data.newDate.getFullYear()
			const mm = String(data.newDate.getMonth() + 1).padStart(2, "0")
			const dd = String(data.newDate.getDate()).padStart(2, "0")
			const dateStr = `${yyyy}-${mm}-${dd}`
			formData.append("newDate", dateStr)
			formData.append("newSlot", data.newSlot)
			formData.append("alasan", sanitizeText(data.alasan))
			if (data.file) {
				formData.append("file", data.file)
			}
			formData.append("otherText", sanitizeText(data.otherText))

			const response = await axios.post(`${baseUrl}/fasilitas/reservasi/${bookingCode}/reschedule`, formData, {
				withCredentials: true,
				headers: {
					"Content-Type": "multipart/form-data",
					Accept: "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
			})

			if (response.data.status === "success") {
				setPendingSubmission({ type: "reschedule", rescheduleData: data, submittedAt: new Date() })
				toast({
					title: "Pengajuan Terkirim",
					description: "Pengajuan reschedule Anda berhasil dikirim ke admin.",
					status: "success",
					duration: 3000,
					isClosable: true,
				})
			}
		} catch (error) {
			console.error("Failed to submit reschedule:", error)
			toast({
				title: "Pengajuan Gagal",
				description: "Terjadi kesalahan saat mengirim pengajuan reschedule.",
				status: "error",
				duration: 3000,
				isClosable: true,
			})
		}
		setIsRescheduleOpen(false)
	}

	const handleCancelReschedule = async () => {
		try {
			const response = await axios.post(`${baseUrl}/fasilitas/reservasi/${bookingCode}/reschedule/cancel`, {}, {
				withCredentials: true,
				headers: {
					Accept: "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
			})

			if (response.data.status === "success") {
				setPendingSubmission(null)
				toast({
					title: "Pengajuan Dibatalkan",
					description: "Pengajuan reschedule Anda berhasil dibatalkan.",
					status: "success",
					duration: 3000,
					isClosable: true,
				})
			}
		} catch (error) {
			console.error("Failed to cancel reschedule:", error)
			toast({
				title: "Pembatalan Gagal",
				description: "Terjadi kesalahan saat membatalkan pengajuan reschedule.",
				status: "error",
				duration: 3000,
				isClosable: true,
			})
		}
	}

	const { onCopy: onCopyCode, hasCopied: hasCopiedCode } = useClipboard(bookingCode)
	const { onCopy: onCopyVA, hasCopied: hasCopiedVA } = useClipboard(vaNumber)

	const goToStep = (s: number) => {
		router.push({ pathname: "/detail-pemesanan", query: { ...router.query, step: String(s) } })
	}

	const handleSimulatePayment = async () => {
		try {
			const response = await axios.post(`${baseUrl}/admin/fasilitas/reservasi/${bookingCode}/approve`, {}, {
				withCredentials: true,
				headers: {
					Accept: "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
			})
			if (response.data.status === "success") {
				const newQuery = { ...router.query, step: "2" };
				const searchParams = new URLSearchParams();
				Object.entries(newQuery).forEach(([key, val]) => {
					if (val) searchParams.set(key, String(val));
				});
				window.location.href = `${window.location.pathname}?${searchParams.toString()}`;
			} else {
				alert("Gagal mensimulasikan pembayaran.")
			}
		} catch (error) {
			console.error("Simulation failed:", error)
			alert("Gagal mensimulasikan pembayaran. Periksa console/koneksi API.")
		}
	}

	const handleSimulateConfirm = async () => {
		try {
			const response = await axios.post(`${baseUrl}/admin/fasilitas/reservasi/${bookingCode}/confirm`, {}, {
				withCredentials: true,
				headers: {
					Accept: "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
			})
			if (response.data.status === "success") {
				const newQuery = { ...router.query, step: "1" };
				const searchParams = new URLSearchParams();
				Object.entries(newQuery).forEach(([key, val]) => {
					if (val) searchParams.set(key, String(val));
				});
				window.location.href = `${window.location.pathname}?${searchParams.toString()}`;
			} else {
				alert("Gagal mensimulasikan konfirmasi.")
			}
		} catch (error) {
			console.error("Simulation failed:", error)
			alert("Gagal mensimulasikan konfirmasi. Periksa console/koneksi API.")
		}
	}

	const activeBanner = pendingSubmission
		? {
				bg: "gray.600",
				title: "Menunggu Verifikasi Admin",
				desc: `Pengajuan reschedule Anda sedang diproses oleh admin Fasor ITS.`,
		  }
		: (BANNER_CONFIG[currentStep] ?? BANNER_CONFIG[0])

	return (
		<Box bg="gray.50" display="flex" flexDirection="column">
			<FasorNavbar />

			<Box as="main" flex="1" minH="100vh" w="full" maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
				<HStack mb={1} spacing={3}>
					<Text as="h1" fontSize="2xl" fontWeight="800" color="gray.800">
						Detail Pemesanan
					</Text>
					{bookingCode && (
						<Box
							bg="#008FFF"
							color="white"
							fontSize="xs"
							fontWeight="700"
							px={2}
							py={0.5}
							borderRadius="md"
						>
							#{bookingCode}
						</Box>
					)}
				</HStack>
				<Text fontSize="sm" color="gray.600" mb={6}>
					Periksa kembali detail reservasi Anda sebelum melanjutkan
				</Text>

				{loading ? (
					<Center h="40vh">
						<VStack spacing={4}>
							<Spinner size="xl" color="#008FFF" thickness="4px" />
							<Text color="gray.600" fontWeight="500">Memuat detail pemesanan...</Text>
						</VStack>
					</Center>
				) : (
					<>


				<Box bg={activeBanner.bg} px={5} py={3} borderRadius="lg" mb={6}>
					<Text fontWeight="700" color="white" fontSize="sm">
						{activeBanner.title}
					</Text>
					<Text color="white" fontSize="xs" opacity={0.9} mt={0.5}>
						{activeBanner.desc}
					</Text>
				</Box>

				<Grid
					templateColumns={{ base: "1fr", md: "5fr 4fr" }}
					gap={6}
					alignItems="start"
				>
					<Box
						bg="white"
						border="1px solid"
						borderColor="gray.200"
						borderRadius="xl"
						p={6}
						boxShadow="sm"
					>
						{pendingSubmission ? (
							<VStack spacing={4} align="stretch">
								<Text fontWeight="700" fontSize="md" color="gray.800">
									Reschedule Diajukan
								</Text>

								{pendingSubmission.type === "reschedule" && pendingSubmission.rescheduleData && (() => {
									const d = pendingSubmission.rescheduleData
									return (
										<VStack spacing={3} align="stretch">
											<VStack align="start" spacing={0}>
												<Text fontSize="xs" color="gray.400">Jadwal Lama</Text>
												<Text fontSize="sm" fontWeight="700" color="gray.800">
													{tanggal} · {waktu}
												</Text>
											</VStack>
											<VStack align="start" spacing={0}>
												<Text fontSize="xs" color="gray.400">Jadwal Baru</Text>
												<Text fontSize="sm" fontWeight="700" color="gray.800">
													{formatDateLong(d.newDate)} · {d.newSlot}
												</Text>
											</VStack>
											<HStack justify="space-between">
												<Text fontSize="xs" color="gray.400">Alasan</Text>
												<Text fontSize="sm" fontWeight="600" color="gray.700">
													{d.alasan === "Lainnya" ? d.otherText : d.alasan}
												</Text>
											</HStack>
											<HStack justify="space-between">
												<Text fontSize="xs" color="gray.400">Diajukan pada</Text>
												<Text fontSize="xs" color="gray.600">
													{formatDateTime(pendingSubmission.submittedAt)}
												</Text>
											</HStack>
										</VStack>
									)
								})()}

								<Divider borderColor="gray.100" />

								<Button
									variant="outline"
									borderColor="gray.300"
									color="gray.600"
									borderRadius="lg"
									fontWeight="600"
									size="md"
									fontSize="sm"
									w="full"
									_hover={{ bg: "gray.50" }}
									onClick={handleCancelReschedule}
								>
									Batalkan Pengajuan
								</Button>
								<Text fontSize="xs" color="gray.400" textAlign="center">
									Pembatalan tidak dapat dilakukan setelah diverifikasi admin
								</Text>
							</VStack>
						) : (
						<>
						<Stepper currentStep={currentStep} />

						{currentStep === 0 && (
							<VStack spacing={4} align="stretch">
								<Box bg="gray.900" borderRadius="xl" p={6} textAlign="center">
									<Text fontSize="sm" color="gray.400" mb={4}>
										Batas Waktu Konfirmasi
									</Text>
									<HStack justify="center" spacing={5} align="center">
										<VStack spacing={0}>
											<Text fontSize="4xl" fontWeight="800" color="white" lineHeight={1}>{pad(waHours)}</Text>
											<Text fontSize="xs" color="gray.400" mt={1}>Jam</Text>
										</VStack>
										<Text fontSize="4xl" fontWeight="800" color="white" lineHeight={1} mb={4}>:</Text>
										<VStack spacing={0}>
											<Text fontSize="4xl" fontWeight="800" color="white" lineHeight={1}>{pad(waMinutes)}</Text>
											<Text fontSize="xs" color="gray.400" mt={1}>Menit</Text>
										</VStack>
										<Text fontSize="4xl" fontWeight="800" color="white" lineHeight={1} mb={4}>:</Text>
										<VStack spacing={0}>
											<Text fontSize="4xl" fontWeight="800" color="white" lineHeight={1}>{pad(waSeconds)}</Text>
											<Text fontSize="xs" color="gray.400" mt={1}>Detik</Text>
										</VStack>
									</HStack>
								</Box>

								<Text fontWeight="700" color="gray.800" fontSize="md">
									Konfirmasi ke Admin Fasor
								</Text>
								<Text fontSize="sm" color="gray.600">
									Kirim kode booking kamu ke WhatsApp untuk mendapatkan Virtual Account.
								</Text>

								<HStack
									border="1.5px solid"
									borderColor="gray.200"
									borderRadius="full"
									px={5}
									py={2}
									w="fit-content"
									spacing={3}
								>
									<Text
										fontWeight="800"
										fontSize="xl"
										letterSpacing="widest"
										color="gray.700"
									>
										{bookingCode || "------"}
									</Text>
									<IconButton
										aria-label="Salin kode"
										icon={
											hasCopiedCode ? (
												<Icon as={FaCheck} color="green.500" />
											) : (
												<Icon as={FaCopy} />
											)
										}
										variant="ghost"
										size="sm"
										color="gray.400"
										_hover={{ bg: "gray.50" }}
										onClick={onCopyCode}
									/>
								</HStack>

								<Button
									leftIcon={<Icon as={FaWhatsapp} boxSize={4} />}
									bg="green.500"
									color="white"
									borderRadius="lg"
									fontWeight="600"
									size="md"
									fontSize="sm"
									_hover={{ bg: "green.600" }}
									as="a"
									href="http://wa.me/6281139187999"
									target="_blank"
									rel="noopener noreferrer"
								>
									Buka Whatsapp & Konfirmasi Sekarang
								</Button>

								<Text fontSize="xs" color="gray.400" textAlign="center">
									Admin aktif setiap hari, 08:00 – 22:00 WIB
								</Text>

								<Box
									borderTop="1px dashed"
									borderColor="gray.200"
									pt={3}
									mt={1}
								>
									<Text fontSize="xs" color="gray.400" mb={2}>
										Demo — simulasi alur:
									</Text>
									<Button
										size="xs"
										variant="outline"
										colorScheme="blue"
										onClick={handleSimulateConfirm}
									>
										Simulasi: Admin konfirmasi →
									</Button>
								</Box>
							</VStack>
						)}

						{currentStep === 1 && (
							<VStack spacing={4} align="stretch">
								<Box bg="gray.900" borderRadius="xl" p={6} textAlign="center">
									<Text fontSize="sm" color="gray.400" mb={4}>
										Batas Waktu Pembayaran
									</Text>
									<HStack justify="center" spacing={5} align="center">
										<VStack spacing={0}>
											<Text
												fontSize="4xl"
												fontWeight="800"
												color="white"
												lineHeight={1}
											>
												{pad(hours)}
											</Text>
											<Text fontSize="xs" color="gray.400" mt={1}>
												Jam
											</Text>
										</VStack>
										<Text
											fontSize="4xl"
											fontWeight="800"
											color="white"
											lineHeight={1}
											mb={4}
										>
											:
										</Text>
										<VStack spacing={0}>
											<Text
												fontSize="4xl"
												fontWeight="800"
												color="white"
												lineHeight={1}
											>
												{pad(minutes)}
											</Text>
											<Text fontSize="xs" color="gray.400" mt={1}>
												Menit
											</Text>
										</VStack>
										<Text
											fontSize="4xl"
											fontWeight="800"
											color="white"
											lineHeight={1}
											mb={4}
										>
											:
										</Text>
										<VStack spacing={0}>
											<Text
												fontSize="4xl"
												fontWeight="800"
												color="white"
												lineHeight={1}
											>
												{pad(seconds)}
											</Text>
											<Text fontSize="xs" color="gray.400" mt={1}>
												Detik
											</Text>
										</VStack>
									</HStack>
								</Box>

								<Box
									border="1px solid"
									borderColor="gray.200"
									borderRadius="lg"
									p={4}
								>
									<HStack justify="space-between" mb={3}>
										<Text fontSize="xs" color="gray.600">
											Kode Virtual Account
										</Text>
										<Box
											bg="blue.700"
											color="white"
											fontSize="xs"
											fontWeight="700"
											px={2}
											py={0.5}
											borderRadius="sm"
										>
											BNI
										</Box>
									</HStack>
									<HStack justify="space-between">
										<Text
											fontWeight="700"
											color="gray.800"
											letterSpacing="wider"
											fontSize="md"
										>
											{formatVA(vaNumber)}
										</Text>
										<IconButton
											aria-label="Salin VA"
											icon={
												hasCopiedVA ? (
													<Icon as={FaCheck} color="green.500" />
												) : (
													<Icon as={FaCopy} />
												)
											}
											variant="ghost"
											size="sm"
											color="gray.400"
											_hover={{ bg: "gray.50" }}
											onClick={onCopyVA}
										/>
									</HStack>
								</Box>

								<Accordion allowToggle>
									<AccordionItem
										border="1px solid"
										borderColor="gray.200"
										borderRadius="lg"
										overflow="hidden"
									>
										<AccordionButton px={4} py={3}>
											<Box
												flex={1}
												textAlign="left"
												fontWeight="600"
												fontSize="sm"
												color="gray.700"
											>
												Cara Pembayaran
											</Box>
											<AccordionIcon />
										</AccordionButton>
										<AccordionPanel pb={4} px={4}>
											<VStack align="start" spacing={2}>
												<Text
													fontSize="sm"
													fontWeight="600"
													color="gray.700"
													mb={1}
												>
													ATM BNI
												</Text>
												{[
													"Pilih menu Transaksi Lainnya → Transfer",
													"Pilih Rekening Tabungan → ke Rekening BNI",
													"Masukkan nomor Virtual Account",
													"Masukkan nominal sesuai tagihan",
													"Konfirmasi dan selesaikan transaksi",
												].map((step, i) => (
													<Text key={i} fontSize="xs" color="gray.600">
														{i + 1}. {step}
													</Text>
												))}
											</VStack>
										</AccordionPanel>
									</AccordionItem>
								</Accordion>

								<Box borderTop="1px dashed" borderColor="gray.200" pt={3} mt={1}>
									<Text fontSize="xs" color="gray.400" mb={2}>
										Demo — simulasi alur:
									</Text>
									<HStack>
										<Button
											size="xs"
											variant="outline"
											onClick={() => goToStep(0)}
										>
											← Kembali
										</Button>
										<Button
											size="xs"
											variant="outline"
											colorScheme="green"
											onClick={handleSimulatePayment}
										>
											Simulasi: Pembayaran berhasil →
										</Button>
									</HStack>
								</Box>
							</VStack>
						)}

						{currentStep === 2 && (
							<VStack spacing={4} align="stretch">
								<VStack spacing={2} align="center" py={4}>
									<Box
										w="64px"
										h="64px"
										borderRadius="full"
										bg="green.50"
										border="4px solid"
										borderColor="green.100"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Icon as={FaCheck} color="green.500" boxSize={6} />
									</Box>
									<Text fontWeight="800" fontSize="lg" color="green.600">
										Booking Berhasil!
									</Text>
								</VStack>

								<Button
									variant="outline"
									borderColor="gray.300"
									color="gray.700"
									borderRadius="lg"
									fontWeight="600"
									size="md"
									fontSize="sm"
									leftIcon={<Icon as={FaPrint} boxSize={3.5} />}
									_hover={{ bg: "gray.50" }}
									onClick={handleCetakKwitansi}
								>
									Cetak Kwitansi
								</Button>

								<Divider borderColor="gray.200" />

								<Box>
									<Text
										fontSize="xs"
										color="gray.600"
										mb={2}
										fontWeight="600"
									>
										Ubah Pemesanan
									</Text>
									<Button
										variant="outline"
										borderColor="#008FFF"
										color="#008FFF"
										borderRadius="lg"
										fontWeight="600"
										size="md"
										fontSize="sm"
										w="full"
										leftIcon={<Icon as={FaExchangeAlt} boxSize={3.5} />}
										_hover={{ bg: "blue.50" }}
										onClick={() => setIsRescheduleOpen(true)}
									>
										Reschedule
									</Button>
								</Box>

								<Box
									bg="yellow.50"
									border="1px solid"
									borderColor="yellow.200"
									borderRadius="lg"
									p={3}
								>
									<Text fontSize="xs" color="yellow.700" lineHeight="1.5">
										Hanya dapat dijadwalkan maksimal H-7 sebelum jadwal [Kecuali kondisi ruang]
									</Text>
								</Box>

								<Box borderTop="1px dashed" borderColor="gray.200" pt={3} mt={1}>
									<Text fontSize="xs" color="gray.400" mb={2}>
										Demo — simulasi alur:
									</Text>
									<Button
										size="xs"
										variant="outline"
										onClick={() => goToStep(1)}
									>
										← Kembali
									</Button>
								</Box>
							</VStack>
						)}
						</>
						)}
					</Box>

					<Box
						bg="white"
						border="1px solid"
						borderColor="gray.200"
						borderRadius="xl"
						boxShadow="sm"
						overflow="hidden"
					>
						{image ? (
							<Box position="relative" h={{ base: "200px", md: "220px" }}>
								<Image
									src={image}
									alt={facility || "Venue"}
									fill
									style={{ objectFit: "cover" }}
								/>
							</Box>
						) : (
							<Box h={{ base: "200px", md: "220px" }} bg="gray.100" />
						)}

						<Box p={6}>
							<HStack mb={5} align="center" spacing={3} flexWrap="wrap">
								<Text fontSize="xl" fontWeight="800" color="gray.800">
									{facility || "-"}
								</Text>
								{isRutin && (
									<Box
										bg="blue.50"
										color="#008FFF"
										fontSize="xs"
										fontWeight="700"
										px={2}
										py={0.5}
										borderRadius="md"
										whiteSpace="nowrap"
									>
										Latihan Rutin
									</Box>
								)}
							</HStack>

							<VStack spacing={3} align="stretch" mb={5}>
								<InfoRow label="Lapangan" value={lapangan || "-"} />
								{isRutin ? (
									<VStack align="start" spacing={1}>
										<Text fontSize="xs" color="gray.600">Jadwal ({rutinDatesDisplay.length} Pertemuan)</Text>
										{rutinDatesDisplay.map((d, i) => (
											<HStack key={i} spacing={2}>
												<Text fontSize="xs" color="#008FFF" fontWeight="700" minW="20px">#{i + 1}</Text>
												<Text fontSize="sm" fontWeight="700" color="gray.800">{d}</Text>
											</HStack>
										))}
									</VStack>
								) : (
									<InfoRow label="Tanggal" value={tanggal || "-"} />
								)}
								<InfoRow label="Waktu" value={waktu || "-"} />
								<InfoRow label="Tipe Pengguna" value={tipeUser === "internal" ? "Internal" : tipeUser === "eksternal" ? "Eksternal" : tipeUser === "guest" ? "Guest" : "-"} />
								<InfoRow label="Nomor Transaksi" value={noTransaksi} />
								<InfoRow label="Pemesan" value={nama || "-"} />
								<InfoRow label="Nomor HP" value={noTelp || "-"} />
							</VStack>

							<Divider borderColor="gray.200" mb={4} />

							<VStack spacing={2} align="stretch" mb={4}>
								<HStack justify="space-between">
									<Text fontSize="sm" color="gray.600">
										Harga per {displaySatuan || "unit"}
									</Text>
									<Text fontSize="sm" color="gray.700">
										{formatRupiah(hargaNum)}
									</Text>
								</HStack>
								<HStack justify="space-between">
									<Text fontSize="sm" color="gray.600">
										Durasi
									</Text>
									<Text fontSize="sm" color="gray.700">
										{durasiNum} {displaySatuan || "unit"}
									</Text>
								</HStack>
								{isRutin && (
									<>
										<HStack justify="space-between">
											<Text fontSize="sm" color="gray.600">Jumlah Pertemuan</Text>
											<Text fontSize="sm" color="gray.700">{rutinDatesDisplay.length}× (1 bulan)</Text>
										</HStack>
										<HStack justify="space-between">
											<Text fontSize="sm" color="gray.600">Subtotal per pertemuan</Text>
											<Text fontSize="sm" color="gray.700">{formatRupiah(hargaNum * durasiNum)}</Text>
										</HStack>
									</>
								)}
							</VStack>

							<HStack
								justify="space-between"
								pt={4}
								borderTop="1px solid"
								borderColor="gray.200"
							>
								<Text fontWeight="700" color="gray.800">
									Total Pembayaran
								</Text>
								<Text fontWeight="800" fontSize="xl" color="#008FFF">
									{formatRupiah(totalNum)}
								</Text>
							</HStack>
							{isRutin && (
								<Box bg="blue.50" border="1px solid" borderColor="blue.100" borderRadius="lg" p={3} mt={4}>
									<Text fontSize="xs" color="#008FFF" fontWeight="600">
										✓ Anda telah booking Latihan Rutin untuk {rutinDatesDisplay.length} pertemuan dalam satu bulan. Slot akan otomatis tereservasi di setiap minggu yang dipilih.
									</Text>
								</Box>
							)}
						</Box>
					</Box>
				</Grid>
					</>
				)}
			</Box>

			<RescheduleRefundModal
				isOpen={isRescheduleOpen}
				onClose={() => setIsRescheduleOpen(false)}
				onRescheduleSubmit={handleRescheduleSubmit}
				idFasilitas={idFasilitas}
				facility={facility}
				image={image}
				lapangan={lapangan}
				tanggal={tanggal}
				waktu={waktu}
				noTransaksi={noTransaksi}
				nama={nama}
				noTelp={noTelp}
				total={totalNum}
				tipeUser={tipeUser}
			/>

			<FasorFooter />

			{/* Printable receipt that matches the PDF layout exactly */}
			<div id="fasor-receipt-print-area">
				{/* Header */}
				<div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid black", paddingBottom: "12px", marginBottom: "20px" }}>
					<img src="/images/its kwitansi.png" alt="Logo ITS" style={{ width: "75px", height: "75px", marginRight: "20px" }} />
					<div style={{ flex: 1 }}>
						<h2 style={{ margin: 0, fontSize: "16pt", fontWeight: "bold", fontFamily: "Arial, sans-serif" }}>Formulir Penggunaan Fasilitas Olahraga ITS</h2>
						<p style={{ margin: "3px 0 0 0", fontSize: "9pt", fontFamily: "Arial, sans-serif", color: "#333" }}>Kampus ITS Sukolilo, Jl. Teknik Mesin (samping Lapangan Basket A) Surabaya</p>
						<p style={{ margin: "2px 0 0 0", fontSize: "9pt", fontFamily: "Arial, sans-serif", color: "#333" }}>Telepon: 031-5923476, 031-5994251-54 (ext. 1175), No. Fax: 031-5912797, email: fasor@its.ac.id</p>
					</div>
				</div>

				{/* Two-Column Detail Table */}
				<table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial, sans-serif", fontSize: "10pt", lineHeight: "1.8" }}>
					<tbody>
						{/* Row 1: Kode Booking & Lapangan */}
						<tr>
							<td style={{ width: "15%", verticalAlign: "top", padding: "6px 0" }}>Kode Booking</td>
							<td style={{ width: "2%", verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ width: "33%", verticalAlign: "top", padding: "6px 0", fontSize: "15pt", fontWeight: "bold", lineHeight: 1 }}>{bookingCode}</td>
							
							<td style={{ width: "15%", verticalAlign: "top", padding: "6px 0" }}>Lapangan</td>
							<td style={{ width: "2%", verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ width: "33%", verticalAlign: "top", padding: "6px 0" }}>{lapangan || facility}</td>
						</tr>

						{/* Row 2: Empty Left & Kepentingan Right */}
						<tr>
							<td style={{ padding: "6px 0" }}></td>
							<td style={{ padding: "6px 0" }}></td>
							<td style={{ padding: "6px 0" }}></td>
							
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>Kepentingan</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>
								{isRutin ? "Latihan Rutin" : "Latihan Insidentil"}
							</td>
						</tr>

						{/* Row 3: Nama & Tanggal */}
						<tr>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>Nama</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>{nama}</td>
							
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>Tanggal</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>{formatDatePdf(tanggal)}</td>
						</tr>

						{/* Row 4: NRP/NIP & Keterangan */}
						<tr>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>NRP/NIP</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>{resolvedNrp}</td>
							
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>Keterangan</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>{keteranganVal}</td>
						</tr>

						{/* Row 5: Telp./HP & Empty Right */}
						<tr>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>Telp./HP</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>{noTelp}</td>
							
							<td style={{ padding: "6px 0" }}></td>
							<td style={{ padding: "6px 0" }}></td>
							<td style={{ padding: "6px 0" }}></td>
						</tr>

						{/* Row 6: Jumlah & Terbilang */}
						<tr>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>Jumlah</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>Rp. {Number(total || 0).toLocaleString("id-ID")}</td>
							
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>Terbilang</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>{terbilang(Number(total || 0))}</td>
						</tr>

						{/* Row 7: Jadwal & Empty Right */}
						<tr>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>Jadwal</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
							<td style={{ verticalAlign: "top", padding: "6px 0" }}>
								{getSession(waktu)} {waktu}
							</td>
							
							<td style={{ padding: "6px 0" }}></td>
							<td style={{ padding: "6px 0" }}></td>
							<td style={{ padding: "6px 0" }}></td>
						</tr>
					</tbody>
				</table>

				{/* Signatures */}
				<div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", fontFamily: "Arial, sans-serif", fontSize: "10pt" }}>
					<div style={{ width: "40%" }}>
						<p style={{ margin: "0 0 5px 0" }}>Mengetahui :</p>
						<p style={{ margin: "0" }}>Manajer UPT Property ITS</p>
						<div style={{ height: "70px" }}></div>
						<p style={{ margin: "0" }}>Niken Indira Vindy Lestari</p>
						<p style={{ margin: "2px 0 0 0" }}>NIP. 1991202342113</p>
					</div>
					<div style={{ width: "40%" }}>
						<p style={{ margin: "0 0 5px 0" }}>Penerima</p>
						<div style={{ height: "85px" }}></div>
						<p style={{ margin: "0" }}>{bottomReceiverName}</p>
					</div>
				</div>

				{/* Note */}
				<div style={{ marginTop: "40px", fontFamily: "Arial, sans-serif", fontSize: "8.5pt", lineHeight: "1.4", color: "black", borderTop: "1px dashed #ccc", paddingTop: "10px" }}>
					<strong>NB :</strong> Pembatalan/pemindahan jadwal yang sudah dibayar, bisa dilakukan selambat lambatnya 7 hari sebelum menggunakan lapangan, kurang dari 7 hari tidak bisa dibatalkan/dipindah jadwal
				</div>
			</div>
		</Box>
	)
}

export default DetailPemesananPage
