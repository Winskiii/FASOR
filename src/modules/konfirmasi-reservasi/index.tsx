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
	Input,
	Checkbox,
	Divider,
	Icon,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	useToast,
	Alert,
	AlertIcon,
	Spinner,
	ModalHeader,
	ModalCloseButton,
	ModalFooter,
	OrderedList,
	ListItem,
} from "@chakra-ui/react"
import Image from "next/image"
import { FaArrowLeft } from "react-icons/fa"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import FasorFooter from "@/components/organisms/FasorFooter"


const formatRupiah = (n: number) =>
	"Rp" + n.toLocaleString("id-ID").replace(/\./g, ".")

const parseDateToISO = (dateStr: string) => {
	const months: Record<string, string> = {
		"Januari": "01", "Februari": "02", "Maret": "03", "April": "04", "Mei": "05", "Juni": "06",
		"Juli": "07", "Agustus": "08", "September": "09", "Oktober": "10", "November": "11", "Desember": "12",
		"Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "Jun": "06", "Jul": "07", "Agu": "08", "Sep": "09", "Okt": "10", "Nov": "11", "Des": "12"
	}
	
	const parts = dateStr.split(", ")[1].split(" ")
	const day = parts[0].padStart(2, "0")
	const month = months[parts[1]] || "01"
	const year = parts[2]
	
	return `${year}-${month}-${day}`
}

const parseLocalDate = (dateVal: string | Date) => {
	if (dateVal instanceof Date) return dateVal;
	if (!dateVal) return new Date();
	const cleanDate = dateVal.includes("T") ? dateVal.split("T")[0] : dateVal;
	const [y, m, d] = cleanDate.split("-").map(Number);
	return new Date(y, m - 1, d);
}


const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<VStack align="start" spacing={0}>
		<Text fontSize="xs" color="gray.500">
			{label}
		</Text>
		<Text fontSize="sm" fontWeight="700" color="gray.800">
			{value}
		</Text>
	</VStack>
)


const KonfirmasiReservasiPage = () => {
	const router = useRouter()
	const toast = useToast()
	const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://amu-fasor.local'
	const baseUrl = `${API_URL}`
	const {
		id_fasilitas,
		facility,
		image,
		lapangan,
		tanggal,
		tanggalList,
		tipe,
		waktu,
		hargaPerUnit,
		satuan,
		durasi,
		total,
		courtDetails,
	} = router.query as Record<string, string>

	const isRutin = tipe === "rutin"
	const rutinDates = isRutin && tanggalList ? tanggalList.split("|") : []
	
	let parsedCourtDetails: any[] = []
	try {
		if (courtDetails) parsedCourtDetails = JSON.parse(courtDetails)
	} catch (e) {}

	const lapanganList = lapangan ? lapangan.split("|") : []

	const hargaNum = Number(hargaPerUnit) || 0
	const totalNum = Number(total) || 0
	const durasiNum = Number(durasi) || 0

	const [namaLengkap, setNamaLengkap] = useState("Daffa Diandra Rizky")
	const [email, setEmail] = useState("kiki@gmail.com")
	const [noTelp, setNoTelp] = useState("085708049979")
	const [userType, setUserType] = useState("guest")
	const [setuju, setSetuju] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isAuthLoading, setIsAuthLoading] = useState(true)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [error, setError] = useState("")
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false)

	const isValidEmail = (str: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
	};

	const isFormValid = namaLengkap.trim() !== "" && isValidEmail(email) && noTelp.trim() !== ""

	useEffect(() => {
		if (!router.isReady) return

		const fetchMe = async () => {
			setIsAuthLoading(true)
			setError("")

			try {
				const res = await axios.get(`${API_URL}/auth/user`, {
					withCredentials: true,
					headers: { Accept: "application/json" },
				})

				const me = res.data?.data
				if (!me) throw new Error("Unauthenticated")

				setIsAuthenticated(true)
				setNamaLengkap(me.name ?? "")
				setEmail(me.email ?? me.preferred_username ?? "")
				setNoTelp(me.phone ?? "")
				setUserType(me.user_type ?? "guest")
			} catch (err: any) {
				setIsAuthenticated(false)

				if (err?.response?.status === 401) {
					return
				}

				setError("Server tidak dapat dijangkau. Pastikan backend bisa diakses dan sertifikat https sudah dipercaya.")
			} finally {
				setIsAuthLoading(false)
			}
		}

		fetchMe()
	}, [router.isReady, router.asPath, baseUrl])

	const handleKonfirmasi = async () => {
		if (!isFormValid || !setuju) return
		
		setIsLoading(true)
		setError("")

		const sanitizedNama = sanitizeText(namaLengkap).trim()
		const sanitizedEmail = sanitizeText(email).trim()
		const sanitizedNoTelp = sanitizeText(noTelp).trim()

		if (!sanitizedNama || !sanitizedEmail || !sanitizedNoTelp) {
			setError("Data tidak valid. Input tidak boleh kosong atau mengandung karakter script berbahaya (XSS).")
			setIsLoading(false)
			setIsModalOpen(false)
			return
		}

		// Blacklist check
		const existingStr = localStorage.getItem("fasor_blacklisted_numbers")
		const blacklisted = existingStr ? JSON.parse(existingStr) : []
		if (blacklisted.includes(sanitizedNoTelp)) {
			setIsLoading(false)
			setIsModalOpen(false)
			setIsBlacklistModalOpen(true)
			return
		}

		try {
			const [jamMulai, jamSelesai] = waktu.split(" - ")
			const courtsToBook = lapanganList.length > 0 ? lapanganList : [lapangan || undefined]

			if (isRutin && parsedCourtDetails.length > 0) {
				const rutinGroupId = crypto.randomUUID()
				let firstCode = ""
				for (const court of parsedCourtDetails) {
					const datesToBook = court.availableDates.map((d: string) => parseLocalDate(d))
					const sessionCount = datesToBook.length
					for (const d of datesToBook) {
						const yyyy = d.getFullYear()
						const mm = String(d.getMonth() + 1).padStart(2, "0")
						const dd = String(d.getDate()).padStart(2, "0")
						const isoDateStr = `${yyyy}-${mm}-${dd}`
						
						const res = await axios.post(
							`${baseUrl}/fasilitas/reservasi`,
							{
								id_fasilitas: id_fasilitas || "31a6c102-0e7c-4922-81be-d0a7adb963ea",
								lapangan: court.courtName || undefined,
								jam_mulai: jamMulai,
								jam_selesai: jamSelesai,
								nama_pemesan: sanitizedNama,
								email_pemesan: sanitizedEmail,
								no_telp_pemesan: sanitizedNoTelp,
								user_type: isAuthenticated ? undefined : "guest",
								tgl_reservasi: isoDateStr,
								rutin_group: rutinGroupId,
								rutin_total_sessions: sessionCount,
							},
							{
								withCredentials: true,
								headers: {
									Accept: "application/json",
									"X-Requested-With": "XMLHttpRequest",
								},
							}
						)
						if (res?.data?.status === "success" && !firstCode) {
							firstCode = res.data.data.kode_booking as string
						}
					}
				}
				if (firstCode) {
					router.push({
						pathname: "/detail-pemesanan",
						query: {
							code: firstCode,
							step: "0",
							tipe: "rutin",
							tanggalList: tanggalList || "",
							total: String(totalNum),
							hargaPerUnit: String(hargaNum),
							satuan: satuan || "Jam",
							durasi: String(durasiNum),
						},
					})
				}
			} else {
				const response = await axios.post(
					`${baseUrl}/fasilitas/reservasi`,
					{
						id_fasilitas: id_fasilitas || "31a6c102-0e7c-4922-81be-d0a7adb963ea",
						lapangan: courtsToBook.filter(Boolean).length > 0 ? courtsToBook.filter(Boolean) : undefined,
						jam_mulai: jamMulai,
						jam_selesai: jamSelesai,
						nama_pemesan: sanitizedNama,
						email_pemesan: sanitizedEmail,
						no_telp_pemesan: sanitizedNoTelp,
						user_type: isAuthenticated ? undefined : "guest",
						tgl_reservasi: parseDateToISO(tanggal),
					},
					{
						withCredentials: true,
						headers: {
							Accept: "application/json",
							"X-Requested-With": "XMLHttpRequest",
						},
					}
				)
				
				const kode = "FSR9A2X"
				router.push(`/detail-pemesanan?code=${encodeURIComponent(kode)}&step=0`)
			}
		} catch (err: any) {
			console.error("Reservation failed:", err)
			setError(err.response?.data?.message || "Terjadi kesalahan saat membuat reservasi. Silakan coba lagi.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Box minH="100vh" bg="gray.50">
			<FasorNavbar />

			<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
				<Text fontSize="2xl" fontWeight="800" color="gray.800" mb={1}>
					Konfirmasi Reservasi
				</Text>
				<Text fontSize="sm" color="gray.500" mb={8}>
					Periksa kembali detail reservasi Anda sebelum melanjutkan
				</Text>

				<Grid
					templateColumns={{ base: "1fr", md: "5fr 4fr" }}
					gap={6}
					alignItems="start"
				>
					<Box
						border="1px solid"
						borderColor="gray.200"
						borderRadius="xl"
						overflow="hidden"
						bg="white"
						boxShadow="sm"
					>
						{image ? (
							<Box position="relative" h={{ base: "200px", md: "260px" }}>
								<Image
									src={image}
									alt={facility || "Venue"}
									fill
									style={{ objectFit: "cover" }}
									priority
								/>
							</Box>
						) : (
							<Box h={{ base: "200px", md: "260px" }} bg="gray.100" />
						)}

						<Box p={6}>
							<Text fontSize="md" fontWeight="700" color="gray.800" mb={4}>
								Ringkasan Reservasi
							</Text>

							<VStack spacing={4} align="stretch" mb={6}>
								<InfoRow label="Fasilitas" value={facility || "-"} />
								<InfoRow label="Lapangan" value={lapanganList.length > 0 ? lapanganList.join(", ") : (lapangan || "-")} />
							{isRutin && <InfoRow label="Jenis Latihan" value="Latihan Rutin (4 Pertemuan)" />}
							{isRutin ? (
								<VStack align="start" spacing={1}>
									<Text fontSize="xs" color="gray.500">Tanggal</Text>
									{rutinDates.map((d, i) => (
										<Text key={i} fontSize="sm" fontWeight="700" color="gray.800">
											Pertemuan {i + 1}: {d}
										</Text>
									))}
								</VStack>
							) : (
								<InfoRow label="Tanggal" value={tanggal || "-"} />
							)}
								<InfoRow label="Waktu" value={waktu || "-"} />
								<InfoRow label="Tipe Pengguna" value={userType === "internal" ? "Internal" : userType === "external" ? "Eksternal" : "Guest"} />
							</VStack>

							<Divider borderColor="gray.200" mb={6} />

							<VStack spacing={3} align="stretch" mb={4}>
								<HStack justify="space-between">
									<Text fontSize="sm" color="gray.500">
										Harga per {satuan || "unit"}
									</Text>
									<Text fontSize="sm" color="gray.700">
										{formatRupiah(hargaNum)}
									</Text>
								</HStack>
								<HStack justify="space-between">
									<Text fontSize="sm" color="gray.500">
										Durasi
									</Text>
									<Text fontSize="sm" color="gray.700">
										{durasiNum} {satuan || "unit"}
									</Text>
								</HStack>
								{isRutin && (
									<HStack justify="space-between">
										<Text fontSize="sm" color="gray.500">
											Jumlah Pertemuan
										</Text>
										<Text fontSize="sm" color="gray.700">
											4 minggu
										</Text>
									</HStack>
								)}
							</VStack>

							<HStack
								justify="space-between"
								bg="blue.50"
								px={4}
								py={3}
								borderRadius="lg"
							>
								<Text fontSize="md" fontWeight="700" color="gray.800">
									Total Pembayaran
								</Text>
								<Text fontSize="xl" fontWeight="800" color="#008FFF">
									{formatRupiah(totalNum)}
								</Text>
							</HStack>

							<Button
								variant="ghost"
								leftIcon={<Icon as={FaArrowLeft} />}
								color="gray.600"
								mt={6}
								px={0}
								_hover={{ bg: "transparent", color: "gray.800" }}
								onClick={() => router.back()}
							>
								Kembali
							</Button>
						</Box>
					</Box>

					<Box
						border="1px solid"
						borderColor="gray.200"
						borderRadius="xl"
						bg="white"
						boxShadow="sm"
						p={6}
					>
						<Text fontSize="lg" fontWeight="700" color="gray.800" mb={6}>
							Data Pemesan
						</Text>

						{isAuthLoading && (
							<Flex align="center" justify="center" py={6}>
								<Spinner />
							</Flex>
						)}

						<VStack spacing={5} align="stretch">
							{error && (
								<Alert status="error" borderRadius="lg" fontSize="sm">
									<AlertIcon />
									{error}
								</Alert>
							)}
							<Box>
								<Text fontSize="sm" fontWeight="600" color="gray.700" mb={1}>
									Nama Lengkap{" "}
									<Text as="span" color="red.500">
										*
									</Text>
								</Text>
								<Input
									placeholder="Masukkan Nama Lengkap"
									value={namaLengkap}
									onChange={(e: any) => setNamaLengkap(e.target.value)}
									isDisabled={isAuthLoading}
									borderRadius="lg"
									borderColor="gray.300"
									bg="white"
									color="gray.800"
									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
							</Box>

							<Box>
								<Text fontSize="sm" fontWeight="600" color="gray.700" mb={1}>
									Email{" "}
									<Text as="span" color="red.500">
										*
									</Text>
								</Text>
								<Input
									placeholder="nama@email.com"
									type="email"
									value={email}
									onChange={(e: any) => setEmail(e.target.value)}
									isDisabled={isAuthLoading}
									borderRadius="lg"
									borderColor="gray.300"								bg="white"
								color="gray.800"									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
							</Box>

							<Box>
								<Text fontSize="sm" fontWeight="600" color="gray.700" mb={1}>
									Nomor Telepon{" "}
									<Text as="span" color="red.500">
										*
									</Text>
								</Text>
								<Input
									placeholder="08xxxxxxxxxx"
									type="tel"
									value={noTelp}
									onChange={(e: any) => setNoTelp(e.target.value.replace(/\D/g, ""))}
									isDisabled={isAuthLoading}
									borderRadius="lg"
									borderColor="gray.300"								bg="white"
								color="gray.800"									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
							</Box>

							<Button
								w="full"
								bg={isFormValid ? "#008FFF" : "gray.300"}
								color="white"
								borderRadius="lg"
								fontWeight="600"
								size="lg"
								_hover={{ bg: isFormValid ? "#0070CC" : "gray.300" }}
								cursor={isFormValid ? "pointer" : "not-allowed"}
								isDisabled={!isFormValid || isAuthLoading}
								mt={6}
								onClick={() => setIsModalOpen(true)}
							>
								Konfirmasi Reservasi
							</Button>

							<Text fontSize="xs" color="gray.500" textAlign="center">
								Reservasi Anda akan diverifikasi oleh admin sebelum pembayaran diproses.
							</Text>
						</VStack>
					</Box>
				</Grid>
			</Box>

			<FasorFooter />

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="2xl" scrollBehavior="inside">
				<ModalOverlay />
				<ModalContent borderRadius="xl">
					<ModalHeader color="gray.800" fontWeight="800">
						KONSEP PERNYATAAN dan PERSETUJUAN
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack align="start" spacing={4} color="gray.700" fontSize="sm" lineHeight="tall">
							<Text>
								Sebelum memastikan sewa lapangan fasilitas olahraga ITS, Saya bersedia dan setuju untuk mengikuti semua ketentuan yang diberlakukan oleh pihak pengelola diantaranya:
							</Text>
							<OrderedList spacing={3} pl={4}>
								<ListItem>Menggunakan fasilitas olahraga sesuai dengan tugas pokok dan fungsinya, misal; lapangan bulutangkis digunakan bulutangkis, lapangan basket digunakan untuk basket, dsb.</ListItem>
								<ListItem>Menggunakan lapangan sudah sesuai dengan jenis kegiatan yang didaftarkan, misal: latihan untuk latihan, turnamen untuk turnamen.</ListItem>
								<ListItem>Menggunakan lapangan sesuai dengan kategori pengguna, Dosen, Tendik dan Mahasiswa mendaftar di kategori internal, masyarakat umum mendaftar di kategori eksternal.</ListItem>
								<ListItem>Menggunakan perlengkapan olahraga sesuai dengan jenis lapangan yang disewa, misalnya lapangan bulutangkis harus menggunakan sepatu khusus bulutangkis, lapangan tennis harus menggunakan sepatu khusus tennis, dan seterusnya.</ListItem>
							</OrderedList>
							<Text>
								Jika setelah memastikan sewa, dan ternyata pada saat hari H terjadi pelanggaran-pelanggaran tersebut diatas, maka Saya bertanggung jawab penuh dan memastikan untuk mentaati ketentuan dari pihak pengelola, yaitu:
							</Text>
							<Text fontWeight="bold" color="red.600">
								Saya bersedia menerima sanksi berupa pemberhentian penggunaan lapangan pada saat hari H dan tidak akan meminta ganti rugi dalam bentuk apapun.
							</Text>
						</VStack>
						
						<Box mt={6}>
							<Checkbox
								isChecked={setuju}
								onChange={(e: any) => setSetuju(e.target.checked)}
								colorScheme="blue"
								alignItems="start"
							>
								<Text fontSize="sm" fontWeight="600" color="gray.800">
									Saya menyetujui Pernyataan dan Persetujuan di atas.
								</Text>
							</Checkbox>
						</Box>
					</ModalBody>
					<ModalFooter borderTop="1px solid" borderColor="gray.100">
						<Button
							bg="#008FFF"
							color="white"
							_hover={{ bg: "#0070CC" }}
							borderRadius="lg"
							isDisabled={!setuju || isLoading}
							isLoading={isLoading}
							loadingText="Memproses..."
							onClick={handleKonfirmasi}
						>
							Simpan Pesanan
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Blacklist Modal */}
			<Modal isOpen={isBlacklistModalOpen} onClose={() => setIsBlacklistModalOpen(false)} isCentered size="sm">
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
				<ModalContent borderRadius="xl">
					<ModalHeader color="red.600" fontWeight="800" borderBottom="1px solid" borderColor="gray.100" display="flex" alignItems="center" gap={2}>
						Peringatan Pelanggaran
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody py={6}>
						<VStack spacing={4} align="center" textAlign="center">
							<Box w="60px" h="60px" borderRadius="full" bg="red.100" display="flex" alignItems="center" justifyContent="center">
								<Text fontSize="3xl">⚠️</Text>
							</Box>
							<Text fontSize="md" fontWeight="600" color="red.600" lineHeight="1.5">
								Anda sudah tercatat kedalam pengguna yang telah melanggar aturan Fasor ITS
							</Text>
							<Text fontSize="sm" color="gray.600">
								Pemesanan tidak dapat dilanjutkan. Silakan hubungi admin untuk informasi lebih lanjut.
							</Text>
						</VStack>
					</ModalBody>
					<ModalFooter borderTop="1px solid" borderColor="gray.100">
						<Button colorScheme="red" w="full" borderRadius="lg" onClick={() => setIsBlacklistModalOpen(false)}>
							Tutup
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	)
}

export default KonfirmasiReservasiPage
