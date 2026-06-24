import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import {
	Box,
	Flex,
	Text,
	Button,
	Grid,
	VStack,
	HStack,
	Icon,
	Divider,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalHeader,
	ModalCloseButton,
	ModalFooter,
	IconButton,
	Spinner,
	useToast,
} from "@chakra-ui/react"
import Image from "next/image"
import {
	FaChevronLeft,
	FaChevronRight,
	FaCalendarAlt,
	FaMapMarkerAlt,
	FaClock,
	FaTimes,
	FaWhatsapp,
} from "react-icons/fa"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import FasorFooter from "@/components/organisms/FasorFooter"


const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const DAY_FULL: Record<string, string> = {
	Min: "Minggu", Sen: "Senin", Sel: "Selasa",
	Rab: "Rabu", Kam: "Kamis", Jum: "Jumat", Sab: "Sabtu",
}
const MONTH_SHORT = [
	"Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
	"Jul", "Agu", "Sep", "Okt", "Nov", "Des",
]

export type SlotStatus = "booked" | "kosong" | "event"

export interface VenueSlot {
	time: string
	price: number
	statuses: SlotStatus[]
	eventName?: string
}

export interface VenueConfig {
	name: string
	sport: string
	description: string
	rules: string[]
	images: { main: string; img2: string; img3: string }
	startingPrice: string
	priceUnit: string
	courts: string[]
	slots: VenueSlot[]
	rutinSlots?: VenueSlot[]
}

type SelectedSlots = Set<string>


const getWeekDates = (weekOffset: number) => {
	const base = new Date()
	base.setDate(base.getDate() + weekOffset * 7)
	const dates = []
	for (let i = -3; i <= 4; i++) {
		const d = new Date(base)
		d.setDate(base.getDate() + i)
		dates.push({
			dayName: DAY_SHORT[d.getDay()],
			date: d.getDate(),
			month: MONTH_SHORT[d.getMonth()],
			full: d,
		})
	}
	return dates
}

const formatRupiah = (n: number) =>
	"Rp" + n.toLocaleString("id-ID").replace(/\./g, ".")

const toHHMM = (t: string) => t.trim().slice(0, 5)
const timeToMinutes = (t: string, isEnd = false) => {
	const cleaned = t.trim().replace(/\./g, ":")
	const [h, m] = toHHMM(cleaned).split(":")
	if (Number(h) === 0 && (Number(m) || 0) === 0 && isEnd) return 24 * 60
	return Number(h) * 60 + (Number(m) || 0)
}

const slotOverlaps = (slotTime: string, booking: { jam_mulai: string; jam_selesai: string }) => {
	const [slotStartRaw, slotEndRaw] = slotTime.split(" - ")
	const slotStart = timeToMinutes(slotStartRaw)
	const slotEnd = timeToMinutes(slotEndRaw, true)
	const bStart = timeToMinutes(booking.jam_mulai)
	const bEnd = timeToMinutes(booking.jam_selesai, true)
	return slotStart < bEnd && slotEnd > bStart
}

const getRutinDates = (base: Date): Date[] => {
	const dates: Date[] = []
	const month = base.getMonth()
	let current = new Date(base)
	while (current.getMonth() === month) {
		dates.push(new Date(current))
		current.setDate(current.getDate() + 7)
	}
	return dates
}

const getRoutinePrice = (sport: string, timeStart: string, userType: string, localTarifs?: any[], tarifs?: any[], facilityName?: string): number | null => {
	// 1. Try matching with localTarifs from localStorage
	if (localTarifs && localTarifs.length > 0) {
		const startMinutes = timeToMinutes(timeStart);
		const searchUserType = userType === "internal" ? "internal" : "umum";
		const matchingLocal = localTarifs.find(t => {
			if (!t.aktif) return false;
			if (facilityName && (t.fasilitas || "").toLowerCase() !== facilityName.toLowerCase()) return false;
			if (!(t.kegiatan || "").toLowerCase().includes("rutin")) return false;
			if ((t.jenis_pengguna || "").toLowerCase() !== searchUserType) return false;
			const [tJamStart, tJamEnd] = t.waktu.split("–").length === 2 ? t.waktu.split("–") : t.waktu.split("-");
			if (!tJamStart || !tJamEnd) return false;
			const tStart = timeToMinutes(tJamStart.trim());
			const tEnd = timeToMinutes(tJamEnd.trim(), true);
			return startMinutes >= tStart && startMinutes < tEnd;
		});
		if (matchingLocal) {
			return Number(matchingLocal.harga);
		}
	}

	// 2. Try matching with database-fetched API tarifs
	if (tarifs && tarifs.length > 0) {
		const startMinutes = timeToMinutes(timeStart);
		const matchingApi = tarifs.find(t => {
			if (!(t.label || "").toLowerCase().includes("rutin")) return false;
			const [tJamStart, tJamEnd] = t.jam.split(" - ").length === 2 ? t.jam.split(" - ") : t.jam.split("-");
			if (!tJamStart || !tJamEnd) return false;
			const tStart = timeToMinutes(tJamStart.trim());
			const tEnd = timeToMinutes(tJamEnd.trim(), true);
			return startMinutes >= tStart && startMinutes < tEnd;
		});
		if (matchingApi) {
			return Number(matchingApi.harga);
		}
	}

	// 3. Fallback to corrected hardcoded routine rates
    const startHour = parseInt(timeStart.split(":")[0], 10)
	const isInternal = userType === "internal"
    if (sport.toLowerCase().includes("bulutangkis") || sport.toLowerCase().includes("badminton")) {
        if (startHour >= 6 && startHour < 14) return isInternal ? 500000 : 750000;
        if (startHour >= 14 && startHour < 17) return isInternal ? 450000 : 600000;
        if (startHour >= 17) return isInternal ? 600000 : 850000;
    } else if (sport.toLowerCase().includes("tenis") || sport.toLowerCase().includes("tennis")) {
        if (startHour >= 6 && startHour < 15) return isInternal ? 205000 : 450000;
        if (startHour >= 15 && startHour < 18) return isInternal ? 220000 : 500000;
        if (startHour >= 18) return isInternal ? 240000 : 500000;
    }
    return null;
}

const getDynamicPrice = (
	slotTime: string,
	dayName: string,
	tarifs: any[],
	defaultPrice: number,
	localTarifs?: any[],
	bookingMode?: string,
	userType?: string,
	facilityName?: string
) => {
	// 1. Try matching with localTarifs from localStorage (if configured)
	if (localTarifs && localTarifs.length > 0 && bookingMode && userType) {
		const searchUserType = userType === "internal" ? "internal" : "umum";
		const [slotStartRaw] = slotTime.split(" - ")
		const slotStart = timeToMinutes(slotStartRaw)

		const matchingLocal = localTarifs.find(t => {
			if (!t.aktif) return false;
			if (facilityName && (t.fasilitas || "").toLowerCase() !== facilityName.toLowerCase()) return false;
			// Match booking mode (kegiatan)
			const kegiatanLower = (t.kegiatan || "").toLowerCase();
			if (bookingMode === "rutin") {
				if (!kegiatanLower.includes("rutin")) return false;
			} else {
				if (!kegiatanLower.includes("insidentil") && !kegiatanLower.includes("latihan")) return false;
			}
			// Match user type
			const tUserType = (t.jenis_pengguna || "").toLowerCase();
			if (tUserType !== searchUserType) return false;
			// Match time range
			const [tJamStart, tJamEnd] = t.waktu.split("–").length === 2 ? t.waktu.split("–") : t.waktu.split("-");
			if (!tJamStart || !tJamEnd) return false;
			const tStart = timeToMinutes(tJamStart.trim());
			const tEnd = timeToMinutes(tJamEnd.trim(), true);
			return slotStart >= tStart && slotStart < tEnd;
		});

		if (matchingLocal) {
			return Number(matchingLocal.harga);
		}
	}

	// 2. Fallback to API tarifs
	if (!tarifs || tarifs.length === 0) return defaultPrice
	const isWeekend = dayName === "Sab" || dayName === "Min"
	const [slotStartRaw] = slotTime.split(" - ")
	const slotStart = timeToMinutes(slotStartRaw)

	let basePrice: number | null = null;
	let weekendPrice: number | null = null;

	const filteredTarifs = tarifs.filter((t) => {
		const labelLower = (t.label || "").toLowerCase();
		if (bookingMode === "rutin") {
			return labelLower.includes("rutin");
		} else {
			return labelLower.includes("insidentil") || labelLower.includes("latihan");
		}
	});

	const activeTarifsForMatch = filteredTarifs.length > 0 ? filteredTarifs : tarifs;

	for (const t of activeTarifsForMatch) {
		const [tJamStart, tJamEnd] = t.jam.split(" - ")
		const tStart = timeToMinutes(tJamStart)
		const tEnd = timeToMinutes(tJamEnd, true)
		
		if (slotStart >= tStart && slotStart < tEnd) {
			const h = t.hari.toLowerCase()
			if (h === "weekend" || h === "sabtu-minggu") {
				weekendPrice = Number(t.harga);
			} else if (h === "normal" || h === "semua" || h === "senin-minggu" || h === "senin-jumat") {
				basePrice = Number(t.harga);
			}
		}
	}

	if (isWeekend && weekendPrice !== null) {
		return weekendPrice;
	}
	if (basePrice !== null) {
		return basePrice;
	}
	
	return defaultPrice
}


const VenueHeader = ({ config, lowestPrice }: { config: VenueConfig, lowestPrice?: number | null }) => {
	const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

	const imgBox = (src: string, alt: string, h: string) => (
		<Box
			position="relative"
			h={h}
			borderRadius="xl"
			overflow="hidden"
			cursor="pointer"
			onClick={() => setLightboxSrc(src)}
			sx={{ "& img": { transition: "transform 0.3s ease" }, "&:hover img": { transform: "scale(1.04)" } }}
		>
			<Image src={src} alt={alt} fill style={{ objectFit: "cover" }} />
		</Box>
	)

	return (
		<>
			<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} pt={8} pb={0}>
				<Text fontSize="3xl" fontWeight="800" color="gray.800" mb={1}>
					{config.name}
				</Text>
				<HStack spacing={2} mb={6}>
					<Box w={2} h={2} borderRadius="full" bg="#008FFF" />
					<Text fontSize="sm" color="gray.500">{config.sport}</Text>
				</HStack>

				<Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4} alignItems="start">
					<VStack spacing={4} align="stretch">
						{imgBox(config.images.main, config.name, "310px")}

						<Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={6} bg="white" boxShadow="sm">
							<Text fontWeight="700" fontSize="lg" color="gray.800" mb={3}>
								Tentang {config.name}
							</Text>
							<Text fontSize="sm" color="gray.600" lineHeight="1.8" mb={6}>
								{config.description}
							</Text>

							<Text fontWeight="700" fontSize="lg" color="gray.800" mb={3}>
								Ketentuan {config.name}
							</Text>
							<VStack align="start" spacing={3}>
								{config.rules.map((rule, i) => (
									<Text key={i} fontSize="sm" color="gray.600" lineHeight="1.8">
										{i + 1}. {rule}
									</Text>
								))}
							</VStack>
						</Box>
					</VStack>

					<VStack spacing={4} align="stretch">
						{imgBox(config.images.img2, `${config.name} 2`, "148px")}
						{imgBox(config.images.img3, `${config.name} 3`, "148px")}

						<Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={5} bg="white" boxShadow="sm">
							<Text fontSize="sm" color="gray.500" mb={1}>Mulai dari</Text>
							<HStack align="baseline" spacing={1} mb={4}>
								<Text fontSize="2xl" fontWeight="800" color="gray.800">
									{lowestPrice ? formatRupiah(lowestPrice) : config.startingPrice}
								</Text>
								<Text fontSize="sm" color="gray.500">{config.priceUnit}</Text>
							</HStack>
							<Button
								w="full"
								bg="#008FFF"
								color="white"
								fontWeight="600"
								borderRadius="lg"
								_hover={{ bg: "#0070CC" }}
								onClick={() => document.getElementById("jadwal")?.scrollIntoView({ behavior: "smooth" })}
							>
								Cek Jadwal
							</Button>
						</Box>
					</VStack>
				</Grid>
			</Box>

			{lightboxSrc && (
				<Modal isOpen onClose={() => setLightboxSrc(null)} size="5xl">
					<ModalOverlay bg="blackAlpha.800" backdropFilter="blur(4px)" />
					<ModalContent bg="transparent" boxShadow="none" mx={4} my="auto">
						<ModalBody p={0} position="relative">
							<IconButton
								aria-label="Tutup"
								icon={<Icon as={FaTimes} />}
								position="absolute"
								top="-40px"
								right={0}
								size="sm"
								variant="ghost"
								color="white"
								fontSize="lg"
								_hover={{ bg: "whiteAlpha.300" }}
								onClick={() => setLightboxSrc(null)}
								zIndex={1}
							/>
							<Box borderRadius="xl" overflow="hidden">
								<Image
									src={lightboxSrc}
									alt="Preview"
									width={1200}
									height={800}
									style={{ objectFit: "contain", width: "100%", height: "auto" }}
								/>
							</Box>
						</ModalBody>
					</ModalContent>
				</Modal>
			)}
		</>
	)
}


const MONTH_FULL = [
	"Januari", "Februari", "Maret", "April", "Mei", "Juni",
	"Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

interface MonthCalendarModalProps {
	isOpen: boolean
	onClose: () => void
	selectedDate: Date
	onSelectDate: (date: Date) => void
}

const MonthCalendarModal = ({ isOpen, onClose, selectedDate, onSelectDate }: MonthCalendarModalProps) => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const [calYear, setCalYear] = useState(today.getFullYear())
	const [calMonth, setCalMonth] = useState(today.getMonth())

	useEffect(() => {
		if (isOpen) {
			const sel = new Date(selectedDate)
			setCalYear(sel.getFullYear())
			setCalMonth(sel.getMonth())
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen])

	const prevMonth = () => {
		if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1) }
		else setCalMonth((m) => m - 1)
	}

	const nextMonth = () => {
		if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1) }
		else setCalMonth((m) => m + 1)
	}

	const firstDow = new Date(calYear, calMonth, 1).getDay()
	const totalDays = new Date(calYear, calMonth + 1, 0).getDate()
	const cells: (number | null)[] = []
	for (let i = 0; i < firstDow; i++) cells.push(null)
	for (let d = 1; d <= totalDays; d++) cells.push(d)
	while (cells.length % 7 !== 0) cells.push(null)

	const selTime = new Date(selectedDate).setHours(0, 0, 0, 0)

	return (
		<Modal isOpen={isOpen} onClose={onClose} isCentered>
			<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(2px)" />
			<ModalContent borderRadius="xl" mx={4} maxW="320px">
				<ModalBody p={5}>
					<Flex alignItems="center" justifyContent="space-between" mb={4}>
						<IconButton
							aria-label="Bulan sebelumnya"
							icon={<Icon as={FaChevronLeft} w={3} h={3} />}
							size="sm"
							variant="ghost"
							onClick={prevMonth}
						/>
						<Text fontWeight="700" fontSize="sm" color="gray.800">
							{MONTH_FULL[calMonth]} {calYear}
						</Text>
						<IconButton
							aria-label="Bulan berikutnya"
							icon={<Icon as={FaChevronRight} w={3} h={3} />}
							size="sm"
							variant="ghost"
							onClick={nextMonth}
						/>
					</Flex>

					<Grid templateColumns="repeat(7, 1fr)" mb={1}>
						{["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
							<Text key={d} textAlign="center" fontSize="xs" fontWeight="600" color="gray.400" py={1}>{d}</Text>
						))}
					</Grid>

					<Grid templateColumns="repeat(7, 1fr)">
						{cells.map((day, i) => {
							if (day === null) return <Box key={i} />
							const cellDate = new Date(calYear, calMonth, day)
							const cellTime = new Date(calYear, calMonth, day).setHours(0, 0, 0, 0)
							const isToday = cellTime === today.getTime()
							const isSelected = cellTime === selTime
							const isPast = cellDate < today
							return (
								<Box
									key={i}
									display="flex"
									alignItems="center"
									justifyContent="center"
									h="36px"
									cursor={isPast ? "not-allowed" : "pointer"}
									borderRadius="full"
									bg={isSelected ? "#008FFF" : "transparent"}
									color={isSelected ? "white" : isPast ? "gray.300" : isToday ? "#008FFF" : "gray.700"}
									fontWeight={isToday || isSelected ? "700" : "400"}
									border={isToday && !isSelected ? "2px solid #008FFF" : "2px solid transparent"}
									_hover={!isPast ? { bg: isSelected ? "#0070CC" : "gray.100" } : {}}
									transition="background 0.15s"
									onClick={() => {
										if (!isPast) {
											onSelectDate(new Date(calYear, calMonth, day))
											onClose()
										}
									}}
								>
									<Text fontSize="xs">{day}</Text>
								</Box>
							)
						})}
					</Grid>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}


interface DateSelectorProps {
	weekOffset: number
	selectedIndex: number
	onPrev: () => void
	onNext: () => void
	onSelect: (i: number) => void
	onCalendarOpen: () => void
}

const DateSelector = ({ weekOffset, selectedIndex, onPrev, onNext, onSelect, onCalendarOpen }: DateSelectorProps) => {
	const dates = getWeekDates(weekOffset)
	return (
		<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={4}>
			<Box border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden" bg="white" boxShadow="sm">
				<Flex alignItems="stretch">
					<Button variant="ghost" h="auto" px={3} py={4} borderRadius={0} onClick={onPrev} _hover={{ bg: "gray.50" }} flexShrink={0}>
						<Icon as={FaChevronLeft} w={3} h={3} color="gray.500" />
					</Button>
					{dates.map((day, i) => (
						<Box
							key={i}
							flex={1}
							textAlign="center"
							py={3}
							px={1}
							cursor="pointer"
							bg={selectedIndex === i ? "#008FFF" : "white"}
							color={selectedIndex === i ? "white" : "gray.700"}
							_hover={{ bg: selectedIndex === i ? "#008FFF" : "gray.50" }}
							transition="background 0.15s"
							onClick={() => onSelect(i)}
						>
							<Text fontSize="xs" fontWeight="500" lineHeight="1.4">{day.dayName}</Text>
							<Text fontSize="xs" fontWeight="700" lineHeight="1.5">{day.date} {day.month}</Text>
						</Box>
					))}
					<Button variant="ghost" h="auto" px={3} py={4} borderRadius={0} onClick={onNext} _hover={{ bg: "gray.50" }} flexShrink={0}>
						<Icon as={FaChevronRight} w={3} h={3} color="gray.500" />
					</Button>
					<Button variant="ghost" h="auto" px={3} py={4} borderRadius={0} _hover={{ bg: "gray.50" }} flexShrink={0} onClick={onCalendarOpen}>
						<Icon as={FaCalendarAlt} w={4} h={4} color="gray.500" />
					</Button>
				</Flex>
			</Box>
		</Box>
	)
}


interface ScheduleProps {
	courts: string[]
	slots: VenueSlot[]
	selectedSlots: SelectedSlots
	onToggleSlot: (key: string) => void
}

const Schedule = ({ courts, slots, selectedSlots, onToggleSlot }: ScheduleProps) => {
	const isSingle = courts.length === 1

	const Legend = () => (
		<HStack spacing={6} mb={4} flexWrap="wrap">
			<HStack spacing={2}>
				<Box w={3} h={3} borderRadius="sm" border="1px solid" borderColor="gray.300" bg="white" />
				<Text fontSize="xs" color="gray.600">Tersedia</Text>
			</HStack>
			<HStack spacing={2}>
				<Box w={3} h={3} borderRadius="sm" bg="gray.200" />
				<Text fontSize="xs" color="gray.600">Sudah dibooking</Text>
			</HStack>
			<HStack spacing={2}>
				<Box w={3} h={3} borderRadius="sm" bg="yellow.200" />
				<Text fontSize="xs" color="gray.600">Event khusus</Text>
			</HStack>
			<HStack spacing={2}>
				<Box w={3} h={3} borderRadius="sm" bg="#008FFF" />
				<Text fontSize="xs" color="gray.600">Pilihan Anda</Text>
			</HStack>
		</HStack>
	)

	if (isSingle) {
		return (
			<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} pb={12}>
				<Legend />
				<Box border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden" bg="white" boxShadow="sm">
					<Box px={4} py={3} textAlign="center" borderBottom="2px solid" borderColor="gray.100" bg="white">
						<Text fontSize="xs" fontWeight="700" color="gray.700">{courts[0]}</Text>
					</Box>

					{slots.map((row, rowIdx) => {
						const status = row.statuses[0] ?? "kosong"
						const key = `${rowIdx}-0`
						const isBooked = status === "booked"
						const isEvent = status === "event"
						const isSelected = selectedSlots.has(key)

						return (
							<Box
								key={rowIdx}
								py={5}
								px={4}
								textAlign="center"
								borderBottom="1px solid"
								borderColor="gray.100"
								cursor={isBooked || isEvent ? "default" : "pointer"}
								bg={isBooked ? "gray.50" : isEvent ? "#FFF8E1" : isSelected ? "blue.50" : "white"}
								_hover={!isBooked && !isEvent ? { bg: isSelected ? "blue.100" : "gray.50" } : {}}
								transition="background 0.15s"
								onClick={() => !isBooked && !isEvent && onToggleSlot(key)}
							>
								<Text
									fontSize="xs"
									fontWeight="700"
									letterSpacing="wider"
									color={isBooked ? "gray.400" : isEvent ? "yellow.700" : isSelected ? "#008FFF" : "green.500"}
									mb={1}
								>
									{isBooked ? "BOOKED" : isEvent ? "EVENT" : "KOSONG"}
								</Text>
								{isEvent && (
									<Text fontSize="xs" fontWeight="600" color="yellow.700" mb={1}>{row.eventName}</Text>
								)}
								<Text fontSize="xs" color={isBooked ? "gray.400" : "gray.500"}>
									{row.time}
								</Text>
								{!isBooked && !isEvent && (
									<Text fontSize="xs" color="gray.500" mt={0.5}>{formatRupiah(row.price)}</Text>
								)}
							</Box>
						)
					})}
				</Box>
			</Box>
		)
	}

	return (
		<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} pb={12}>
			<Legend />
			<Box border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="auto" bg="white" boxShadow="sm">
				<Box minW={courts.length > 3 ? "700px" : "400px"}>
					<Grid templateColumns={`repeat(${courts.length}, 1fr)`} borderBottom="2px solid" borderColor="gray.100">
						{courts.map((court, i) => (
							<Box
								key={court}
								px={2}
								py={3}
								textAlign="center"
								bg="white"
								borderLeft={i > 0 ? "1px solid" : "none"}
								borderColor="gray.100"
							>
								<Text fontSize="xs" fontWeight="700" color="gray.700">{court}</Text>
							</Box>
						))}
					</Grid>

					{slots.map((row, rowIdx) => (
						<Grid
							key={rowIdx}
							templateColumns={`repeat(${courts.length}, 1fr)`}
							borderBottom="1px solid"
							borderColor="gray.100"
						>
							{courts.map((_, courtIdx) => {
								const status = row.statuses[courtIdx] ?? "kosong"
								const key = `${rowIdx}-${courtIdx}`
								const isBooked = status === "booked"
								const isEvent = status === "event"
								const isSelected = selectedSlots.has(key)

								return (
									<Box
										key={key}
										py={5}
										px={2}
										textAlign="center"
										borderLeft={courtIdx > 0 ? "1px solid" : "none"}
										borderColor="gray.100"
										cursor={isBooked || isEvent ? "default" : "pointer"}
										bg={isBooked ? "gray.50" : isEvent ? "#FFF8E1" : isSelected ? "blue.50" : "white"}
										_hover={!isBooked && !isEvent ? { bg: isSelected ? "blue.100" : "gray.50" } : {}}
										transition="background 0.15s"
										onClick={() => !isBooked && !isEvent && onToggleSlot(key)}
									>
										<Text
											fontSize="xs"
											fontWeight="700"
											letterSpacing="wider"
											color={isBooked ? "gray.400" : isEvent ? "yellow.700" : isSelected ? "#008FFF" : "green.500"}
											mb={1}
										>
											{isBooked ? "BOOKED" : isEvent ? "EVENT" : "KOSONG"}
										</Text>
										{isEvent && (
											<Text fontSize="xs" color="yellow.700" fontWeight="600" mb={1}>{row.eventName}</Text>
										)}
										<Text fontSize="xs" color={isBooked ? "gray.400" : "gray.500"}>
											{row.time}
										</Text>
										{!isBooked && !isEvent && (
											<Text fontSize="xs" color="gray.500" mt={0.5}>{formatRupiah(row.price)}</Text>
										)}
									</Box>
								)
							})}
						</Grid>
					))}
				</Box>
			</Box>
		</Box>
	)
}


interface PaymentSummaryProps {
	selectedSlots: SelectedSlots
	selectedDate: ReturnType<typeof getWeekDates>[0]
	slots: VenueSlot[]
	courts: string[]
	venueName: string
	venueImage: string
	bookingMode: "insidentil" | "rutin"
	onCancel: () => void
	onLanjutkan: () => void
	localTarifs?: any[]
	userType: string
	tarifs?: any[]
}

const PaymentSummary = ({
	selectedSlots, selectedDate, slots, courts, venueName, venueImage, bookingMode, onCancel, onLanjutkan, localTarifs, userType, tarifs,
}: PaymentSummaryProps) => {
	if (selectedSlots.size === 0) return null

	const byCourt: Record<number, number[]> = {}
	selectedSlots.forEach((key) => {
		const [rowIdx, courtIdx] = key.split("-").map(Number)
		if (!byCourt[courtIdx]) byCourt[courtIdx] = []
		byCourt[courtIdx].push(rowIdx)
	})

	const courtEntries = Object.entries(byCourt).map(([courtIdxStr, rowIdxs]) => {
		const courtIdx = Number(courtIdxStr)
		const sorted = [...rowIdxs].sort((a, b) => a - b)
		const timeStart = slots[sorted[0]].time.split(" - ")[0]
		const timeEnd = slots[sorted[sorted.length - 1]].time.split(" - ")[1]
		const total = sorted.reduce((sum, r) => sum + slots[r].price, 0)
		return { courtName: courts[courtIdx], timeStart, timeEnd, total, durasi: sorted.length }
	})

	const grandTotal = courtEntries.reduce((sum, c) => sum + c.total, 0)
	const primary = courtEntries[0]

	let displayTotal = grandTotal
	let isRutinValid = false
	if (bookingMode === "rutin") {
		displayTotal = grandTotal * 4 // default fallback
		
		let allDurationsValid = true
		for (const court of courtEntries) {
			if (court.durasi !== 1) allDurationsValid = false
		}

		if (allDurationsValid) {
			isRutinValid = true
			let totalRutin = 0
			for (const court of courtEntries) {
				const rPrice = getRoutinePrice(venueName, court.timeStart, userType, localTarifs, tarifs, venueName)
				totalRutin += rPrice ? rPrice : (court.total * 4)
			}
			displayTotal = totalRutin
		}
	}

	return (
		<Box
			position="fixed"
			bottom={0}
			left={0}
			right={0}
			zIndex={200}
			bg="white"
			borderTop="1px solid"
			borderColor="gray.200"
			boxShadow="0 -4px 20px rgba(0,0,0,0.08)"
			px={{ base: 4, md: 8 }}
			py={4}
		>
			<Flex maxW="1200px" mx="auto" alignItems="center" gap={6} flexWrap="wrap">
				<HStack spacing={3} flex={1} minW="200px">
					<Box color="#008FFF" flexShrink={0}>
						<Icon as={FaMapMarkerAlt} w={4} h={4} />
					</Box>
					<VStack align="start" spacing={0}>
						<Text fontSize="sm" fontWeight="700" color="gray.800">
							{primary.courtName}{courtEntries.length > 1 && ` +${courtEntries.length - 1} lainnya`}
						</Text>
						<HStack spacing={3}>
							<HStack spacing={1}>
								<Icon as={FaCalendarAlt} w={3} h={3} color="gray.400" />
								<Text fontSize="xs" color="gray.500">
									{DAY_FULL[selectedDate.dayName]}, {selectedDate.date} {selectedDate.month} 2026
								</Text>
							</HStack>
							<HStack spacing={1}>
								<Icon as={FaClock} w={3} h={3} color="gray.400" />
								<Text fontSize="xs" color="gray.500">{primary.timeStart} - {primary.timeEnd}</Text>
							</HStack>
						</HStack>
					</VStack>
				</HStack>

				<VStack align="start" spacing={0} flexShrink={0}>
					<Text fontSize="xs" color="gray.500">Total Pembayaran{bookingMode === "rutin" && " (4 pertemuan)"}</Text>
					<Text fontSize="xl" fontWeight="800" color="#008FFF">{formatRupiah(displayTotal)}</Text>
				</VStack>

				<HStack spacing={3} flexShrink={0}>
					<Button variant="outline" size="sm" borderColor="gray.300" color="gray.600" borderRadius="lg" _hover={{ bg: "gray.50" }} onClick={onCancel}>
						Batalkan Pilihan
					</Button>
					<Button size="sm" bg="#008FFF" color="white" borderRadius="lg" fontWeight="600" _hover={{ bg: "#0070CC" }} onClick={onLanjutkan}>
						Lanjutkan Reservasi
					</Button>
				</HStack>
			</Flex>
		</Box>
	)
}


export default function VenueDetailTemplate({ config }: { config: VenueConfig }) {
	const router = useRouter()
	const toast = useToast()
	const [weekOffset, setWeekOffset] = useState(0)
	const [selectedIndex, setSelectedIndex] = useState(3)
	const [selectedSlots, setSelectedSlots] = useState<SelectedSlots>(new Set())
	const [bookings, setBookings] = useState<{ jam_mulai: string; jam_selesai: string; lapangan?: string | null }[]>([])
	const [isLoadingBookings, setIsLoadingBookings] = useState(false)
	const [isCalendarOpen, setIsCalendarOpen] = useState(false)
	const [bookingMode, setBookingMode] = useState<"insidentil" | "rutin">("insidentil")
	const [isCheckingRutin, setIsCheckingRutin] = useState(false)
	const [checkoutModalData, setCheckoutModalData] = useState<any>(null)
	const [tarifs, setTarifs] = useState<any[]>([])
	const [userType, setUserType] = useState<string>("guest")
	const [localTarifs, setLocalTarifs] = useState<any[]>([])
	const [showBadmintonWarning, setShowBadmintonWarning] = useState(false)
	const [showH2Warning, setShowH2Warning] = useState(false)
	const [pendingRouteData, setPendingRouteData] = useState<any>(null)

	useEffect(() => {
		const fetchUserAndTarifs = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"
				const res = await axios.get(`${baseUrl}/auth/user`, {
					withCredentials: true,
					headers: { Accept: "application/json" },
				})
				const me = res.data?.data
				if (me) {
					setUserType(me.user_type ?? "guest")
				}
			} catch (e) {
				setUserType("guest")
			}

			if (typeof window !== "undefined") {
				const saved = localStorage.getItem("tarif_data")
				if (saved) {
					try {
						setLocalTarifs(JSON.parse(saved))
					} catch (e) {}
				}
			}
		}
		fetchUserAndTarifs()
	}, [bookingMode])

	const dates = getWeekDates(weekOffset)
	const selectedDate = dates[selectedIndex]
	const id = (router.query.id as string) || ""

	useEffect(() => {
		if (!id) {
			setBookings([])
			return
		}

		const fetchBookings = async () => {
			setIsLoadingBookings(true)
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"
				const d = selectedDate.full;
				const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
				const response = await axios.get(`${baseUrl}/fasilitas/${id}?date=${dateStr}`, {
					withCredentials: true,
				})
				const apiBookings = response.data?.data?.bookings
				setBookings(Array.isArray(apiBookings) ? apiBookings : [])
				const apiTarifs = response.data?.data?.tarif
				setTarifs(Array.isArray(apiTarifs) ? apiTarifs : [])
			} catch (e) {
				setBookings([])
				setTarifs([])
			} finally {
				setIsLoadingBookings(false)
			}
		}

		fetchBookings()
	}, [id, weekOffset, selectedIndex])

	const activeSlots = bookingMode === "rutin" && config.rutinSlots ? config.rutinSlots : config.slots
	const effectiveSlots = useMemo(() => {
		const baseSlots = activeSlots.map((row: any) => ({
			...row,
			price: getDynamicPrice(row.time, selectedDate.dayName, tarifs, row.price, localTarifs, bookingMode, userType, config.name),
			statuses: row.statuses.map((s) => (s === "booked" ? "kosong" : s)),
		}))

		if (!bookings.length) return baseSlots

		return baseSlots.map((row: any) => ({
			...row,
			statuses: config.courts.map((courtName, courtIdx) => {
				const baseStatus = row.statuses[courtIdx] ?? "kosong"
				if (baseStatus === "event") return "event"

				const isBooked = bookings.some((b) => {
					if (!slotOverlaps(row.time, b)) return false
					const bookedCourt = (b.lapangan ?? "").trim()
					if (!bookedCourt) return true
					return bookedCourt === courtName
				})

				return isBooked ? "booked" : "kosong"
			}),
		}))
	}, [bookings, config.courts, activeSlots, selectedDate.dayName, tarifs])

	const jumpToDate = (date: Date) => {
		const todayBase = new Date()
		todayBase.setHours(0, 0, 0, 0)
		const target = new Date(date)
		target.setHours(0, 0, 0, 0)
		const diffDays = Math.round((target.getTime() - todayBase.getTime()) / (1000 * 60 * 60 * 24))
		const newWeekOffset = Math.round(diffDays / 7)
		const newSelectedIndex = Math.max(0, Math.min(7, diffDays - newWeekOffset * 7 + 3))
		setWeekOffset(newWeekOffset)
		setSelectedIndex(newSelectedIndex)
		setSelectedSlots(new Set())
	}

	const toggleSlot = (key: string) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		const targetDate = new Date(selectedDate.full);
		targetDate.setHours(0, 0, 0, 0);
		
		const diffTime = targetDate.getTime() - today.getTime();
		const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
		
		if (diffDays < 2) {
			setShowH2Warning(true);
			return;
		}

		setSelectedSlots((prev) => {
			const [, nextCourtIdx] = key.split("-").map(Number)
			
			if (bookingMode === "rutin") {
				const existingCourtIdxs = Array.from(prev).map((k) => Number(k.split("-")[1]))
				const hasDifferentCourt = existingCourtIdxs.some((ci) => ci !== nextCourtIdx)
				const next = hasDifferentCourt ? new Set<string>() : new Set(prev)
				
				if (next.has(key)) next.delete(key)
				else next.add(key)
				return next
			} else {
				const next = new Set(prev)
				if (next.has(key)) next.delete(key)
				else next.add(key)
				return next
			}
		})
	}

	const cancelAll = () => setSelectedSlots(new Set())

	const handleLanjutkan = async () => {
		const byCourt: Record<number, number[]> = {}
		selectedSlots.forEach((key) => {
			const [rowIdx, courtIdx] = key.split("-").map(Number)
			if (!byCourt[courtIdx]) byCourt[courtIdx] = []
			byCourt[courtIdx].push(rowIdx)
		})
		const courtEntries = Object.entries(byCourt).map(([courtIdxStr, rowIdxs]) => {
			const courtIdx = Number(courtIdxStr)
			const sorted = [...rowIdxs].sort((a, b) => a - b)
			const timeStart = effectiveSlots[sorted[0]].time.split(" - ")[0]
			const timeEnd = effectiveSlots[sorted[sorted.length - 1]].time.split(" - ")[1]
			const total = sorted.reduce((sum, r) => sum + effectiveSlots[r].price, 0)
			return { courtName: config.courts[courtIdx], timeStart, timeEnd, total, durasi: sorted.length }
		})
		const primary = courtEntries[0]
		const grandTotal = courtEntries.reduce((sum, c) => sum + c.total, 0)

		const firstTanggal = `${DAY_FULL[selectedDate.dayName]}, ${selectedDate.date} ${MONTH_SHORT[selectedDate.full.getMonth()]} ${selectedDate.full.getFullYear()}`

		if (bookingMode === "rutin") {
			const isBulutangkis = config.name.toLowerCase().includes("bulutangkis") || config.name.toLowerCase().includes("badminton")
			const isTenis = config.name.toLowerCase().includes("tenis") || config.name.toLowerCase().includes("tennis")
			
			for (const court of courtEntries) {
				if (court.durasi !== 1) {
					toast({
						title: "Durasi Tidak Valid",
						description: "Silakan pilih tepat 1 blok jadwal untuk Latihan Rutin.",
						status: "warning",
						duration: 5000,
						isClosable: true,
						position: "top",
					})
					return
				}
			}

			if (selectedDate.full.getDate() > 7) {
				toast({
					title: "Tidak dapat memulai Latihan Rutin",
					description: "Latihan Rutin hanya dapat dimulai dari minggu pertama (tanggal 1–7) setiap bulan.",
					status: "warning",
					duration: 5000,
					isClosable: true,
					position: "top",
				})
				return
			}
			setIsCheckingRutin(true)
			const rutinDates = getRutinDates(selectedDate.full)
			const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"
			
			try {
				const allBookingsPromises = rutinDates.map(async (d) => {
					const yyyy = d.getFullYear()
					const mm = String(d.getMonth() + 1).padStart(2, "0")
					const dd = String(d.getDate()).padStart(2, "0")
					const dateStr = `${yyyy}-${mm}-${dd}`
					try {
						const response = await axios.get(`${baseUrl}/fasilitas/${id}?date=${dateStr}`, { withCredentials: true })
						return { date: d, bookings: response.data?.data?.bookings || [] }
					} catch {
						return { date: d, bookings: [] }
					}
				})
				
				const allBookingsData = await Promise.all(allBookingsPromises)
				
				const courtDetailsWithDates = courtEntries.map((court) => {
					let availableDates: Date[] = []
					const blockedDates: Date[] = []
					for (const { date, bookings } of allBookingsData) {
						const isBooked = (bookings as any[]).some((b) => {
							if (!slotOverlaps(`${court.timeStart} - ${court.timeEnd}`, b)) return false
							const bookedCourt = (b.lapangan ?? "").trim()
							if (!bookedCourt) return true
							return bookedCourt === court.courtName
						})
						if (isBooked) blockedDates.push(date)
						else availableDates.push(date)
					}
					
					if (availableDates.length > 4) {
						availableDates = availableDates.slice(0, 4)
					}
					
					return { ...court, availableDates, blockedDates }
				})
				
				const finalCourtDetails = courtDetailsWithDates.map((court) => {
					const count = court.availableDates.length
					const isDiscounted = count === 4
					const basePriceTotal = court.total * count
					
					let finalPrice = basePriceTotal;
					if (isDiscounted) {
						const routinePrice = getRoutinePrice(config.sport, court.timeStart, userType, localTarifs, tarifs, config.name);
						if (routinePrice) {
							finalPrice = routinePrice;
						}
					}
					return { ...court, finalPrice, isDiscounted }
				})
				
				const finalGrandTotal = finalCourtDetails.reduce((sum, c) => sum + c.finalPrice, 0)
				
				setCheckoutModalData({
					courtDetails: finalCourtDetails,
					grandTotal: finalGrandTotal,
					type: "rutin"
				})
			} catch (e) {
				console.error(e)
			} finally {
				setIsCheckingRutin(false)
			}
		} else {
			const queryData = {
				id_fasilitas: id,
				facility: config.name,
				image: config.images.main,
				lapangan: courtEntries.map((c) => c.courtName).join("|"),
				tanggal: firstTanggal,
				waktu: `${primary.timeStart} - ${primary.timeEnd}`,
				hargaPerUnit: String(Math.round(primary.total / primary.durasi)),
				satuan: config.priceUnit.replace("Per ", ""),
				durasi: String(primary.durasi),
				total: String(grandTotal),
				courtDetails: JSON.stringify(courtEntries),
			} as any;

			const isBadminton = config.sport.toLowerCase().includes("bulutangkis") || config.sport.toLowerCase().includes("badminton");
			if (isBadminton) {
				setPendingRouteData(queryData);
				setShowBadmintonWarning(true);
			} else {
				router.push({
					pathname: "/konfirmasi-reservasi",
					query: queryData,
				});
			}
		}
	}

	const lowestPrice = useMemo(() => {
		let min = Infinity;
		const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
		for (const day of days) {
			for (const row of config.slots) {
				const price = getDynamicPrice(row.time, day, tarifs, row.price, localTarifs, "insidentil", userType, config.name);
				if (price < min) min = price;
			}
		}
		return min === Infinity ? null : min;
	}, [config.slots, tarifs, localTarifs, userType, config.name]);

	return (
		<Box minH="100vh" bg="gray.50">
			<FasorNavbar />
			<Box bg="white">
				<VenueHeader config={config} lowestPrice={lowestPrice} />
				<Box id="jadwal" maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
					<Divider borderColor="gray.200" />
				</Box>
				<DateSelector
					weekOffset={weekOffset}
					selectedIndex={selectedIndex}
					onPrev={() => { setWeekOffset((w) => w - 1); setSelectedSlots(new Set()) }}
					onNext={() => { setWeekOffset((w) => w + 1); setSelectedSlots(new Set()) }}
					onSelect={(i) => { setSelectedIndex(i); setSelectedSlots(new Set()) }}
					onCalendarOpen={() => setIsCalendarOpen(true)}
				/>
				<MonthCalendarModal
					isOpen={isCalendarOpen}
					onClose={() => setIsCalendarOpen(false)}
					selectedDate={selectedDate.full}
					onSelectDate={jumpToDate}
				/>

				<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} pt={1} pb={3}>
					<HStack spacing={1} bg="gray.100" borderRadius="2xl" p="5px" display="inline-flex">
						{(["insidentil", "rutin"] as const).filter(mode => mode === "insidentil" || (mode === "rutin" && (config.name.toLowerCase().includes("bulutangkis") || config.name.toLowerCase().includes("badminton") || config.name.toLowerCase().includes("tenis") || config.name.toLowerCase().includes("tennis")))).map((mode) => (
							<Button
								key={mode}
								size="sm"
								borderRadius="xl"
								px={5}
								h="32px"
								bg={bookingMode === mode ? "white" : "transparent"}
								color={bookingMode === mode ? "gray.800" : "gray.500"}
								boxShadow={bookingMode === mode ? "sm" : "none"}
								fontWeight={bookingMode === mode ? "600" : "400"}
								fontSize="xs"
								_hover={{ bg: bookingMode === mode ? "white" : "gray.200" }}
								onClick={() => { setBookingMode(mode); setSelectedSlots(new Set()) }}
								transition="all 0.15s"
							>
								{mode === "insidentil" ? "Latihan Insidentil" : "Latihan Rutin"}
							</Button>
						))}
					</HStack>
				{bookingMode === "rutin" && (
					<Text fontSize="xs" color="gray.500" mt={2}>
						* Latihan Rutin mencakup 4 pertemuan (seminggu sekali) dalam satu bulan. Hanya dapat dimulai dari minggu pertama (tanggal 1–7) setiap bulan.
					</Text>
				)}
				</Box>

				{isLoadingBookings && (
					<HStack maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} pb={2} spacing={2}>
						<Spinner size="sm" color="#008FFF" />
						<Text fontSize="xs" color="gray.500">Memuat ketersediaan...</Text>
					</HStack>
				)}
				<Schedule
					courts={config.courts}
					slots={effectiveSlots}
					selectedSlots={selectedSlots}
					onToggleSlot={toggleSlot}
				/>
			</Box>
			<PaymentSummary
				selectedSlots={selectedSlots}
				selectedDate={selectedDate}
				slots={effectiveSlots}
				courts={config.courts}
				venueName={config.name}
				venueImage={config.images.main}
				bookingMode={bookingMode}
				onCancel={cancelAll}
				onLanjutkan={handleLanjutkan}
				localTarifs={localTarifs}
				userType={userType}
				tarifs={tarifs}
			/>
			<FasorFooter />
			{checkoutModalData && (
				<Modal isOpen onClose={() => setCheckoutModalData(null)} isCentered size="md">
					<ModalOverlay />
					<ModalContent mx={4}>
						<Box p={6} maxH="90vh" overflowY="auto">
							<Text fontSize="xl" fontWeight="700" mb={2}>Konfirmasi Latihan Rutin</Text>
							<Text fontSize="sm" color="gray.600" mb={4}>
								Berikut adalah jadwal dan harga untuk lapangan yang Anda pilih.
							</Text>
							{checkoutModalData.courtDetails.some((c: any) => c.blockedDates?.length > 0) && (
								<Box bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="lg" p={3} mb={4}>
									<Text fontSize="xs" fontWeight="700" color="orange.700" mb={1}>
										⚠ Perhatian: Ada tanggal yang sudah dipesan
									</Text>
									<Text fontSize="xs" color="orange.700">
										Beberapa tanggal dalam periode ini sudah dibooking oleh pengguna lain (Latihan Insidentil). Karena tidak semua 4 sesi tersedia, harga akan kembali ke tarif insidentil normal (tanpa diskon bulanan).
									</Text>
								</Box>
							)}
							{checkoutModalData.courtDetails.map((court: any, idx: number) => (
								<Box key={idx} mb={4} p={4} border="1px solid" borderColor="gray.200" borderRadius="xl">
									<Text fontWeight="600">{court.courtName}</Text>
									<Text fontSize="sm" color="gray.600">{court.timeStart} - {court.timeEnd}</Text>
									<Divider my={2} />
									{court.blockedDates?.length > 0 && (
										<Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={2.5} mb={3}>
											<Text fontSize="xs" fontWeight="700" color="red.700" mb={1.5}>
												Tanggal sudah dipesan oleh pengguna lain:
											</Text>
											<VStack align="start" spacing={0.5} pl={2}>
												{court.blockedDates.map((d: Date, i: number) => {
													const ds = DAY_SHORT[d.getDay()]
													const dateStr = `${DAY_FULL[ds]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
													return (
														<Text key={i} fontSize="xs" color="red.600">• {dateStr}</Text>
													)
												})}
											</VStack>
										</Box>
									)}
									{court.availableDates.length > 0 ? (
										<>
											<Text fontSize="sm" fontWeight="600" mb={1}>
												Tanggal yang Akan Direservasi ({court.availableDates.length} Pertemuan):
											</Text>
											<VStack align="start" spacing={1} pl={2} mb={3}>
												{court.availableDates.map((d: Date, i: number) => {
													const ds = DAY_SHORT[d.getDay()]
													const dateStr = `${DAY_FULL[ds]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
													return <Text key={i} fontSize="xs" color="gray.500">• {dateStr}</Text>
												})}
											</VStack>
										</>
									) : (
										<Text fontSize="sm" color="red.500" mb={3}>
											Tidak ada tanggal tersedia untuk lapangan ini.
										</Text>
									)}
									<HStack justify="space-between">
										<VStack align="start" spacing={0}>
											<Text fontSize="sm" color="gray.600">Total Harga</Text>
											{court.isDiscounted ? (
												<Text fontSize="xs" color="green.600">Harga Spesial Latihan Rutin (4 Pertemuan)</Text>
											) : court.blockedDates?.length > 0 ? (
												<Text fontSize="xs" color="orange.600">Tarif insidentil normal (ada konflik)</Text>
											) : null}
										</VStack>
										<VStack align="end" spacing={0}>
											<Text fontWeight="700" color={court.isDiscounted ? "green.500" : "gray.800"}>
												{formatRupiah(court.finalPrice)}
											</Text>
										</VStack>
									</HStack>
								</Box>
							))}
							<HStack justify="space-between" mb={4} pt={2} borderTop="1px solid" borderColor="gray.100">
								<Text fontWeight="600" color="gray.700">Total Keseluruhan</Text>
								<Text fontWeight="800" fontSize="lg" color="#008FFF">
									{formatRupiah(checkoutModalData.grandTotal)}
								</Text>
							</HStack>
							<Button
								w="full"
								bg="#008FFF"
								color="white"
								_hover={{ bg: "#0070CC" }}
								isDisabled={checkoutModalData.courtDetails.every((c: any) => c.availableDates.length === 0)}
								onClick={() => {
									const primary = checkoutModalData.courtDetails[0]
									const firstTanggal = `${DAY_FULL[selectedDate.dayName]}, ${selectedDate.date} ${MONTH_SHORT[selectedDate.full.getMonth()]} ${selectedDate.full.getFullYear()}`
									const tanggalList = primary.availableDates.map((d: Date) => {
										const ds = DAY_SHORT[d.getDay()]
										return `${DAY_FULL[ds]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
									}).join("|")
									
									const courtDetailsPrepared = checkoutModalData.courtDetails.map((court: any) => ({
										...court,
										availableDates: court.availableDates.map((d: Date) => {
											const yyyy = d.getFullYear()
											const mm = String(d.getMonth() + 1).padStart(2, "0")
											const dd = String(d.getDate()).padStart(2, "0")
											return `${yyyy}-${mm}-${dd}`
										}),
										blockedDates: court.blockedDates.map((d: Date) => {
											const yyyy = d.getFullYear()
											const mm = String(d.getMonth() + 1).padStart(2, "0")
											const dd = String(d.getDate()).padStart(2, "0")
											return `${yyyy}-${mm}-${dd}`
										})
									}))

									const queryData = {
										id_fasilitas: id,
										facility: config.name,
										image: config.images.main,
										lapangan: checkoutModalData.courtDetails.map((c: any) => c.courtName).join("|"),
										tanggal: firstTanggal,
										tanggalList,
										tipe: "rutin",
										waktu: `${primary.timeStart} - ${primary.timeEnd}`,
										hargaPerUnit: String(checkoutModalData.grandTotal),
										satuan: "Bulan",
										durasi: "1",
										total: String(checkoutModalData.grandTotal),
										courtDetails: JSON.stringify(courtDetailsPrepared),
									} as any;

									const isBadminton = config.sport.toLowerCase().includes("bulutangkis") || config.sport.toLowerCase().includes("badminton");
									if (isBadminton) {
										setPendingRouteData(queryData);
										setShowBadmintonWarning(true);
									} else {
										router.push({
											pathname: "/konfirmasi-reservasi",
											query: queryData,
										});
									}
								}}
							>
								Lanjutkan Pembayaran
							</Button>
						</Box>
					</ModalContent>
				</Modal>
			)}
			
			{showBadmintonWarning && (
				<Modal isOpen onClose={() => setShowBadmintonWarning(false)} isCentered size="md">
					<ModalOverlay />
					<ModalContent mx={4}>
						<ModalHeader color="gray.800" fontWeight="800">
							Peringatan Lapangan Badminton
						</ModalHeader>
						<ModalCloseButton />
						<ModalBody pb={6}>
							<Text fontSize="sm" color="gray.700" lineHeight="tall">
								Seluruh peserta/orang yang menggunakan lapangan badminton <b>WAJIB</b> menggunakan sepatu khusus badminton, jika tidak maka admin akan membatalkan pemesanan dan jika masih melanggar akan dikenakan sanksi dan denda jika ketahuan merusak lapangan! Demi keamanan dan kenyamanan bersama mohon taati aturan Fasilitas Olahraga ITS.
							</Text>
						</ModalBody>
						<ModalFooter borderTop="1px solid" borderColor="gray.100">
							<Button variant="ghost" mr={3} onClick={() => setShowBadmintonWarning(false)}>
								Batal
							</Button>
							<Button
								bg="#008FFF"
								color="white"
								_hover={{ bg: "#0070CC" }}
								onClick={() => {
									setShowBadmintonWarning(false);
									if (pendingRouteData) {
										router.push({
											pathname: "/konfirmasi-reservasi",
											query: pendingRouteData,
										});
									}
								}}
							>
								Setuju & Lanjutkan
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
			
			{showH2Warning && (
				<Modal isOpen onClose={() => setShowH2Warning(false)} isCentered size="md">
					<ModalOverlay />
					<ModalContent mx={4}>
						<ModalHeader color="gray.800" fontWeight="800">
							Pemesanan H-2
						</ModalHeader>
						<ModalCloseButton />
						<ModalBody pb={6}>
							<Text fontSize="sm" color="gray.700" lineHeight="tall">
								Pemesanan hanya bisa dilakukan H-2 dan jika masih ingin melakukan pemesanan setelahnya tolong hubungi nomor admin berikut:
							</Text>
						</ModalBody>
						<ModalFooter borderTop="1px solid" borderColor="gray.100" flexDir="column" gap={3}>
							<Button
								w="full"
								leftIcon={<Icon as={FaWhatsapp} boxSize={4} />}
								bg="green.500"
								color="white"
								_hover={{ bg: "green.600" }}
								as="a"
								href="http://wa.me/6281139187999"
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => setShowH2Warning(false)}
							>
								Hubungi Admin via Whatsapp
							</Button>
							<Button w="full" variant="ghost" onClick={() => setShowH2Warning(false)}>
								Tutup
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
		</Box>
	)
}
