import {
	Box,
	Flex,
	Text,
	Button,
	Grid,
	VStack,
	HStack,
	Divider,
	Icon,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	Skeleton,
} from "@chakra-ui/react"
import Image from "next/image"
import axios from "axios"
import { FiMapPin } from "react-icons/fi"
import { useState, useEffect, type ElementType } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { GiShuttlecock, GiBasketballBall, GiSoccerBall } from "react-icons/gi"
import { MdSportsTennis, MdSportsVolleyball, MdDirectionsRun } from "react-icons/md"
import { FaWhatsapp, FaHiking, FaPen } from "react-icons/fa"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import FasorFooter from "@/components/organisms/FasorFooter"
import { useAnnouncements, CATEGORY_COLORS } from "@/data/pengumuman"


type SportKey = "bulutangkis" | "tenis" | "basket" | "futsal" | "sepakbola" | "voli" | "lari" | "panjattebing"

interface SportIconConfig {
	key: SportKey
	label: string
	image?: string
	icon?: ElementType
	circleBg: string
	iconColor: string
	tagIcon: ElementType
}

const SPORT_ICONS: SportIconConfig[] = [
	{ key: "bulutangkis", label: "Bulutangkis", image: "/images/badminton.png", circleBg: "#CFFAFE", iconColor: "#0891B2", tagIcon: GiShuttlecock },
	{ key: "tenis",       label: "Tenis",       image: "/images/tennis.png",    circleBg: "#DCFCE7", iconColor: "#16A34A", tagIcon: MdSportsTennis },
	{ key: "basket",      label: "Basket",      image: "/images/basket.png",    circleBg: "#FED7AA", iconColor: "#EA580C", tagIcon: GiBasketballBall },
	{ key: "futsal",      label: "Futsal",      image: "/images/futsal.png",    circleBg: "#F8E3E3FF", iconColor: "#2563EB", tagIcon: GiSoccerBall },
	{ key: "sepakbola",   label: "Sepak Bola",  image: "/images/sepak bola.png", circleBg: "#DCFCE7", iconColor: "#15803D", tagIcon: GiSoccerBall },
	{ key: "voli",        label: "Voli",        image: "/images/voli.png",       circleBg: "#FCE7F3", iconColor: "#BE185D", tagIcon: MdSportsVolleyball },
	{ key: "lari",        label: "Lari/Atletik",image: "/images/lari.png",       circleBg: "#EDE9FE", iconColor: "#7C3AED", tagIcon: MdDirectionsRun },
	{ key: "panjattebing",label: "Panjat Tebing",image: "/images/panjat tebing.png",circleBg: "#FEF08A", iconColor: "#CA8A04", icon: FaHiking, tagIcon: FaHiking },
]

interface Venue {
	id?: string
	name: string
	sport: SportKey
	image: string
	href?: string
}

const ALL_VENUES: Venue[] = [
	{ name: "GOR Futsal Indoor",           sport: "futsal",      image: "/images/gor futsal its.png",              href: "/gor-futsal" },
	{ name: "Lapangan Futsal Outdoor",     sport: "futsal",      image: "/images/lapangan futsal pln.png",         href: "/lapangan-futsal-pln" },
	{ name: "Lapangan Basket Semi Indoor", sport: "basket",      image: "/images/lapangan basket semi indoor.png", href: "/lapangan-basket-semi-indoor" },
	{ name: "Lapangan Basket Outdoor",     sport: "basket",      image: "/images/lapangan basket flexy.png",       href: "/lapangan-basket-flexy" },
	{ name: "GOR Badminton",               sport: "bulutangkis", image: "/images/gor badminton its.png",           href: "/gor-bulutangkis" },
	{ name: "Lapangan Tenis",              sport: "tenis",       image: "/images/lapangan tennis its.png",         href: "/lapangan-tenis" },
	{ name: "Stadion Sepak Bola",          sport: "sepakbola",   image: "/images/stadion its.png",                 href: "/stadion-its" },
	{ name: "Mini Soccer",                 sport: "sepakbola",   image: "/images/lapangan mini soccer.png",        href: "/lapangan-mini-soccer" },
	{ name: "Lapangan Voli Outdoor",       sport: "voli",        image: "/images/lapangan voli its.png",           href: "/lapangan-voli" },
]

type BackendFacility = {
	id_fasilitas: string
	nama: string
}

const mapFacilityToSport = (name: string): SportKey => {
	const n = name.toLowerCase()
	if (n.includes("bulutangkis") || n.includes("badminton")) return "bulutangkis"
	if (n.includes("tennis") || n.includes("tenis")) return "tenis"
	if (n.includes("basket")) return "basket"
	if (n.includes("futsal")) return "futsal"
	if (n.includes("sepakbola") || n.includes("soccer") || n.includes("stadion")) return "sepakbola"
	if (n.includes("volly") || n.includes("voli")) return "voli"
	if (n.includes("lari") || n.includes("atletik")) return "lari"
	return "sepakbola"
}

const mapFacilityToImage = (name: string): string => {
	const n = name.toLowerCase()
	if (n.includes("bulutangkis") || n.includes("badminton")) return "/images/gor badminton its.png"
	if (n.includes("tennis") || n.includes("tenis")) return "/images/lapangan tennis its.png"
	if (n.includes("basket semi indoor")) return "/images/lapangan basket semi indoor.png"
	if (n.includes("basket")) return "/images/lapangan basket flexy.png"
	if (n.includes("gor futsal") || (n.includes("futsal") && n.includes("indoor"))) return "/images/gor futsal its.png"
	if (n.includes("futsal")) return "/images/lapangan futsal pln.png"
	if (n.includes("mini soccer")) return "/images/lapangan mini soccer.png"
	if (n.includes("stadion")) return "/images/stadion its.png"
	if (n.includes("volly") || n.includes("voli")) return "/images/lapangan voli its.png"
	return "/images/stadion its.png"
}

const mapFacilityToHref = (name: string, id: string): string => {
	const n = name.toLowerCase()
	if (n.includes("bulutangkis") || n.includes("badminton")) return `/gor-bulutangkis?id=${id}`
	if (n.includes("mini soccer")) return `/lapangan-mini-soccer?id=${id}`
	if (n.includes("stadion") || n.includes("sepakbola") || n.includes("soccer")) return `/stadion-its?id=${id}`
	if (n.includes("gor futsal") || (n.includes("futsal") && n.includes("indoor"))) return `/gor-futsal?id=${id}`
	if (n.includes("futsal")) return `/lapangan-futsal-pln?id=${id}`
	if (n.includes("basket semi indoor")) return `/lapangan-basket-semi-indoor?id=${id}`
	if (n.includes("basket")) return `/lapangan-basket-flexy?id=${id}`
	if (n.includes("tennis") || n.includes("tenis")) return `/lapangan-tenis?id=${id}`
	if (n.includes("voli") || n.includes("volly")) return `/lapangan-voli?id=${id}`
	return `/gor-bulutangkis?id=${id}`
}



const HERO_SLIDES = [
	{ sport: "Welcome", image: "/images/welcome fasor.jpeg" },
	{ sport: "Announcement", image: "/images/anouncement fasor.jpeg" },
	{ sport: "Caution", image: "/images/caution fasor.jpeg" },
]


const HeroSection = () => {
	const [current, setCurrent] = useState(0)

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
		}, 5000)
		return () => clearInterval(timer)
	}, [])

	return (
		<Box bg="white" py={5}>
			<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
				<Box
					position="relative"
					overflow="hidden"
					borderRadius="2xl"
					h={{ base: "350px", md: "500px" }}
				>
					<Box
						className="carousel-slide"
						style={{ transform: `translate3d(-${current * 100}%, 0, 0)`, height: "100%" }}
					>
						{HERO_SLIDES.map((slide, i) => (
							<Box key={i} className="slide-content" position="relative" h="100%" w="100%">
								<Image
									src={slide.image}
									alt={slide.sport}
									fill
									style={{ objectFit: "cover", objectPosition: "center" }}
									priority={i === 0}
								/>
							</Box>
						))}
					</Box>

					<Box
						position="absolute"
						top="50%"
						left={3}
						transform="translateY(-50%)"
						zIndex={2}
					>
						<Button
							size="sm"
							variant="ghost"
							color="white"
							_hover={{ bg: "whiteAlpha.300" }}
							borderRadius="full"
							minW="36px"
							h="36px"
							p={0}
							onClick={() =>
								setCurrent((prev) =>
									prev === 0 ? HERO_SLIDES.length - 1 : prev - 1
								)
							}
						>
							‹
						</Button>
					</Box>

					<Box
						position="absolute"
						top="50%"
						right={3}
						transform="translateY(-50%)"
						zIndex={2}
					>
						<Button
							size="sm"
							variant="ghost"
							color="white"
							_hover={{ bg: "whiteAlpha.300" }}
							borderRadius="full"
							minW="36px"
							h="36px"
							p={0}
							onClick={() =>
								setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
							}
						>
							›
						</Button>
					</Box>

					<HStack
						position="absolute"
						bottom={4}
						left="50%"
						transform="translateX(-50%)"
						spacing={2}
						zIndex={2}
					>
						{HERO_SLIDES.map((_, i) => (
							<Box
								key={i}
								w={i === current ? "24px" : "8px"}
								h="8px"
								borderRadius="full"
								bg={i === current ? "white" : "whiteAlpha.600"}
								cursor="pointer"
								transition="all 0.3s"
								onClick={() => setCurrent(i)}
							/>
						))}
					</HStack>
				</Box>
			</Box>
		</Box>
	)
}


const GridIconSemua = () => (
	<Grid templateColumns="repeat(2, 1fr)" gap="3px" w="28px" h="28px">
		{[0, 1, 2, 3].map(i => (
			<Box key={i} borderRadius="2px" bg="gray.400" />
		))}
	</Grid>
)

const VenueCard = ({ venue }: { venue: Venue }) => {
	const router = useRouter()
	const sportConfig = SPORT_ICONS.find(s => s.key === venue.sport) ?? SPORT_ICONS[0]
	return (
		<Box
			border="1px solid"
			borderColor="gray.200"
			borderRadius="xl"
			overflow="hidden"
			bg="white"
			boxShadow="sm"
			_hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
			transition="all 0.15s"
		>
			<Box position="relative" h="150px" w="full">
				<Image
					src={venue.image}
					alt={venue.name}
					fill
					style={{ objectFit: "cover" }}
				/>
			</Box>
			<Box p={4}>
				<Text fontSize="sm" fontWeight="700" color="gray.800" mb={1.5}>
					{venue.name}
				</Text>
				<HStack spacing={1.5} mb={4}>
					<Icon as={sportConfig.tagIcon} color={sportConfig.iconColor} boxSize={3.5} />
					<Text fontSize="xs" color="gray.500">{sportConfig.label}</Text>
				</HStack>
				<Button
					size="sm"
					variant="outline"
					color="#008FFF"
					borderColor="#008FFF"
					w="full"
					borderRadius="full"
					fontWeight="600"
					fontSize="xs"
					_hover={{ bg: "#008FFF", color: "white" }}
					onClick={() => router.push(venue.href ?? "/sewa-lapangan")}
				>
					Lihat Jadwal
				</Button>
			</Box>
		</Box>
	)
}

const SportFilterSection = () => {
	const [selected, setSelected] = useState<SportKey | null>(null)
	const [showAll, setShowAll] = useState(false)
	const [showWaModal, setShowWaModal] = useState(false)
	const [showFavoritModal, setShowFavoritModal] = useState(false)
	const [venues, setVenues] = useState<Venue[]>([])
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
	const [favorites, setFavorites] = useState<SportKey[]>(SPORT_ICONS.map(s => s.key as SportKey))
	const [tempFavorites, setTempFavorites] = useState<SportKey[]>([])
	const [dynamicSports, setDynamicSports] = useState<SportIconConfig[]>(SPORT_ICONS)
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await axios.get(`${baseUrl}/auth/user`, {
					withCredentials: true,
					headers: { Accept: "application/json" },
				})
				if (res.data?.data) {
					setIsAuthenticated(true)
					const saved = localStorage.getItem("fasor_favorites")
					if (saved) {
						setFavorites(JSON.parse(saved))
					}
				}
			} catch (err) {
				setIsAuthenticated(false)
			}
		}
		checkAuth()

		const fetchVenues = async () => {
			try {
				const response = await axios.get(`${baseUrl}/fasilitas`, {
					withCredentials: true,
					headers: { Accept: "application/json" },
				})

				const rawData = response.data?.data ?? response.data
				if (!Array.isArray(rawData)) {
					setVenues(ALL_VENUES)
					return
				}

				const mapped = (rawData as BackendFacility[]).map((f) => ({
					id: f.id_fasilitas,
					name: f.nama,
					sport: mapFacilityToSport(f.nama),
					image: mapFacilityToImage(f.nama),
					href: mapFacilityToHref(f.nama, f.id_fasilitas),
				}))

				setVenues(mapped.length ? mapped : ALL_VENUES)
			} catch {
				setVenues(ALL_VENUES)
			}

			// Merge with admin facilities from localStorage
			const localFasilitasStr = localStorage.getItem("fasilitas_data")
			let localFasilitas = []
			if (localFasilitasStr) {
				const parsed = JSON.parse(localFasilitasStr)
				// Ignore legacy localStorage data if it has the old names to prevent duplication
				if (!parsed.some((p: any) => p.nama === "GOR Bulutangkis ITS" || p.nama === "Stadion ITS" || p.nama === "GOR Futsal Outdoor")) {
					localFasilitas = parsed
				}
			}
			if (localFasilitas.length > 0) {
				try {
					const localMapped = localFasilitas.map((f: any) => ({
						id: f.id.toString(),
						name: f.nama,
						sport: mapFacilityToSport(f.olahraga) || f.olahraga.toLowerCase().replace(/\s/g, ""),
						image: f.image || mapFacilityToImage(f.nama),
						href: mapFacilityToHref(f.nama, f.id.toString()),
					}))
					setVenues(prev => {
						const existingIds = new Set(prev.map(v => v.name))
						const newVenues = localMapped.filter((v: any) => !existingIds.has(v.name))
						return [...prev, ...newVenues]
					})
				} catch (e) {
					console.error("Error parsing local fasilitas", e)
				}
			}
		}

		const fetchSports = () => {
			const localSports = localStorage.getItem("jenis_olahraga_data")
			if (localSports) {
				try {
					const parsedSports = JSON.parse(localSports)
					const localMapped = parsedSports.map((s: any) => ({
						key: s.nama.toLowerCase().replace(/\s/g, ""),
						label: s.nama,
						image: s.image,
						circleBg: "#E0E7FF",
						iconColor: "#4F46E5",
						tagIcon: GiShuttlecock, // Default icon fallback
					}))
					const existingKeys = new Set(SPORT_ICONS.map(s => s.key))
					const newSports = localMapped.filter((s: any) => !existingKeys.has(s.key))
					setDynamicSports([...SPORT_ICONS, ...newSports])
					
					// Update favorites to include new sports if not explicitly set
					setFavorites(prev => {
						const newKeys = newSports.map((s: any) => s.key)
						return Array.from(new Set([...prev, ...newKeys]))
					})
				} catch (e) {
					console.error("Error parsing local sports", e)
				}
			}
		}

		fetchVenues()
		fetchSports()
	}, [baseUrl])

	const handleOpenFavoritModal = () => {
		setTempFavorites([...favorites])
		setShowFavoritModal(true)
	}

	const handleSaveFavorit = () => {
		setFavorites(tempFavorites)
		localStorage.setItem("fasor_favorites", JSON.stringify(tempFavorites))
		setShowFavoritModal(false)
	}

	const displaySports = isAuthenticated ? dynamicSports.filter(s => favorites.includes(s.key as SportKey)) : dynamicSports

	const filtered = selected
		? venues.filter((v) => v.sport === selected)
		: showAll
			? venues
			: []

	return (
		<>
			<Box py={8} bg="white">
				<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
					<Box
						border="1px solid"
						borderColor="gray.200"
						borderRadius="xl"
						p={6}
						bg="white"
						boxShadow="sm"
					>
						<Text fontSize="lg" fontWeight="700" color="gray.800" mb={0.5}>
							Pilih Jenis Olahraga
						</Text>
						<Text fontSize="sm" color="gray.500" mb={5}>
							Klik kategori untuk melihat lapangan yang tersedia
						</Text>

						<Grid templateColumns={{ base: "repeat(3, 1fr)", sm: "repeat(4, 1fr)", md: "repeat(5, 1fr)" }} gap={1} mb={selected || showAll ? 6 : 0}>
							{displaySports.map((sport) => {
								const isSelected = selected === sport.key
								return (
									<Box
										key={sport.key}
										as="button"
										onClick={() => {
											if (sport.key === "lari" || sport.key === "panjattebing") {
												setShowWaModal(true)
												return
											}
											setSelected(isSelected ? null : sport.key as SportKey)
											setShowAll(false)
										}}
										textAlign="center"
										py={3}
										px={2}
										borderRadius="xl"
										bg={isSelected ? "gray.100" : "transparent"}
										_hover={{ bg: "gray.100" }}
										transition="all 0.15s"
										cursor="pointer"
										outline="none"
									>
										<Flex justify="center" mb={2}>
											<Box
												w="72px"
												h="72px"
												borderRadius="full"
												bg={sport.circleBg}
												display="flex"
												alignItems="center"
												justifyContent="center"
												position="relative"
												overflow="hidden"
												flexShrink={0}
											>
												{sport.image ? (
													<Image
														src={sport.image}
														alt={sport.label}
														fill
														style={{ objectFit: "contain", padding: "12px" }}
													/>
												) : (
													<Icon as={sport.icon} color={sport.iconColor} boxSize={9} />
												)}
											</Box>
										</Flex>
										<Text
											fontSize="xs"
											fontWeight={isSelected ? "700" : "500"}
											color={isSelected ? "gray.800" : "gray.600"}
										>
											{sport.label}
										</Text>
									</Box>
								)
							})}

							<Box
								as="button"
								onClick={() => {
									setSelected(null)
									setShowAll((v) => !v)
								}}
								textAlign="center"
								py={3}
								px={2}
								borderRadius="xl"
								bg={!selected && showAll ? "gray.100" : "transparent"}
								_hover={{ bg: "gray.100" }}
								transition="all 0.15s"
								cursor="pointer"
								outline="none"
							>
								<Flex justify="center" mb={2}>
									<Box
										w="72px"
										h="72px"
										borderRadius="full"
										bg="gray.100"
										display="flex"
										alignItems="center"
										justifyContent="center"
										flexShrink={0}
									>
										<GridIconSemua />
									</Box>
								</Flex>
								<Text
									fontSize="xs"
									fontWeight={!selected && showAll ? "700" : "500"}
									color={!selected && showAll ? "gray.800" : "gray.600"}
								>
									Tampilkan Semua
								</Text>
							</Box>

							{isAuthenticated === null ? (
								<Box textAlign="center" py={3} px={2}>
									<Flex justify="center" mb={2}>
										<Skeleton w="72px" h="72px" borderRadius="full" />
									</Flex>
									<Skeleton h="14px" w="60px" mx="auto" />
								</Box>
							) : isAuthenticated === true ? (
								<Box
									as="button"
									onClick={handleOpenFavoritModal}
									textAlign="center"
									py={3}
									px={2}
									borderRadius="xl"
									bg="transparent"
									_hover={{ bg: "gray.100" }}
									transition="all 0.15s"
									cursor="pointer"
									outline="none"
								>
									<Flex justify="center" mb={2}>
										<Box
											w="72px"
											h="72px"
											borderRadius="full"
											bg="gray.100"
											display="flex"
											alignItems="center"
											justifyContent="center"
											flexShrink={0}
										>
											<Icon as={FaPen} color="gray.500" boxSize={6} />
										</Box>
									</Flex>
									<Text
										fontSize="xs"
										fontWeight="500"
										color="gray.600"
									>
										Edit Favorit
									</Text>
								</Box>
							) : null}
						</Grid>

						{(selected || showAll) && (
							<>
								<Text fontSize="sm" color="gray.500" mb={4}>
									{filtered.length} lapangan tersedia
								</Text>
								<Grid
									templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
									gap={4}
								>
									{filtered.map((venue) => (
										<VenueCard key={venue.id ?? venue.name} venue={venue} />
									))}
								</Grid>
							</>
						)}
					</Box>
				</Box>
			</Box>

		<Modal isOpen={showWaModal} onClose={() => setShowWaModal(false)} isCentered>
			<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(2px)" />
			<ModalContent borderRadius="xl" mx={4} maxW="380px">
				<ModalBody p={6}>
					<VStack spacing={5} textAlign="center">
						<Box w="56px" h="56px" borderRadius="full" bg="#25D366" display="flex" alignItems="center" justifyContent="center">
							<Icon as={FaWhatsapp} color="white" boxSize={7} />
						</Box>
						<Text fontSize="sm" color="gray.600" lineHeight="1.6">
							Untuk pemesanan lapangan/event ini hubungi nomor whatsapp admin fasor berikut
						</Text>
						<Button
							as="a"
							href="https://wa.me/6281139187999"
							target="_blank"
							rel="noopener noreferrer"
							bg="#25D366"
							color="white"
							borderRadius="full"
							fontWeight="600"
							leftIcon={<Icon as={FaWhatsapp} />}
							_hover={{ bg: "#1DB954" }}
							w="full"
						>
							0811-3918-7999
						</Button>
						<Button variant="ghost" size="sm" color="gray.500" onClick={() => setShowWaModal(false)}>
							Tutup
						</Button>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>

		<Modal isOpen={showFavoritModal} onClose={() => setShowFavoritModal(false)} isCentered size="md">
			<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(2px)" />
			<ModalContent borderRadius="xl" mx={4}>
				<Box p={4} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid" borderColor="gray.100">
					<Text fontSize="lg" fontWeight="700" color="gray.800">
						Edit Olahraga Favorit
					</Text>
					<Button size="sm" variant="ghost" onClick={() => setShowFavoritModal(false)}>
						✕
					</Button>
				</Box>
				<ModalBody p={4} maxH="60vh" overflowY="auto">
					<VStack spacing={3} align="stretch">
						{dynamicSports.map(sport => {
							const isSelected = tempFavorites.includes(sport.key as SportKey)
							return (
								<Flex
									key={sport.key}
									p={3}
									borderRadius="lg"
									border="2px solid"
									borderColor={isSelected ? "#008FFF" : "gray.100"}
									bg={isSelected ? "blue.50" : "gray.50"}
									alignItems="center"
									cursor="pointer"
									onClick={() => {
										if (isSelected) {
											setTempFavorites(prev => prev.filter(k => k !== sport.key))
										} else {
											setTempFavorites(prev => [...prev, sport.key as SportKey])
										}
									}}
								>
									<Box
										w="40px"
										h="40px"
										borderRadius="full"
										bg={sport.circleBg}
										display="flex"
										alignItems="center"
										justifyContent="center"
										mr={4}
									>
										{sport.image ? (
											<Image src={sport.image} alt={sport.label} width={24} height={24} style={{ objectFit: "contain" }} />
										) : (
											<Icon as={sport.icon} color={sport.iconColor} boxSize={5} />
										)}
									</Box>
									<Text fontSize="sm" fontWeight="600" color="gray.800">
										{sport.label}
									</Text>
								</Flex>
							)
						})}
					</VStack>
				</ModalBody>
				<Box p={4} borderTop="1px solid" borderColor="gray.100">
					<Button
						w="full"
						bg="#008FFF"
						color="white"
						_hover={{ bg: "#0070CC" }}
						borderRadius="lg"
						onClick={handleSaveFavorit}
					>
						Simpan
					</Button>
				</Box>
			</ModalContent>
		</Modal>
		</>
	)
}


const AnnouncementsSection = () => {
	const router = useRouter()
	
	return (
		<Box py={8} bg="gray.50">
			<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
				<Box bg="white" borderRadius="xl" boxShadow="sm" p={6}>
					<HStack
						mb={5}
						spacing={1}
						cursor="pointer"
						_hover={{ opacity: 0.8 }}
						width="fit-content"
						onClick={() => router.push("/pengumuman")}
					>
						<Text fontSize="lg" fontWeight="700" color="gray.800">
							Pengumuman Terbaru
						</Text>
						<Text fontSize="lg" fontWeight="700" color="gray.800">→</Text>
					</HStack>

					<VStack spacing={0} align="stretch">
						{useAnnouncements().slice(0, 5).map((item, i) => {
							const colors = CATEGORY_COLORS[item.category]
							return (
								<Box key={item.id}>
									{i > 0 && <Divider borderColor="gray.100" />}
									<Flex
										py={3}
										alignItems={{ base: "flex-start", sm: "center" }}
										justifyContent="space-between"
										gap={4}
										flexDir={{ base: "column", sm: "row" }}
										cursor="pointer"
										_hover={{ bg: "gray.50" }}
										borderRadius="lg"
										px={2}
										mx={-2}
										onClick={() => router.push(`/pengumuman/${item.id}`)}
									>
										<Box flex={1}>
											<Text fontSize="sm" fontWeight="600" color="gray.800">
												{item.title}
											</Text>
											<Text fontSize="xs" color="gray.500" mt={1} lineHeight="1.5" noOfLines={1}>
												{item.preview}
											</Text>
										</Box>
										<Box
											px={3}
											py={1}
											bg={colors.bg}
											color={colors.color}
											border="1px solid"
											borderColor={colors.border}
											borderRadius="full"
											fontSize="xs"
											fontWeight="600"
											whiteSpace="nowrap"
											flexShrink={0}
										>
											{item.category}
										</Box>
									</Flex>
								</Box>
							)
						})}
					</VStack>
				</Box>
			</Box>
		</Box>
	)
}


const LandingPage = () => (
	<>
		<Head>
			<title>Fasor ITS - Sistem Reservasi Fasilitas Olahraga ITS</title>
			<meta
				name="description"
				content="Sistem Reservasi Fasilitas Olahraga Institut Teknologi Sepuluh Nopember"
			/>
		</Head>
		<Box minH="100vh" bg="gray.50">
			<FasorNavbar />
			<HeroSection />
			<SportFilterSection />
			<AnnouncementsSection />
			<FasorFooter />
		</Box>
	</>
)

export default LandingPage


