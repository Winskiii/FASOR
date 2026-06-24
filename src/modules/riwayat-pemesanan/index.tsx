import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import {
	Box,
	Flex,
	VStack,
	HStack,
	Text,
	Button,
	Icon,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	Divider,
	IconButton,
	useClipboard,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
	Grid,
	Spinner,
	Center,
} from "@chakra-ui/react"
import Image from "next/image"
import { FaChevronRight, FaCopy, FaTimes, FaWhatsapp, FaCheck } from "react-icons/fa"
import {
	GiShuttlecock,
	GiTennisBall,
	GiBasketballBall,
	GiSoccerBall,
} from "react-icons/gi"
import { MdSportsTennis, MdPrint } from "react-icons/md"
import { KwitansiPrint, type KwitansiData } from "@/components/organisms/KwitansiPDF"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import FasorFooter from "@/components/organisms/FasorFooter"
import useSWRImmutable from "swr/immutable"
import { useAuth } from "@/services/useAuth"


type BookingStatus = "waiting_confirmation" | "waiting_payment" | "paid" | "cancelled"
type SportType = "bulutangkis" | "tenis" | "basket" | "futsal" | "voli" | "sepakbola"

interface BookingRecord {
	bookingCode: string
	status: BookingStatus
	facilityName: string
	facilityImage: string
	tanggal: string
	waktu: string
	total: number
	sportType: SportType
	lapangan: string
	jenis?: string
	transactionNo: string
	nama: string
	noTelp: string
	dateLabel: string
	rutinGroup?: string | null
	createdAt: string
	expiresAt?: string | null
}

interface RutinGroup {
	kind: "rutin"
	rutinGroup: string
	bookings: BookingRecord[]
	facilityName: string
	lapangan: string
	waktu: string
	totalKeseluruhan: number
	status: BookingStatus
	sportType: SportType
	nama: string
	noTelp: string
	dateLabel: string
	createdAt: string
	expiresAt?: string | null
}


type FilterKey = "semua" | BookingStatus | "selesai"

const FILTER_TABS: { key: FilterKey; label: string }[] = [
	{ key: "semua", label: "Semua" },
	{ key: "waiting_confirmation", label: "Menunggu Konfirmasi" },
	{ key: "waiting_payment", label: "Menunggu Pembayaran" },
	{ key: "paid", label: "Berhasil" },
	{ key: "selesai", label: "Selesai" },
	{ key: "cancelled", label: "Dibatalkan" },
]

const STATUS_CONFIG: Record<
	string,
	{ label: string; color: string; bg: string }
> = {
	waiting_confirmation: { label: "Menunggu Konfirmasi", color: "#ECBA24", bg: "#FEF8E7" },
	waiting_payment: { label: "Menunggu Pembayaran", color: "#008FFF", bg: "#E5F4FF" },
	paid: { label: "Berhasil", color: "#57BC3B", bg: "#EEF8EB" },
	selesai: { label: "Selesai", color: "#418F2B", bg: "#EBF4EA" },
	cancelled: { label: "Dibatalkan", color: "#991B1B", bg: "#FEE2E2" },
}

const mapFacilityToSport = (name: string): SportType => {
	const n = name.toLowerCase();
	if (n.includes("bulutangkis") || n.includes("badminton")) return "bulutangkis";
	if (n.includes("tennis") || n.includes("tenis")) return "tenis";
	if (n.includes("basket")) return "basket";
	if (n.includes("futsal")) return "futsal";
	if (n.includes("sepakbola") || n.includes("soccer") || n.includes("stadion")) return "sepakbola";
	if (n.includes("volly") || n.includes("voli")) return "voli";
	return "sepakbola";
};

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

const SPORT_CONFIG: Record<
	string,
	{ label: string; icon: React.ElementType; image?: string; circleBg: string; iconColor: string }
> = {
	bulutangkis: { label: "Bulutangkis", icon: GiShuttlecock, image: "/images/badminton.png", circleBg: "#CFFAFE", iconColor: "#0891B2" },
	tenis: { label: "Tenis", icon: MdSportsTennis, image: "/images/tennis.png", circleBg: "#DCFCE7", iconColor: "#16A34A" },
	basket: { label: "Basket", icon: GiBasketballBall, image: "/images/basket.png", circleBg: "#FED7AA", iconColor: "#EA580C" },
	futsal: { label: "Futsal", icon: GiSoccerBall, image: "/images/futsal.png", circleBg: "#f8e3e3ff", iconColor: "#2563EB" },
	voli: { label: "Voli", icon: GiTennisBall, image: "/images/voli.png", circleBg: "#FCE7F3", iconColor: "#BE185D" },
	sepakbola: { label: "Sepakbola", icon: GiSoccerBall, image: "/images/sepak bola.png", circleBg: "#DCFCE7", iconColor: "#15803D" },
}


const formatRupiah = (n: number) =>
	"Rp" + n.toLocaleString("id-ID").replace(/\./g, ".")

const isBookingSelesai = (b: BookingRecord): boolean => {
	if (b.status !== "paid") return false
	const endTimeStr = b.waktu.split(" - ")[1]?.trim() ?? "23:59"
	const [endH, endM] = endTimeStr.split(":").map(Number)
	const bookingEnd = new Date(b.tanggal)
	bookingEnd.setHours(endH, endM, 0, 0)
	return bookingEnd < new Date()
}

const getDisplayStatus = (b: BookingRecord): string =>
	isBookingSelesai(b) ? "selesai" : b.status


const CountdownTimer = ({ expiresAt }: { expiresAt?: string | null }) => {
	const [time, setTime] = useState(0)
	useEffect(() => {
		if (!expiresAt) {
			setTime(0)
			return
		}
		const expiryTime = new Date(expiresAt).getTime()
		const calculateRemaining = () => {
			const now = new Date().getTime()
			return Math.max(0, Math.floor((expiryTime - now) / 1000))
		}
		setTime(calculateRemaining())
		const id = setInterval(() => {
			setTime(calculateRemaining())
		}, 1000)
		return () => clearInterval(id)
	}, [expiresAt])
	const h = Math.floor(time / 3600).toString().padStart(2, "0")
	const m = Math.floor((time % 3600) / 60).toString().padStart(2, "0")
	const s = (time % 60).toString().padStart(2, "0")
	return (
		<Box bg="gray.900" borderRadius="xl" p={5} textAlign="center">
			<Text fontSize="xs" color="gray.400" mb={2}>Batas Waktu Pembayaran</Text>
			<HStack justify="center" spacing={2} mb={1}>
				<Text fontSize="3xl" fontWeight="800" color="white" fontFamily="mono">{h}</Text>
				<Text fontSize="3xl" fontWeight="800" color="gray.400">:</Text>
				<Text fontSize="3xl" fontWeight="800" color="white" fontFamily="mono">{m}</Text>
				<Text fontSize="3xl" fontWeight="800" color="gray.400">:</Text>
				<Text fontSize="3xl" fontWeight="800" color="white" fontFamily="mono">{s}</Text>
			</HStack>
			<HStack justify="center" spacing={8}>
				<Text fontSize="xs" color="gray.400">Jam</Text>
				<Text fontSize="xs" color="gray.400">Menit</Text>
				<Text fontSize="xs" color="gray.400">Detik</Text>
			</HStack>
		</Box>
	)
}


const DetailRow = ({ label, value }: { label: string; value: string }) => (
	<VStack align="start" spacing={0.5}>
		<Text fontSize="xs" color="gray.400">{label}</Text>
		<Text fontSize="sm" fontWeight="600" color="gray.800">{value}</Text>
	</VStack>
)


const KonfirmasiAction = ({ bookingCode, onClose }: { bookingCode: string; onClose: () => void }) => {
	const router = useRouter()
	const { hasCopied, onCopy } = useClipboard(bookingCode)
	return (
		<VStack spacing={4} align="stretch">
			<Divider />
			<VStack align="start" spacing={1}>
				<Text fontWeight="700" color="gray.800">Konfirmasi ke Admin Fasor</Text>
				<Text fontSize="sm" color="gray.500">
					Kirim kode booking kamu ke WhatsApp untuk mendapatkan Virtual Account
				</Text>
			</VStack>
			<HStack
				border="1px solid"
				borderColor="gray.200"
				borderRadius="full"
				px={4}
				py={2}
				justify="space-between"
			>
				<Text fontWeight="700" fontSize="lg" fontFamily="mono" color="gray.800" letterSpacing="widest">
					{bookingCode}
				</Text>
				<IconButton
					aria-label="Salin kode"
					icon={<Icon as={FaCopy} />}
					size="sm"
					variant="ghost"
					colorScheme="blue"
					onClick={onCopy}
				/>
			</HStack>
			{hasCopied && <Text fontSize="xs" color="green.500">Kode disalin!</Text>}
			<Button
				bg="#25D366"
				color="white"
				_hover={{ bg: "#1ebe5d" }}
				leftIcon={<Icon as={FaWhatsapp} />}
				borderRadius="xl"
				fontWeight="700"
				size="lg"
				onClick={() => window.open(`https://wa.me/628123456789?text=Halo%20Admin,%20saya%20ingin%20konfirmasi%20booking%20dengan%20kode%20${bookingCode}`, "_blank")}
			>
				Buka WhatsApp &amp; Konfirmasi Sekarang
			</Button>
			<Text fontSize="xs" color="gray.400" textAlign="center">
				Kami tersedia Senin - Jumat, 08.00 - 16.00 WIB
			</Text>
			<Button variant="ghost" color="gray.500" onClick={() => { onClose(); router.push("/") }}>
				Kembali ke Beranda
			</Button>
		</VStack>
	)
}

const MenungguAction = ({ onClose, expiresAt }: { onClose: () => void; expiresAt?: string | null }) => {
	const router = useRouter()
	return (
		<VStack spacing={4} align="stretch">
			<Divider />
			<CountdownTimer expiresAt={expiresAt} />
			<Box border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden">
				<Accordion allowToggle>
					<AccordionItem border="none">
						<AccordionButton px={4} py={3}>
							<Text flex="1" textAlign="left" fontWeight="600" color="gray.700">Cara Pembayaran</Text>
							<AccordionIcon />
						</AccordionButton>
						<AccordionPanel pb={4} px={4}>
							<Text fontSize="sm" color="gray.600">
								1. Transfer ke rekening yang tertera<br />
								2. Konfirmasi pembayaran melalui WhatsApp<br />
								3. Tunggu verifikasi dari admin
							</Text>
						</AccordionPanel>
					</AccordionItem>
				</Accordion>
			</Box>
			<Button variant="ghost" color="gray.500" onClick={() => { onClose(); router.push("/") }}>
				Kembali ke Beranda
			</Button>
		</VStack>
	)
}

const SelesaiAction = ({ onClose, booking }: { onClose: () => void; booking?: BookingRecord }) => {
	const router = useRouter()
	const [showKwitansi, setShowKwitansi] = useState(false)

	const kwitansiData: KwitansiData | null = booking ? {
		bookingCode: booking.bookingCode,
		transactionNo: booking.transactionNo,
		facilityName: booking.facilityName,
		lapangan: booking.lapangan,
		tanggal: booking.tanggal,
		waktu: booking.waktu,
		nama: booking.nama,
		noTelp: booking.noTelp,
		jenisSewa: booking.jenis || "Eksternal",
		total: booking.total,
		status: "Lunas",
	} : null

	if (showKwitansi && kwitansiData) {
		return <KwitansiPrint data={kwitansiData} onClose={() => setShowKwitansi(false)} />
	}

	return (
		<VStack spacing={3} align="stretch">
			<Divider />
			{booking && (
				<Button
					bg="#008FFF"
					color="white"
					_hover={{ bg: "#0070CC" }}
					borderRadius="xl"
					fontWeight="700"
					size="lg"
					leftIcon={<Icon as={MdPrint} />}
					onClick={() => setShowKwitansi(true)}
				>
					Cetak Kwitansi Pembayaran
				</Button>
			)}
			<Button
				bg="gray.900"
				color="white"
				_hover={{ bg: "gray.700" }}
				borderRadius="xl"
				fontWeight="700"
				size="lg"
				onClick={() => { onClose(); router.push("/sewa-lapangan") }}
			>
				Buat Reservasi Baru
			</Button>
			<Button variant="ghost" color="gray.500" onClick={() => { onClose(); router.push("/") }}>
				Kembali ke Beranda
			</Button>
		</VStack>
	)
}

const DibatalkanAction = ({ onClose }: { onClose: () => void }) => {
	const router = useRouter()
	return (
		<VStack spacing={3} align="stretch">
			<Divider />
			<Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" p={4}>
				<Text fontSize="sm" fontWeight="600" color="red.700">Pemesanan ini telah dibatalkan</Text>
				<Text fontSize="xs" color="red.500" mt={1}>Jika ada pertanyaan, hubungi admin Fasor ITS.</Text>
			</Box>
			<Button
				bg="gray.900"
				color="white"
				_hover={{ bg: "gray.700" }}
				borderRadius="xl"
				fontWeight="700"
				size="lg"
				onClick={() => { onClose(); router.push("/sewa-lapangan") }}
			>
				Buat Reservasi Baru
			</Button>
			<Button variant="ghost" color="gray.500" onClick={() => { onClose(); router.push("/") }}>
				Kembali ke Beranda
			</Button>
		</VStack>
	)
}


const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
	waiting_confirmation: { label: "PROSES", color: "#1D4ED8", bg: "#DBEAFE" },
	waiting_payment: { label: "PROSES", color: "#1D4ED8", bg: "#DBEAFE" },
	paid: { label: "BERHASIL", color: "#065F46", bg: "#D1FAE5" },
	selesai: { label: "SELESAI", color: "#1D4ED8", bg: "#DBEAFE" },
	cancelled: { label: "BATAL", color: "#991B1B", bg: "#FEE2E2" },
}

interface BookingDetailModalProps {
	booking: BookingRecord | null
	onClose: () => void
}

const BookingDetailModal = ({ booking, onClose }: BookingDetailModalProps) => {
	if (!booking) return null
	const sport = SPORT_CONFIG[booking.sportType]
	const displayStatus = getDisplayStatus(booking)
	const status = STATUS_CONFIG[displayStatus]
	const badge = BADGE_CONFIG[displayStatus]
	const { hasCopied, onCopy } = useClipboard(booking.bookingCode)
	return (
		<Modal isOpen={true} onClose={onClose} size="md" scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.500" />
			<ModalContent borderRadius="2xl" overflow="hidden" mx={4}>
				<ModalBody p={0}>
					<Box px={6} pt={6} pb={4}>
						<Flex justify="space-between" align="flex-start">
							<HStack spacing={3}>
								<Box
									w="48px"
									h="48px"
									borderRadius="full"
									bg={sport.circleBg}
									display="flex"
									alignItems="center"
									justifyContent="center"
									flexShrink={0}
								>
									{sport.image ? (
										<Image src={sport.image} alt={sport.label} width={28} height={28} style={{ objectFit: "contain" }} />
									) : (
										<Icon as={sport.icon} color={sport.iconColor} boxSize={6} />
									)}
								</Box>
								<Text fontSize="lg" fontWeight="800" color="gray.800">{booking.facilityName}</Text>
							</HStack>
							<IconButton
								aria-label="Tutup"
								icon={<Icon as={FaTimes} />}
								size="sm"
								variant="ghost"
								color="gray.400"
								onClick={onClose}
								_hover={{ bg: "gray.100" }}
								ml={2}
								flexShrink={0}
							/>
						</Flex>
						<Flex justify="space-between" align="center" mt={3}>
							<Box
								as="button"
								onClick={onCopy}
								px={3} py={1} borderRadius="full" bg="#008FFF"
								_hover={{ bg: "#0070CC" }}
								transition="all 0.2s"
								display="flex" alignItems="center" gap={1.5}
								title="Salin kode booking"
							>
								<Text fontSize="xs" fontWeight="700" color="white">
									#{booking.bookingCode}
								</Text>
								{hasCopied ? (
									<Icon as={FaCheck} color="white" boxSize={2.5} />
								) : (
									<Icon as={FaCopy} color="white" boxSize={2.5} />
								)}
							</Box>
							<Text fontSize="sm" fontWeight="600" color={status.color}>{status.label}</Text>
						</Flex>
					</Box>

					<Divider />

					<Box px={6} py={5}>
						<Grid templateColumns="1fr 1fr" gap={4}>
							<DetailRow label="Lapangan" value={booking.lapangan} />
							<DetailRow label="Tanggal" value={booking.tanggal} />
							<DetailRow label="Waktu" value={booking.waktu} />
							<DetailRow label="Jenis" value={booking.jenis ?? "Eksternal"} />
							<DetailRow label="Nomor Transaksi" value={booking.transactionNo} />
							<DetailRow label="Pemesan" value={booking.nama} />
							<DetailRow label="Nomor" value={booking.noTelp} />
						</Grid>
						<Flex
							justify="space-between"
							align="center"
							mt={5}
							pt={4}
							borderTop="1px solid"
							borderColor="gray.100"
						>
							<Text fontWeight="700" color="gray.800">Total Pembayaran</Text>
							<Text fontWeight="800" fontSize="lg" color="#008FFF">{formatRupiah(booking.total)}</Text>
						</Flex>
					</Box>

					<Box px={6} pb={6}>
						{booking.status === "waiting_confirmation" && (
							<KonfirmasiAction bookingCode={booking.bookingCode} onClose={onClose} />
						)}
						{booking.status === "waiting_payment" && (
							<MenungguAction onClose={onClose} expiresAt={booking.expiresAt} />
						)}
						{booking.status === "paid" && (
							<SelesaiAction onClose={onClose} booking={booking} />
						)}
						{booking.status === "cancelled" && (
							<DibatalkanAction onClose={onClose} />
						)}
					</Box>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}


interface RutinGroupDetailModalProps {
	group: RutinGroup | null
	onClose: () => void
}

const RutinGroupDetailModal = ({ group, onClose }: RutinGroupDetailModalProps) => {
	if (!group) return null
	const sport = SPORT_CONFIG[group.sportType]
	const displayStatus = getDisplayStatus(group.bookings[0])
	const status = STATUS_CONFIG[displayStatus]
	const badge = BADGE_CONFIG[displayStatus]
	const sorted = [...group.bookings].sort((a, b) => a.tanggal.localeCompare(b.tanggal))
	const codeToCopy = sorted[0].bookingCode
	const { hasCopied, onCopy } = useClipboard(codeToCopy)

	return (
		<Modal isOpen={true} onClose={onClose} size="md" scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.500" />
			<ModalContent borderRadius="2xl" overflow="hidden" mx={4}>
				<ModalBody p={0}>
					<Box px={6} pt={6} pb={4}>
						<Flex justify="space-between" align="flex-start">
							<HStack spacing={3}>
								<Box
									w="48px" h="48px" borderRadius="full"
									bg={sport.circleBg} display="flex" alignItems="center" justifyContent="center" flexShrink={0}
								>
									{sport.image ? (
										<Image src={sport.image} alt={sport.label} width={28} height={28} style={{ objectFit: "contain" }} />
									) : (
										<Icon as={sport.icon} color={sport.iconColor} boxSize={6} />
									)}
								</Box>
								<VStack align="start" spacing={0}>
									<Text fontSize="lg" fontWeight="800" color="gray.800">{group.facilityName}</Text>
									<Box px={2} py={0.5} borderRadius="md" bg="blue.100" mt={0.5}>
										<Text fontSize="xs" fontWeight="700" color="blue.700">Latihan Rutin · {sorted.length} Pertemuan</Text>
									</Box>
								</VStack>
							</HStack>
							<IconButton
								aria-label="Tutup"
								icon={<Icon as={FaTimes} />}
								size="sm" variant="ghost" color="gray.400"
								onClick={onClose} _hover={{ bg: "gray.100" }} ml={2} flexShrink={0}
							/>
						</Flex>
						<Flex justify="space-between" align="center" mt={3}>
							<Box
								as="button"
								onClick={onCopy}
								px={3} py={1} borderRadius="full" bg="#008FFF"
								_hover={{ bg: "#0070CC" }}
								transition="all 0.2s"
								display="flex" alignItems="center" gap={1.5}
								title="Salin kode rutin"
							>
								<Text fontSize="xs" fontWeight="700" color="white">
									#{codeToCopy}
								</Text>
								{hasCopied ? (
									<Icon as={FaCheck} color="white" boxSize={2.5} />
								) : (
									<Icon as={FaCopy} color="white" boxSize={2.5} />
								)}
							</Box>
							<Text fontSize="sm" fontWeight="600" color={status.color}>{status.label}</Text>
						</Flex>
					</Box>

					<Divider />

					<Box px={6} py={5}>
						<Grid templateColumns="1fr 1fr" gap={4} mb={4}>
							<DetailRow label="Lapangan" value={group.lapangan} />
							<DetailRow label="Waktu" value={group.waktu} />
							<DetailRow label="Pemesan" value={group.nama} />
							<DetailRow label="Nomor" value={group.noTelp} />
						</Grid>

						<Box p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100" mb={4}>
							<Text fontSize="xs" color="blue.600" fontWeight="700" mb={2}>Jadwal Latihan ({sorted.length} Pertemuan):</Text>
							<VStack align="start" spacing={1.5}>
								{sorted.map((b, i) => (
									<HStack key={b.bookingCode} justify="space-between" w="full">
										<HStack spacing={2}>
											<Text fontSize="xs" color="blue.500" fontWeight="700" minW="20px">#{i + 1}</Text>
											<Text fontSize="sm" color="gray.700" fontWeight="600">{b.tanggal}</Text>
										</HStack>
										<Text fontSize="xs" color="gray.500" fontFamily="mono">{b.bookingCode}</Text>
									</HStack>
								))}
							</VStack>
						</Box>

						<Flex justify="space-between" align="center" pt={4} borderTop="1px solid" borderColor="gray.100">
							<VStack align="start" spacing={0}>
								<Text fontWeight="700" color="gray.800">Total Pembayaran</Text>
								<Text fontSize="xs" color="gray.400">{sorted.length} pertemuan × {formatRupiah(Math.round(group.totalKeseluruhan / sorted.length))}</Text>
							</VStack>
							<Text fontWeight="800" fontSize="lg" color="#008FFF">{formatRupiah(group.totalKeseluruhan)}</Text>
						</Flex>
					</Box>

					<Box px={6} pb={6}>
						{group.status === "waiting_confirmation" && (
							<KonfirmasiAction bookingCode={sorted[0].bookingCode} onClose={onClose} />
						)}
						{group.status === "waiting_payment" && (
							<MenungguAction onClose={onClose} expiresAt={group.expiresAt} />
						)}
						{group.status === "paid" && (
							<SelesaiAction onClose={onClose} />
						)}
						{group.status === "cancelled" && (
							<DibatalkanAction onClose={onClose} />
						)}
					</Box>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}


interface RutinGroupCardProps {
	group: RutinGroup
	onLihatRutinDetail: (g: RutinGroup) => void
}

const RutinGroupCard = ({ group, onLihatRutinDetail }: RutinGroupCardProps) => {
	const sport = SPORT_CONFIG[group.sportType]
	const displayStatus = getDisplayStatus(group.bookings[0])
	const status = STATUS_CONFIG[displayStatus]

	const sorted = [...group.bookings].sort((a, b) => a.tanggal.localeCompare(b.tanggal))

	return (
		<Box
			bg="white"
			border="1px solid"
			borderColor="blue.200"
			borderRadius="xl"
			overflow="hidden"
			boxShadow="sm"
			_hover={{ boxShadow: "md", borderColor: "blue.300" }}
			transition="all 0.15s"
		>
			<HStack
				px={5}
				py={3}
				borderBottom="1px solid"
				borderColor="gray.100"
				spacing={3}
				flexWrap="wrap"
				rowGap={1}
				bg="blue.50"
			>
				<HStack spacing={1.5}>
					<Icon as={sport.icon} color={sport.iconColor} boxSize={3.5} />
					<Text fontSize="xs" color="gray.500" fontWeight="500">{sport.label}</Text>
				</HStack>
				<Text fontSize="xs" color="gray.400">·</Text>
				<Box px={2} py={0.5} borderRadius="md" bg="blue.100">
					<Text fontSize="xs" fontWeight="700" color="blue.700">Latihan Rutin · {sorted.length} Pertemuan</Text>
				</Box>
				<Box px={2} py={0.5} borderRadius="full" bg={status.bg} ml="auto">
					<Text fontSize="xs" fontWeight="700" color={status.color}>{status.label}</Text>
				</Box>
			</HStack>

			<Box px={5} py={5}>
				<HStack spacing={4} mb={4}>
					<Box
						w="56px" h="56px" borderRadius="full"
						bg={sport.circleBg} display="flex" alignItems="center" justifyContent="center" flexShrink={0}
					>
						{sport.image ? (
							<Image src={sport.image} alt={sport.label} width={32} height={32} style={{ objectFit: "contain" }} />
						) : (
							<Icon as={sport.icon} color={sport.iconColor} boxSize={7} />
						)}
					</Box>
					<Text fontSize="xl" fontWeight="800" color="gray.800">{group.facilityName}</Text>
				</HStack>

				<Box mb={4} p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100">
					<Text fontSize="xs" color="blue.600" fontWeight="600" mb={2}>Jadwal Latihan:</Text>
					<VStack align="start" spacing={1}>
						{sorted.map((b, i) => (
							<HStack key={b.bookingCode} spacing={2}>
								<Text fontSize="xs" color="blue.500" fontWeight="700" minW="20px">#{i + 1}</Text>
								<Text fontSize="xs" color="gray.700" fontWeight="600">{b.tanggal}</Text>
								<Text fontSize="xs" color="gray.500">{b.waktu}</Text>
							</HStack>
						))}
					</VStack>
				</Box>

				<Flex justify="space-between" align="flex-end" gap={4} flexWrap="wrap">
					<Flex gap={6} flexWrap="wrap">
						<VStack align="start" spacing={0.5}>
							<Text fontSize="xs" color="gray.400">Lapangan</Text>
							<Text fontSize="sm" fontWeight="700" color="gray.800">{group.lapangan}</Text>
						</VStack>
						<VStack align="start" spacing={0.5}>
							<Text fontSize="xs" color="gray.400">Waktu</Text>
							<Text fontSize="sm" fontWeight="700" color="gray.800">{group.waktu}</Text>
						</VStack>
						<VStack align="start" spacing={0.5}>
							<Text fontSize="xs" color="gray.400">Total Pembayaran</Text>
							<Text fontSize="sm" fontWeight="700" color="#008FFF">{formatRupiah(group.totalKeseluruhan)}</Text>
						</VStack>
					</Flex>
					<Button
						variant="ghost" size="sm" color="#008FFF" fontWeight="600" fontSize="sm"
						rightIcon={<Icon as={FaChevronRight} boxSize={3} />}
						px={2} _hover={{ bg: "blue.50" }}
						onClick={() => onLihatRutinDetail(group)}
						flexShrink={0}
					>
						Lihat Detail
					</Button>
				</Flex>
			</Box>
		</Box>
	)
}


interface BookingCardProps {
	booking: BookingRecord
	onLihatDetail: (b: BookingRecord) => void
}

const BookingCard = ({ booking, onLihatDetail }: BookingCardProps) => {
	const sport = SPORT_CONFIG[booking.sportType]
	const status = STATUS_CONFIG[getDisplayStatus(booking)]

	return (
		<Box
			bg="white"
			border="1px solid"
			borderColor="gray.200"
			borderRadius="xl"
			overflow="hidden"
			boxShadow="sm"
			_hover={{ boxShadow: "md", borderColor: "gray.300" }}
			transition="all 0.15s"
		>
			<HStack
				px={5}
				py={3}
				borderBottom="1px solid"
				borderColor="gray.100"
				spacing={3}
				flexWrap="wrap"
				rowGap={1}
			>
				<HStack spacing={1.5}>
					<Icon as={sport.icon} color={sport.iconColor} boxSize={3.5} />
					<Text fontSize="xs" color="gray.500" fontWeight="500">
						{sport.label}
					</Text>
				</HStack>
				<Text fontSize="xs" color="gray.400">·</Text>
				<Text fontSize="xs" color="gray.500">{booking.dateLabel}</Text>
				<Text fontSize="xs" color="gray.400">·</Text>
				<Text fontSize="xs" color="gray.400" fontFamily="mono">
					{booking.transactionNo}
				</Text>
				<Box
					px={2}
					py={0.5}
					borderRadius="full"
					bg={status.bg}
					ml="auto"
				>
					<Text fontSize="xs" fontWeight="700" color={status.color}>
						{status.label}
					</Text>
				</Box>
			</HStack>

			<Box px={5} py={5}>
				<HStack spacing={4} mb={5}>
					<Box
						w="56px"
						h="56px"
						borderRadius="full"
						bg={sport.circleBg}
						display="flex"
						alignItems="center"
						justifyContent="center"
						flexShrink={0}
					>
						{sport.image ? (
							<Image src={sport.image} alt={sport.label} width={32} height={32} style={{ objectFit: "contain" }} />
						) : (
							<Icon as={sport.icon} color={sport.iconColor} boxSize={7} />
						)}
					</Box>
					<Text fontSize="xl" fontWeight="800" color="gray.800">
						{booking.facilityName}
					</Text>
				</HStack>

				<Flex justify="space-between" align="flex-end" gap={4} flexWrap="wrap">
					<Flex gap={8} flexWrap="wrap">
						<VStack align="start" spacing={0.5}>
							<Text fontSize="xs" color="gray.400">Lapangan</Text>
							<Text fontSize="sm" fontWeight="700" color="gray.800">
								{booking.lapangan}
							</Text>
						</VStack>
						<VStack align="start" spacing={0.5}>
							<Text fontSize="xs" color="gray.400">Tanggal</Text>
							<Text fontSize="sm" fontWeight="700" color="gray.800">
								{booking.tanggal}
							</Text>
						</VStack>
						<VStack align="start" spacing={0.5}>
							<Text fontSize="xs" color="gray.400">Waktu</Text>
							<Text fontSize="sm" fontWeight="700" color="gray.800">
								{booking.waktu}
							</Text>
						</VStack>
						<VStack align="start" spacing={0.5}>
							<Text fontSize="xs" color="gray.400">Total Pembayaran</Text>
							<Text fontSize="sm" fontWeight="700" color="#008FFF">
								{formatRupiah(booking.total)}
							</Text>
						</VStack>
					</Flex>

					<Button
						variant="ghost"
						size="sm"
						color="#008FFF"
						fontWeight="600"
						fontSize="sm"
						rightIcon={<Icon as={FaChevronRight} boxSize={3} />}
						px={2}
						_hover={{ bg: "blue.50" }}
						onClick={() => onLihatDetail(booking)}
						flexShrink={0}
					>
						Lihat Detail
					</Button>
				</Flex>
			</Box>
		</Box>
	)
}


const EmptyState = ({ filter }: { filter: string }) => (
	<Box
		bg="white"
		border="1px solid"
		borderColor="gray.200"
		borderRadius="xl"
		p={16}
		textAlign="center"
	>
		<Text fontSize="3xl" mb={3}>📋</Text>
		<Text fontWeight="700" color="gray.700" mb={1}>
			Belum ada riwayat pemesanan
		</Text>
		<Text fontSize="sm" color="gray.400">
			{filter === "semua"
				? "Kamu belum pernah memesan lapangan atau melakukan pendaftaran akun."
				: `Tidak ada pemesanan dengan status "${FILTER_TABS.find(t => t.key === filter)?.label}".`}
		</Text>
	</Box>
)


export default function RiwayatPemesananPage() {
	const router = useRouter()
	const [activeFilter, setActiveFilter] = useState<FilterKey>("semua")
	const [bookings, setBookings] = useState<BookingRecord[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null)
	const [selectedRutinGroup, setSelectedRutinGroup] = useState<RutinGroup | null>(null)
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"

	const { data: auth } = useSWRImmutable('auth', useAuth, {
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	})

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const response = await axios.get(`${baseUrl}/fasilitas/reservasi/history`, {
					withCredentials: true,
					headers: {
						Accept: 'application/json',
						'X-Requested-With': 'XMLHttpRequest'
					},
					withXSRFToken: true
				} as any)
				if (response.data.status === "success") {
					const raw = Array.isArray(response.data.data) ? response.data.data : []

					// Filter only the current user's reservations if auth is available
					const userRaw = raw.filter((r: any) => {
						if (auth?.status === 'authenticated') {
							const nameMatch = (r.nama_pemesan && r.nama_pemesan === auth.name) || (r.user?.name && r.user?.name === auth.name);
							const emailMatch = (r.email_pemesan && r.email_pemesan === auth.email) || (r.user?.email && r.user?.email === auth.email);
							return nameMatch || emailMatch;
						}
						// If auth is not yet loaded, we might not want to show anything, or we show all
						// Let's rely on the fact that if it's 401 it will error out. If 200 but no auth, just show all for now.
						return true;
					});

					const mapped: BookingRecord[] = userRaw.map((r: any) => {
						const facilityName = r.fasilitas?.nama || "-"
						const tanggal = String(r.tgl_reservasi || "")
						const dateLabel = tanggal
							? new Date(tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
							: "-"

						return {
							bookingCode: String(r.booking_code || ""),
							status: (r.status as BookingStatus) || "waiting_confirmation",
							facilityName,
							facilityImage: mapFacilityToImage(facilityName),
							tanggal,
							waktu: `${String(r.jam_mulai || "").slice(0, 5)} - ${String(r.jam_selesai || "").slice(0, 5)}`,
							total: Number(r.total_harga) || 0,
							sportType: mapFacilityToSport(facilityName),
							lapangan: r.lapangan?.nama || r.lapangan || facilityName,
							jenis: r.jenis_sewa,
							transactionNo: String(r.no_transaksi || ""),
							nama: String(r.nama_pemesan || r.user?.name || ""),
							noTelp: String(r.no_telp_pemesan || r.user?.phone || ""),
							dateLabel,
							rutinGroup: r.rutin_group ?? null,
							createdAt: r.created_at || new Date().toISOString(),
							expiresAt: r.expires_at || null,
						}
					})
					setBookings(mapped)
				}
			} catch (error: any) {
				console.error("Failed to fetch history:", error)
				// Redirect to login temporarily disabled for unauthenticated users
				// if (error.response?.status === 401) {
				// 	router.push("/login")
				// }
			} finally {
				setLoading(false)
			}
		}

		if (auth?.status === 'authenticated') {
			fetchHistory()
		} else if (auth?.status === 'unauthenticated') {
			setLoading(false)
		}
	}, [router, auth?.status, auth?.name, auth?.email, baseUrl])

	const filtered = activeFilter === "semua"
		? bookings
		: bookings.filter(b => getDisplayStatus(b) === activeFilter)

	const displayItems: (BookingRecord | RutinGroup)[] = (() => {
		const rutinMap = new Map<string, BookingRecord[]>()
		const usedCodes = new Set<string>()

		for (const b of filtered) {
			if (b.rutinGroup) {
				const existing = rutinMap.get(b.rutinGroup)
				if (existing) existing.push(b)
				else rutinMap.set(b.rutinGroup, [b])
				usedCodes.add(b.bookingCode)
			}
		}

		const ungrouped = filtered.filter(b => !usedCodes.has(b.bookingCode))
		const heuristicMap = new Map<string, BookingRecord[]>()
		for (const b of ungrouped) {
			const key = `${b.facilityName}|${b.lapangan}|${b.waktu}|${b.status}|${b.nama}`
			const arr = heuristicMap.get(key) ?? []
			arr.push(b)
			heuristicMap.set(key, arr)
		}


		const heuristicRutinGroups: BookingRecord[][] = []
		const heuristicSingles: BookingRecord[] = []

		for (const [, candidates] of Array.from(heuristicMap.entries())) {
			if (candidates.length < 2) {
				heuristicSingles.push(...candidates)
				continue
			}
			const sorted = [...candidates].sort((a, b) => a.tanggal.localeCompare(b.tanggal))
			const firstDate = new Date(sorted[0].tanggal)
			const firstMonth = firstDate.getMonth()
			const firstYear = firstDate.getFullYear()
			const allSameMonth = sorted.every(b => {
				const d = new Date(b.tanggal)
				return d.getMonth() === firstMonth && d.getFullYear() === firstYear
			})
			const all7DaysApart = sorted.every((b, i) => {
				if (i === 0) return true
				const prev = new Date(sorted[i - 1].tanggal)
				const curr = new Date(b.tanggal)
				const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
				return diffDays === 7
			})
			if (allSameMonth && all7DaysApart && sorted.length >= 2) {
				heuristicRutinGroups.push(sorted)
			} else {
				heuristicSingles.push(...candidates)
			}
		}

		const result: (BookingRecord | RutinGroup)[] = [...heuristicSingles]

		for (const [groupId, bks] of Array.from(rutinMap.entries())) {
			const sorted = [...bks].sort((a, b) => a.tanggal.localeCompare(b.tanggal))
			const first = sorted[0]
			result.push({
				kind: "rutin",
				rutinGroup: groupId,
				bookings: sorted,
				facilityName: first.facilityName,
				lapangan: first.lapangan,
				waktu: first.waktu,
				totalKeseluruhan: sorted.reduce((sum, b) => sum + b.total, 0),
				status: first.status,
				sportType: first.sportType,
				nama: first.nama,
				noTelp: first.noTelp,
				dateLabel: first.dateLabel,
				createdAt: first.createdAt,
				expiresAt: first.expiresAt,
			} satisfies RutinGroup)
		}

		for (const bks of heuristicRutinGroups) {
			const first = bks[0]
			result.push({
				kind: "rutin",
				rutinGroup: `heuristic-${first.bookingCode}`,
				bookings: bks,
				facilityName: first.facilityName,
				lapangan: first.lapangan,
				waktu: first.waktu,
				totalKeseluruhan: bks.reduce((sum, b) => sum + b.total, 0),
				status: first.status,
				sportType: first.sportType,
				nama: first.nama,
				noTelp: first.noTelp,
				dateLabel: first.dateLabel,
				createdAt: first.createdAt,
				expiresAt: first.expiresAt,
			} satisfies RutinGroup)
		}

		result.sort((a, b) => {
			const dateA = 'kind' in a && (a as RutinGroup).kind === 'rutin'
				? Math.max(...(a as RutinGroup).bookings.map(x => new Date(x.tanggal).getTime()))
				: new Date((a as BookingRecord).tanggal).getTime()
			const dateB = 'kind' in b && (b as RutinGroup).kind === 'rutin'
				? Math.max(...(b as RutinGroup).bookings.map(x => new Date(x.tanggal).getTime()))
				: new Date((b as BookingRecord).tanggal).getTime()
			return dateB - dateA
		})

		return result
	})()

	const handleLihatDetail = (b: BookingRecord) => {
		setSelectedBooking(b)
	}

	const handleLihatRutinDetail = (g: RutinGroup) => {
		setSelectedRutinGroup(g)
	}

	if (loading) {
		return (
			<Center h="100vh" bg="gray.50">
				<VStack spacing={4}>
					<Spinner size="xl" color="#008FFF" thickness="4px" />
					<Text color="gray.500" fontWeight="500">Memuat riwayat pemesanan...</Text>
				</VStack>
			</Center>
		)
	}

	return (
		<Box bg="gray.50" display="flex" flexDirection="column">
			<FasorNavbar />

			<Box as="main" minH="100vh" flex={1} maxW="900px" mx="auto" w="full" px={{ base: 4, md: 8 }} py={8}>
				<Text fontSize="2xl" fontWeight="800" color="gray.800" mb={0.5}>
					Riwayat Pemesanan
				</Text>
				<Text fontSize="sm" color="gray.500" mb={6}>
					Lihat semua riwayat reservasi lapangan kamu
				</Text>

				<Box
					overflowX="auto"
					mb={6}
					sx={{ "::-webkit-scrollbar": { display: "none" } }}
				>
					<HStack
						spacing={1}
						bg="gray.100"
						borderRadius="full"
						p={1.5}
						w="fit-content"
						minW="fit-content"
					>
						{FILTER_TABS.map(tab => {
							const isActive = activeFilter === tab.key
							return (
								<Button
									key={tab.key}
									size="sm"
									borderRadius="full"
									fontWeight={isActive ? "700" : "500"}
									fontSize="sm"
									bg={isActive ? "white" : "transparent"}
									color={isActive ? "#008FFF" : "gray.500"}
									boxShadow={isActive ? "sm" : "none"}
									_hover={isActive ? {} : { bg: "blackAlpha.50", color: "gray.700" }}
									px={5}
									h="36px"
									flexShrink={0}
									onClick={() => setActiveFilter(tab.key)}
									transition="all 0.2s"
								>
									{tab.label}
								</Button>
							)
						})}
					</HStack>
				</Box>

				<VStack spacing={4} align="stretch">
					{displayItems.length === 0 ? (
						<EmptyState filter={activeFilter} />
					) : (
						displayItems.map(item => {
							if ('kind' in item && item.kind === "rutin") {
								return <RutinGroupCard key={(item as RutinGroup).rutinGroup} group={item as RutinGroup} onLihatRutinDetail={handleLihatRutinDetail} />
							}
							const b = item as BookingRecord
							return <BookingCard key={b.bookingCode} booking={b} onLihatDetail={handleLihatDetail} />
						})
					)}
				</VStack>
			</Box>

			<BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
			<RutinGroupDetailModal group={selectedRutinGroup} onClose={() => setSelectedRutinGroup(null)} />
			<FasorFooter />
		</Box>
	)
}
