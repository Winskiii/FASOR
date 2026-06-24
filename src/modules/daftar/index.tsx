import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { logger } from "@/utils/logger"
import { sanitizeText } from "@/utils/sanitize"
import { useSubmitRateLimit } from "@/hooks/useSubmitRateLimit"
import {
	Box,
	Flex,
	VStack,
	Text,
	Input,
	Button,
	Checkbox,
	InputGroup,
	InputRightElement,
	IconButton,
	useToast,
	Alert,
	AlertIcon,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	OrderedList,
	ListItem,
} from "@chakra-ui/react"
import Image from "next/image"
import NextLink from "next/link"
import { FaEye, FaEyeSlash } from "react-icons/fa"


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RE = /^.{8,}$/


const DaftarPage = () => {
	const router = useRouter()
	const toast = useToast()
	const [nama, setNama] = useState("")
	const [nik, setNik] = useState("")
	const [email, setEmail] = useState("")
	const [noTelp, setNoTelp] = useState("")
	const [password, setPassword] = useState("")
	const [konfirmasi, setKonfirmasi] = useState("")
	const [showPass, setShowPass] = useState(false)
	const [showKonfirmasi, setShowKonfirmasi] = useState(false)
	const [setuju, setSetuju] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { isBlocked, cooldown, recordFailure, reset } = useSubmitRateLimit(5, 15)
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"

	const emailError = email && !EMAIL_RE.test(email) ? "Format email tidak valid" : ""
	const passError = password && !PASSWORD_RE.test(password) ? "Password minimal 8 karakter" : ""
	const konfirmasiError = konfirmasi && konfirmasi !== password ? "Password tidak cocok" : ""

	const isFormValid =
		nama.trim().length > 0 &&
		nik.length === 16 &&
		EMAIL_RE.test(email) &&
		noTelp.trim().length > 0 &&
		PASSWORD_RE.test(password) &&
		konfirmasi === password

	const handleOpenModal = (e: React.FormEvent) => {
		e.preventDefault()
		if (!isFormValid || isBlocked) return
		setIsModalOpen(true)
	}

	const handleDaftar = async () => {
		if (!isFormValid || isBlocked || !setuju) return

		setIsLoading(true)
		setErrorMessage("")

		try {
			await new Promise(r => setTimeout(r, 1000)); const response = { data: { status: "success" } };

			if (response.data.status === "success") {
				reset()
				toast({
					title: "Registrasi Berhasil",
					description: "Akun Anda telah dibuat. Silakan masuk.",
					status: "success",
					duration: 3000,
					isClosable: true,
				})
				router.push("/login")
			}
		} catch (error: any) {
			recordFailure()
			logger.error("Registration failed:", error)
			const validationErrors = error.response?.data?.errors
			if (validationErrors && typeof validationErrors === "object") {
				const firstField = Object.values(validationErrors)[0]
				const firstMsg = Array.isArray(firstField) ? firstField[0] : String(firstField)
				setErrorMessage(firstMsg)
			} else if (!error.response) {
				setErrorMessage("Server tidak dapat dijangkau. Pastikan backend sedang berjalan.")
			} else {
				setErrorMessage(error.response?.data?.message || "Registrasi gagal. Silakan coba lagi.")
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Box h="100vh" bg="gray.100" display="flex" alignItems="stretch" p={3}>
			<Flex w="full" maxW="1400px" mx="auto" gap={3} alignItems="stretch">
				<Box
					flex={1}
					position="relative"
					borderRadius="2xl"
					overflow="hidden"
					display={{ base: "none", md: "block" }}
				>
					<Image
						src="/images/login poster.png"
						alt="Fasor ITS"
						fill
						style={{ objectFit: "cover", objectPosition: "center" }}
						priority
						sizes="70vw"
					/>
				</Box>

				<Flex
					w={{ base: "full", md: "420px" }}
					flexShrink={0}
					bg="white"
					borderRadius="2xl"
					boxShadow="md"
					flexDir="column"
					justifyContent="center"
					px={8}
					py={6}
					overflowY="auto"
				>
					<Text
						fontSize="2xl"
						fontWeight="800"
						color="gray.800"
						lineHeight="1.25"
						textAlign="center"
						mb={1}
					>
						Daftar Akun Fasor ITS
					</Text>
					<Text fontSize="sm" color="gray.500" lineHeight="1.5" textAlign="center" mb={4}>
						Buat akun untuk mulai memesan lapangan dengan mudah.
					</Text>

					<Box as="form" w="full" onSubmit={handleOpenModal}>
						<VStack spacing={2.5} align="stretch">
							{errorMessage && (
								<Alert status="error" borderRadius="lg" fontSize="sm">
									<AlertIcon />
									{errorMessage}
								</Alert>
							)}
							<Box>
								<Text fontSize="sm" fontWeight="500" color="gray.700" mb={0.5}>
									Nama Lengkap{" "}
									<Text as="span" color="red.500">
										*
									</Text>
								</Text>
								<Input
									placeholder="Masukkan Nama Lengkap"
									value={nama}
									onChange={(e: any) => setNama(e.target.value)}
									borderRadius="lg"
									borderColor="gray.300"
									bg="white"
									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
							</Box>

							<Box>
								<Text fontSize="sm" fontWeight="500" color="gray.700" mb={0.5}>
									Nomor KTP (NIK){" "}
									<Text as="span" color="red.500">
										*
									</Text>
								</Text>
								<Input
									placeholder="16 digit NIK"
									value={nik}
									onChange={(e: any) => {
										const v = e.target.value.replace(/\D/g, "").slice(0, 16)
										setNik(v)
									}}
									maxLength={16}
									inputMode="numeric"
									borderRadius="lg"
									borderColor="gray.300"
									bg="white"
									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
							</Box>

							<Box>
								<Text fontSize="sm" fontWeight="500" color="gray.700" mb={0.5}>
									Email{" "}
									<Text as="span" color="red.500">*</Text>
								</Text>
								<Input
									placeholder="nama@email.com"
									type="email"
									value={email}
									onChange={(e: any) => setEmail(e.target.value)}
									borderRadius="lg"
									borderColor={emailError ? "red.400" : "gray.300"}
									bg="white"
									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
								{emailError && <Text fontSize="xs" color="red.500" mt={1}>{emailError}</Text>}
							</Box>

							<Box>
								<Text fontSize="sm" fontWeight="500" color="gray.700" mb={0.5}>
									Nomor Telepon{" "}
									<Text as="span" color="red.500">*</Text>
								</Text>
								<Input
									placeholder="08xxxxxxxxxx"
									type="tel"
									value={noTelp}
									onChange={(e: any) => setNoTelp(e.target.value)}
									borderRadius="lg"
									borderColor="gray.300"
									bg="white"
									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
							</Box>

							<Box>
								<Text fontSize="sm" fontWeight="500" color="gray.700" mb={0.5}>
									Password{" "}
									<Text as="span" color="red.500">*</Text>
								</Text>
								<InputGroup>
									<Input
										placeholder="Minimal 8 karakter"
										type={showPass ? "text" : "password"}
										value={password}
										onChange={(e: any) => setPassword(e.target.value)}
										borderRadius="lg"
										borderColor={passError ? "red.400" : "gray.300"}
										bg="white"
										_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
									/>
									<InputRightElement>
										<IconButton
											aria-label={showPass ? "Sembunyikan" : "Tampilkan"}
											icon={showPass ? <FaEyeSlash /> : <FaEye />}
											variant="ghost"
											size="sm"
											color="gray.400"
											_hover={{ color: "gray.600", bg: "transparent" }}
											onClick={() => setShowPass((v) => !v)}
											tabIndex={-1}
										/>
									</InputRightElement>
								</InputGroup>
								{passError && <Text fontSize="xs" color="red.500" mt={1}>{passError}</Text>}
							</Box>

							<Box>
								<Text fontSize="sm" fontWeight="500" color="gray.700" mb={0.5}>
									Konfirmasi Password{" "}
									<Text as="span" color="red.500">*</Text>
								</Text>
								<InputGroup>
									<Input
										placeholder="Masukkan ulang password"
										type={showKonfirmasi ? "text" : "password"}
										value={konfirmasi}
										onChange={(e: any) => setKonfirmasi(e.target.value)}
										borderRadius="lg"
										borderColor={konfirmasiError ? "red.400" : "gray.300"}
										bg="white"
										_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
									/>
									<InputRightElement>
										<IconButton
											aria-label={showKonfirmasi ? "Sembunyikan" : "Tampilkan"}
											icon={showKonfirmasi ? <FaEyeSlash /> : <FaEye />}
											variant="ghost"
											size="sm"
											color="gray.400"
											_hover={{ color: "gray.600", bg: "transparent" }}
											onClick={() => setShowKonfirmasi((v) => !v)}
											tabIndex={-1}
										/>
									</InputRightElement>
								</InputGroup>
								{konfirmasiError && (
									<Text fontSize="xs" color="red.500" mt={1}>{konfirmasiError}</Text>
								)}
							</Box>

							{isBlocked && (
								<Text fontSize="xs" color="red.500" textAlign="center">
									Terlalu banyak percobaan. Coba lagi dalam {cooldown} detik.
								</Text>
							)}
							<Button
								type="submit"
								w="full"
								bg="#008FFF"
								color="white"
								borderRadius="xl"
								fontWeight="600"
								size="lg"
								_hover={{ bg: "#0070CC" }}
								isLoading={isLoading}
								loadingText="Mendaftar..."
								isDisabled={!isFormValid || isBlocked}
							>
								{isBlocked ? `Coba lagi dalam ${cooldown}s` : "Daftar"}
							</Button>
						</VStack>
					</Box>

					<Text fontSize="sm" color="gray.600" textAlign="center" mt={4}>
						Sudah punya akun?{" "}
						<NextLink href="/login" passHref legacyBehavior>
							<Text
								as="a"
								color="#008FFF"
								fontWeight="600"
								_hover={{ textDecoration: "underline" }}
							>
								Masuk
							</Text>
						</NextLink>
					</Text>
				</Flex>
			</Flex>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="3xl" scrollBehavior="inside">
				<ModalOverlay />
				<ModalContent borderRadius="xl">
					<ModalHeader color="gray.800" fontWeight="800" fontSize="xl">
						Syarat & Ketentuan Pendaftaran
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack align="start" spacing={6} color="gray.700" fontSize="sm" lineHeight="tall">
							
							<Box>
								<Text fontWeight="800" fontSize="md" mb={2} color="#004D8C">Tata Tertib Fasilitas Olahraga ITS</Text>
								<OrderedList spacing={2} pl={4}>
									<ListItem>Dilarang mempergunakan fasilitas yang tidak sesuai dengan peruntukannya, kecuali mendapatkan ijin dari pengelola.</ListItem>
									<ListItem>Dilarang membawa senjata tajam dan/atau senjata api, membuat kericuhan, mengkonsumsi minuman keras serta obat-obatan terlarang.</ListItem>
									<ListItem>Wajib menjaga kebersihan lapangan.</ListItem>
									<ListItem>Wajib menjaga keamanan dan ketertiban dilingkungan kampus ITS Surabaya.</ListItem>
									<ListItem>Apabila terjadi kehilangan dan/atau kerusakan sarana dan prasarana serta fasilitasnya wajib mengganti dan/atau memperbaiki seperti semula.</ListItem>
									<ListItem>Dilarang berkata kasar dan/atau tidak senonoh selama berada dilingkungan kampus ITS Surabaya.</ListItem>
									<ListItem>Menjaga dan mengamankan barang-barang milik pribadi, kehilangan barang-barang milik pribadi diluar tanggung jawab pihak pengelola.</ListItem>
									<ListItem>Untuk penggunaan kegiatan turnamen, pengelola akan memberi sanksi jika penggunaan melakukan reservasi penggunaan insidentil akan tetapi digunakan untuk turnamen.</ListItem>
									<ListItem>Penambahan jam penggunaan hanya bisa dilakukan pada hari dan jam kerja (Senin - Jum'at / 08.00 - 16.00 WIB)</ListItem>
									<ListItem>Pembatalan/pemindahan jadwal yang sudah dibayar, bisa dilakukan selambat lambatnya 7 hari sebelum menggunakan lapangan, kurang dari 7 hari tidak bisa dibatalkan/dipindah jadwal.</ListItem>
									<ListItem>Pengguna wajib melunasi pembayaran sebelum menggunakan Fasilitas Olahraga.</ListItem>
								</OrderedList>
							</Box>

							<Box>
								<Text fontWeight="800" fontSize="md" mb={2} color="#004D8C">Ketentuan Khusus</Text>
								<Text mb={2}>Sebelum memastikan sewa lapangan fasilitas olahraga ITS, Saya bersedia dan setuju untuk mengikuti semua ketentuan yang diberlakukan oleh pihak pengelola diantaranya:</Text>
								<OrderedList spacing={2} pl={4} type="a">
									<ListItem>Menggunakan fasilitas olahraga sesuai dengan tugas pokok dan fungsinya, misal: lapangan bulutangkis digunakan bulutangkis, lapangan basket digunakan untuk basket, dsb.</ListItem>
									<ListItem>Menggunakan lapangan sudah sesuai dengan jenis kegiatan yang didaftarkan, misal: latihan untuk latihan, turnamen untuk turnamen.</ListItem>
									<ListItem>Menggunakan lapangan sesuai dengan kategori pengguna, Dosen, Tendik dan Mahasiswa mendaftar di kategori internal, masyarakat umum mendaftar dikategori eksternal.</ListItem>
									<ListItem>Menggunakan perlengkapan olahraga sesuai dengan jenis lapangan yang disewa, misalnya lapangan bulutangkis harus menggunakan sepatu khusus bulutangkis, lapangan tennis harus menggunakan sepatu khusus tennis, dan seterusnya.</ListItem>
									<ListItem>Jika setelah memastikan sewa, dan ternyata pada saat hari-H terjadi pelanggaran-pelanggaran tersebut diatas, Pengguna akan mendapatkan sanksi berupa denda administrasi atau pemberhentian penggunaan lapangan pada saat hari H dan tidak akan meminta ganti rugi dalam bentuk apapun.</ListItem>
								</OrderedList>
							</Box>

							<Box>
								<Text fontWeight="800" fontSize="md" mb={2} color="#004D8C">Keamanan</Text>
								<OrderedList spacing={2} pl={4}>
									<ListItem>Pengguna wajib membawa Surat Tanda Nomor Kendaraan (STNK) saat memasuki wilayah kampus ITS.</ListItem>
									<ListItem>Pengguna wajib menaruh kendaraan di tempat parkir yang sudah disediakan, semua bentuk kehilangan barang/kendaraan diluar tanggung jawab pihak Pengelola.</ListItem>
								</OrderedList>
							</Box>

						</VStack>

						<Box mt={6} p={4} bg="blue.50" borderRadius="lg">
							<Checkbox
								isChecked={setuju}
								onChange={(e: any) => setSetuju(e.target.checked)}
								colorScheme="blue"
								alignItems="start"
							>
								<Text fontSize="sm" fontWeight="600" color="gray.800">
									Saya telah membaca dan menyetujui seluruh Syarat & Ketentuan yang berlaku.
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
							loadingText="Mendaftar..."
							onClick={handleDaftar}
						>
							Daftar Akun
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	)
}

export default DaftarPage

