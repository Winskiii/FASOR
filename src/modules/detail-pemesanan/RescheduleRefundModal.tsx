import { useState, useRef, useEffect } from "react"
import axios from "axios"
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
	Box,
	Flex,
	VStack,
	HStack,
	Text,
	Button,
	Grid,
	Icon,
	Textarea,
	Divider,
	Select,
	Checkbox,
	useToast,
} from "@chakra-ui/react"
import Image from "next/image"
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaUpload, FaExchangeAlt, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa"
import { validateFile } from "@/utils/fileValidator"


const DAY_HEADERS = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"]
const MONTH_NAMES = [
	"Januari", "Februari", "Maret", "April", "Mei", "Juni",
	"Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const ALL_TIME_SLOTS: string[] = []
for (let h = 6; h <= 23; h++) {
	const start = `${String(h).padStart(2, "0")}:00`
	const end = h === 23 ? "00:00" : `${String(h + 1).padStart(2, "0")}:00`
	ALL_TIME_SLOTS.push(`${start} - ${end}`)
}

const UNAVAILABLE_SLOTS: string[] = []

const ALASAN_RESCHEDULE = [
	"Kesibukan",
	"Kondisi Cuaca (Lapangan Outdoor)",
	"Lainnya",
]

const ALASAN_REFUND = [
	"Kesibukan",
	"Kondisi Cuaca (Lapangan Outdoor)",
	"Lainnya",
]

const BANK_OPTIONS = ["BNI", "BCA", "BRI", "Mandiri", "BSI", "CIMB Niaga", "Lainnya"]


export interface RescheduleSubmitData {
	newDate: Date
	newSlot: string
	alasan: string
	file: File | null
	otherText: string
}


const formatRupiah = (n: number) => "Rp" + n.toLocaleString("id-ID")

function getDaysInMonth(year: number, month: number) {
	return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
	return new Date(year, month, 1).getDay()
}


interface CalendarProps {
	selectedDate: Date | null
	onSelect: (d: Date) => void
}

const Calendar = ({ selectedDate, onSelect }: CalendarProps) => {
	const today = new Date()
	const [viewYear, setViewYear] = useState(today.getFullYear())
	const [viewMonth, setViewMonth] = useState(today.getMonth())

	const daysInMonth = getDaysInMonth(viewYear, viewMonth)
	const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
	const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

	const prevMonth = () => {
		if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
		else setViewMonth(m => m - 1)
	}
	const nextMonth = () => {
		if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
		else setViewMonth(m => m + 1)
	}

	const isToday = (d: number) =>
		d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()

	const isSelected = (d: number) =>
		selectedDate !== null &&
		d === selectedDate.getDate() &&
		viewMonth === selectedDate.getMonth() &&
		viewYear === selectedDate.getFullYear()

	const isPast = (d: number) => {
		const cell = new Date(viewYear, viewMonth, d)
		const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
		return cell < todayStart
	}

	return (
		<Box
			border="1px solid"
			borderColor="gray.200"
			borderRadius="lg"
			overflow="hidden"
			bg="white"
			boxShadow="md"
			w="full"
		>
			<HStack justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
				<Button variant="ghost" size="xs" onClick={prevMonth} p={1}>
					<Icon as={FaChevronLeft} boxSize={3} color="gray.500" />
				</Button>
				<Text fontWeight="700" fontSize="sm" color="gray.700">
					{MONTH_NAMES[viewMonth]} {viewYear}
				</Text>
				<Button variant="ghost" size="xs" onClick={nextMonth} p={1}>
					<Icon as={FaChevronRight} boxSize={3} color="gray.500" />
				</Button>
			</HStack>

			<Grid templateColumns="repeat(7, 1fr)" px={2} pt={2}>
				{DAY_HEADERS.map(d => (
					<Box key={d} textAlign="center" py={1}>
						<Text fontSize="10px" fontWeight="700" color="gray.400">{d}</Text>
					</Box>
				))}
			</Grid>

			<Grid templateColumns="repeat(7, 1fr)" px={2} pb={3} gap={0.5}>
				{Array.from({ length: totalCells }).map((_, i) => {
					const day = i - firstDay + 1
					const valid = day >= 1 && day <= daysInMonth
					if (!valid) return <Box key={i} />
					const past = isPast(day)
					const sel = isSelected(day)
					const tod = isToday(day)
					return (
						<Box
							key={i}
							textAlign="center"
							py={1}
							cursor={past ? "not-allowed" : "pointer"}
							borderRadius="md"
							bg={sel ? "#008FFF" : "transparent"}
							_hover={past ? {} : { bg: sel ? "#0070CC" : "gray.100" }}
							onClick={() => {
								if (!past) onSelect(new Date(viewYear, viewMonth, day))
							}}
						>
							<Text
								fontSize="xs"
								fontWeight={tod || sel ? "700" : "400"}
								color={sel ? "white" : past ? "gray.300" : tod ? "#008FFF" : "gray.700"}
							>
								{day}
							</Text>
						</Box>
					)
				})}
			</Grid>
		</Box>
	)
}


interface FileUploadProps {
	file: File | null
	onFile: (f: File | null) => void
}

const FileUploadArea = ({ file, onFile }: FileUploadProps) => {
	const toast = useToast()
	const [dragging, setDragging] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const handleFile = (f: File | null) => {
		if (!f) {
			onFile(null)
			return
		}
		const validation = validateFile(f)
		if (!validation.isValid) {
			toast({
				title: "Upload Gagal",
				description: validation.errorMsg,
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top",
			})
			if (inputRef.current) inputRef.current.value = ""
			return
		}
		onFile(f)
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setDragging(false)
		const f = e.dataTransfer.files?.[0]
		if (f) handleFile(f)
	}

	return (
		<Box
			border="2px dashed"
			borderColor={dragging ? "#008FFF" : "gray.300"}
			borderRadius="lg"
			p={4}
			textAlign="center"
			cursor="pointer"
			bg={dragging ? "blue.50" : "gray.50"}
			transition="all 0.2s"
			onDragOver={e => { e.preventDefault(); setDragging(true) }}
			onDragLeave={() => setDragging(false)}
			onDrop={handleDrop}
			onClick={() => inputRef.current?.click()}
		>
			<input
				ref={inputRef}
				type="file"
				accept="image/*,.pdf"
				style={{ display: "none" }}
				onChange={e => handleFile(e.target.files?.[0] ?? null)}
			/>
			<Icon as={FaUpload} color="gray.400" boxSize={5} mb={2} />
			{file ? (
				<Text fontSize="xs" color="green.600" fontWeight="600">{file.name}</Text>
			) : (
				<>
					<Text fontSize="xs" color="gray.500" fontWeight="600">
						Klik untuk upload atau seret &amp; lepas file di sini
					</Text>
					<Text fontSize="10px" color="gray.400" mt={0.5}>
						Ekstensi maks. JPG, PNG, PDF · Ukuran maks. 5 MB
					</Text>
				</>
			)}
		</Box>
	)
}


const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<VStack align="start" spacing={0}>
		<Text fontSize="xs" color="gray.400">{label}</Text>
		<Text fontSize="sm" fontWeight="700" color="gray.800">{value}</Text>
	</VStack>
)


const timeToMinutes = (t: string, isEnd = false) => {
	const [h, m] = t.split(":").map(Number)
	if (h === 0 && m === 0 && isEnd) return 24 * 60
	return h * 60 + m
}

const getSlotsForFacility = (facilityName: string): string[] => {
	const name = facilityName.toLowerCase();
	
	if (name.includes("tennis") || name.includes("tenis")) {
		return ["06:00 - 09:00", "09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"];
	}
	if (name.includes("stadion") || name.includes("sepak bola")) {
		return ["06:00 - 08:00", "08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00", "22:00 - 00:00"];
	}
	if (name.includes("mini soccer")) {
		return ["07:00 - 09:00", "09:00 - 11:00", "11:00 - 13:00", "13:00 - 15:00", "15:00 - 17:00", "17:00 - 19:00", "19:00 - 21:00", "21:00 - 23:00"];
	}
	if (name.includes("voli")) {
		return ["07:00 - 09:00", "09:00 - 11:00", "11:00 - 13:00", "13:00 - 15:00", "15:00 - 17:00"];
	}
	if (name.includes("basket flexy") || name.includes("basket semi indoor") || name.includes("basket")) {
		return ["06:00 - 08:00", "08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"];
	}
	if (name.includes("gor futsal") || name.includes("futsal pln") || name.includes("futsal")) {
		const slots = [];
		for (let h = 6; h <= 21; h++) {
			const start = `${String(h).padStart(2, "0")}:00`;
			const end = `${String(h + 1).padStart(2, "0")}:00`;
			slots.push(`${start} - ${end}`);
		}
		return slots;
	}
	if (name.includes("bulutangkis") || name.includes("badminton")) {
		const slots = [];
		for (let h = 6; h <= 23; h++) {
			const start = `${String(h).padStart(2, "0")}:00`;
			const end = h === 23 ? "00:00" : `${String(h + 1).padStart(2, "0")}:00`;
			slots.push(`${start} - ${end}`);
		}
		return slots;
	}
	
	// Fallback to 1-hour slots from 06:00 to 00:00
	const slots: string[] = []
	for (let h = 6; h <= 23; h++) {
		const start = `${String(h).padStart(2, "0")}:00`
		const end = h === 23 ? "00:00" : `${String(h + 1).padStart(2, "0")}:00`
		slots.push(`${start} - ${end}`)
	}
	return slots;
}

const getSessionCountForBooking = (facilityName: string, waktu: string): number => {
	const facilitySlots = getSlotsForFacility(facilityName);
	const parts = waktu.split(" - ");
	if (parts.length !== 2) return 1;
	const startStr = parts[0].substring(0, 5);
	const endStr = parts[1].substring(0, 5);
	
	const startTime = timeToMinutes(startStr);
	const endTime = timeToMinutes(endStr, true);
	
	let count = 0;
	facilitySlots.forEach(slot => {
		const [slotStartRaw, slotEndRaw] = slot.split(" - ");
		const slotStart = timeToMinutes(slotStartRaw);
		const slotEnd = timeToMinutes(slotEndRaw, true);
		
		if (slotStart >= startTime && slotEnd <= endTime) {
			count++;
		}
	});
	return count > 0 ? count : 1;
}

const combineSlots = (slots: string[]): string => {
	if (slots.length === 0) return "";
	const parsed = slots.map(s => {
		const [start, end] = s.split(" - ");
		return { start, end, startMin: timeToMinutes(start), endMin: timeToMinutes(end, true) };
	});
	parsed.sort((a, b) => a.startMin - b.startMin);
	const minStart = parsed[0].start;
	const maxEnd = parsed[parsed.length - 1].end;
	return `${minStart} - ${maxEnd}`;
}

interface RescheduleTabProps {
	idFasilitas: string
	facilityName: string
	lapangan: string
	waktu: string
	onSubmit: (data: RescheduleSubmitData) => void
}

const RescheduleTab = ({ idFasilitas, facilityName, lapangan, waktu, onSubmit }: RescheduleTabProps) => {
	const [showCal, setShowCal] = useState(false)
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [selectedSlots, setSelectedSlots] = useState<string[]>([])
	const [alasan, setAlasan] = useState("")
	const [file, setFile] = useState<File | null>(null)
	const [otherText, setOtherText] = useState("")
	const [bookedSlots, setBookedSlots] = useState<string[]>([])
	const [loadingSlots, setLoadingSlots] = useState(false)

	const facilitySlots = getSlotsForFacility(facilityName);
	const sessionCount = getSessionCountForBooking(facilityName, waktu);

	useEffect(() => {
		if (!selectedDate || !idFasilitas) return

		const fetchBookedSlots = async () => {
			try {
				setLoadingSlots(true)
				const yyyy = selectedDate.getFullYear()
				const mm = String(selectedDate.getMonth() + 1).padStart(2, "0")
				const dd = String(selectedDate.getDate()).padStart(2, "0")
				const dateStr = `${yyyy}-${mm}-${dd}`

				const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"
				const response = await axios.get(`${baseUrl}/fasilitas/${idFasilitas}?date=${dateStr}`, {
					withCredentials: true,
				})

				if (response.data.status === "success") {
					const bookings = response.data.data.bookings || []
					const booked = bookings.map((b: any) => {
						const start = b.jam_mulai.substring(0, 5)
						const end = b.jam_selesai.substring(0, 5)
						return `${start} - ${end}`
					})
					setBookedSlots(booked)
				}
			} catch (error) {
				console.error("Failed to fetch booked slots:", error)
			} finally {
				setLoadingSlots(false)
			}
		}

		fetchBookedSlots()
	}, [selectedDate, idFasilitas])

	const formatDate = (d: Date) =>
		`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`

	const handleSelectDate = (d: Date) => {
		setSelectedDate(d)
		setSelectedSlots([])
		setShowCal(false)
	}

	const handleSelectSlot = (slot: string) => {
		setSelectedSlots(prev => {
			if (prev.includes(slot)) {
				return prev.filter(s => s !== slot);
			}
			if (prev.length >= sessionCount) {
				return [...prev.slice(1), slot];
			}
			return [...prev, slot];
		});
	}

	const isValid =
		selectedDate !== null &&
		selectedSlots.length === sessionCount &&
		alasan !== "" &&
		(alasan !== "Kondisi Cuaca (Lapangan Outdoor)" || file !== null) &&
		(alasan !== "Lainnya" || otherText.trim() !== "")

	return (
		<VStack spacing={4} align="stretch">
			<Box>
				<Text fontSize="sm" fontWeight="600" color="gray.700" mb={1.5}>
					Pilih Tanggal Baru
				</Text>
				<Box position="relative">
					<Box
						border="1px solid"
						borderColor={showCal ? "#008FFF" : "gray.300"}
						borderRadius="md"
						px={3}
						py={2.5}
						cursor="pointer"
						bg="white"
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						onClick={() => setShowCal(v => !v)}
						boxShadow={showCal ? "0 0 0 1px #008FFF" : "none"}
						transition="all 0.2s"
					>
						<Text fontSize="sm" color={selectedDate ? "gray.800" : "gray.400"}>
							{selectedDate ? formatDate(selectedDate) : "dd/mm/yyyy"}
						</Text>
						<Icon as={FaCalendarAlt} color="gray.400" boxSize={3.5} />
					</Box>
					{showCal && (
						<Box position="absolute" top="calc(100% + 4px)" left={0} right={0} zIndex={10}>
							<Calendar selectedDate={selectedDate} onSelect={handleSelectDate} />
						</Box>
					)}
				</Box>
			</Box>

			{selectedDate && (
				<Box>
					<Text fontSize="sm" fontWeight="600" color="gray.700" mb={1.5}>
						Pilih Sesi{" "}
						<Text as="span" color="gray.400" fontWeight="400">
							{lapangan} {loadingSlots && "(Memuat ketersediaan...)"}
						</Text>
					</Text>
					{sessionCount > 1 && (
						<Text fontSize="xs" color="blue.600" fontWeight="600" mb={2}>
							* Silakan pilih tepat {sessionCount} sesi (saat ini terpilih {selectedSlots.length} sesi)
						</Text>
					)}
					<Grid templateColumns="repeat(3, 1fr)" gap={2}>
						{facilitySlots.map(slot => {
							const unavailable = bookedSlots.includes(slot)
							const isSelected = selectedSlots.includes(slot)
							
							const parts = waktu.split(" - ");
							let isCurrent = false;
							if (parts.length === 2) {
								const startStr = parts[0].substring(0, 5);
								const endStr = parts[1].substring(0, 5);
								const startTime = timeToMinutes(startStr);
								const endTime = timeToMinutes(endStr, true);
								const [slotStartRaw, slotEndRaw] = slot.split(" - ");
								const slotStart = timeToMinutes(slotStartRaw);
								const slotEnd = timeToMinutes(slotEndRaw, true);
								isCurrent = slotStart >= startTime && slotEnd <= endTime && !isSelected;
							}
							return (
								<Box
									key={slot}
									border="1.5px solid"
									borderColor={
										unavailable
											? "gray.100"
											: isSelected
											? "#008FFF"
											: isCurrent
											? "orange.300"
											: "gray.200"
									}
									borderRadius="md"
									py={2}
									px={1}
									textAlign="center"
									cursor={unavailable ? "not-allowed" : "pointer"}
									bg={
										unavailable
											? "gray.50"
											: isSelected
											? "#008FFF"
											: isCurrent
											? "orange.50"
											: "white"
									}
									_hover={unavailable ? {} : { bg: isSelected ? "#0070CC" : "blue.50" }}
									onClick={() => {
										if (!unavailable) handleSelectSlot(slot)
									}}
								>
									<Text
										fontSize="xs"
										fontWeight={isSelected || isCurrent ? "700" : "400"}
										color={
											unavailable
												? "gray.300"
												: isSelected
												? "white"
												: isCurrent
												? "orange.500"
												: "gray.700"
										}
									>
										{slot}
									</Text>
									{isCurrent && (
										<Text fontSize="8px" color="orange.400" fontWeight="600" mt={0.5}>
											saat ini
										</Text>
									)}
								</Box>
							)
						})}
					</Grid>
				</Box>
			)}

			<Box>
				<Text fontSize="sm" fontWeight="600" color="gray.700" mb={1.5}>
					Alasan Reschedule
				</Text>
				<Box position="relative">
					<Select
						placeholder="Pilih Alasan"
						fontSize="sm"
						color={alasan ? "gray.800" : "gray.400"}
						borderColor="gray.300"
						bg="white"
						_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
						value={alasan}
						onChange={e => { setAlasan(e.target.value); setFile(null); setOtherText("") }}
					>
						{ALASAN_RESCHEDULE.map(a => (
							<option key={a} value={a}>{a}</option>
						))}
					</Select>
				</Box>
			</Box>

			{alasan === "Kondisi Cuaca (Lapangan Outdoor)" && (
				<FileUploadArea file={file} onFile={setFile} />
			)}

			{alasan === "Lainnya" && (
				<Textarea
					placeholder="Jelaskan Alasan Kamu"
					fontSize="sm"
					bg="white"
					color="gray.800"
					borderColor="gray.300"
					rows={3}
					resize="none"
					_placeholder={{ color: "gray.400" }}
					_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
					value={otherText}
					onChange={e => setOtherText(e.target.value)}
				/>
			)}

			<Button
				bg={isValid ? "#008FFF" : "gray.300"}
				color="white"
				borderRadius="lg"
				fontWeight="700"
				size="md"
				fontSize="sm"
				w="full"
				isDisabled={!isValid}
				_hover={isValid ? { bg: "#0070CC" } : {}}
				onClick={() => {
					if (isValid && selectedDate && selectedSlots.length === sessionCount) {
						onSubmit({ newDate: selectedDate, newSlot: combineSlots(selectedSlots), alasan, file, otherText })
					}
				}}
			>
				Kirim Pengajuan Reschedule
			</Button>
			<Text fontSize="xs" color="gray.400" textAlign="center">
				Pengajuan akan diverifikasi admin sebelum dikonfirmasi
			</Text>
		</VStack>
	)
}


export interface RescheduleRefundModalProps {
	isOpen: boolean
	onClose: () => void
	onRescheduleSubmit: (data: RescheduleSubmitData) => void
	idFasilitas: string
	facility: string
	image: string
	lapangan: string
	tanggal: string
	waktu: string
	noTransaksi: string
	nama: string
	noTelp: string
	total: number
	tipeUser?: string
}

const RescheduleRefundModal = ({
	isOpen,
	onClose,
	onRescheduleSubmit,
	idFasilitas,
	facility,
	image,
	lapangan,
	tanggal,
	waktu,
	noTransaksi,
	nama,
	noTelp,
	total,
	tipeUser,
}: RescheduleRefundModalProps) => {

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside" isCentered>
			<ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
			<ModalContent borderRadius="2xl" overflow="hidden" mx={4}>
				<ModalCloseButton zIndex={10} top={3} right={3} />
				<ModalBody p={0}>
					<Flex direction={{ base: "column", md: "row" }} minH="0">
						<Box
							w={{ base: "full", md: "340px" }}
							flexShrink={0}
							borderRight={{ md: "1px solid" }}
							borderColor={{ md: "gray.100" }}
						>
							{image ? (
								<Box position="relative" h="200px">
									<Image
										src={image}
										alt={facility}
										fill
										style={{ objectFit: "cover" }}
									/>
								</Box>
							) : (
								<Box h="200px" bg="gray.100" />
							)}

							<Box p={5}>
								<Text fontSize="lg" fontWeight="800" color="gray.800" mb={4}>
									{facility}
								</Text>
								<VStack spacing={2.5} align="stretch">
									<InfoRow label="Lapangan" value={lapangan} />
									<InfoRow label="Tanggal" value={tanggal} />
									<InfoRow label="Waktu" value={waktu} />
									<InfoRow label="Tipe Pengguna" value={tipeUser === "internal" ? "Internal" : tipeUser === "eksternal" ? "Eksternal" : tipeUser === "guest" ? "Guest" : "-"} />
									<InfoRow label="Nomor Transaksi" value={noTransaksi} />
									<InfoRow label="Pemesan" value={nama} />
									<InfoRow label="Nomor HP" value={noTelp} />
								</VStack>

								<Divider borderColor="gray.100" my={4} />

								<HStack justify="space-between">
									<Text fontSize="sm" fontWeight="700" color="gray.700">
										Total Pembayaran
									</Text>
									<Text fontSize="md" fontWeight="800" color="#008FFF">
										{formatRupiah(total)}
									</Text>
								</HStack>
							</Box>
						</Box>

						<Box flex={1} p={6} overflowY="auto" maxH={{ md: "85vh" }}>
							<RescheduleTab
								idFasilitas={idFasilitas}
								facilityName={facility}
								lapangan={lapangan}
								waktu={waktu}
								onSubmit={onRescheduleSubmit}
							/>
						</Box>
					</Flex>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}

export default RescheduleRefundModal
