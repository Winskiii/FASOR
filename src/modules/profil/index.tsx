import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { sanitizeText } from "@/utils/sanitize"
import { maskNik, maskPhone } from "@/utils/maskData"
import {
	Box,
	Flex,
	VStack,
	HStack,
	Text,
	Button,
	Icon,
	Input,
	InputGroup,
	InputRightElement,
	IconButton,
	Grid,
	Divider,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalHeader,
	ModalCloseButton,
	Spinner,
	Center,
	Alert,
	AlertIcon,
	useToast,
} from "@chakra-ui/react"
import {
	FaEnvelope,
	FaPhone,
	FaIdCard,
	FaUser,
	FaLock,
	FaCalendarAlt,
	FaEdit,
	FaTrash,
	FaExclamationTriangle,
	FaEye,
	FaEyeSlash,
} from "react-icons/fa"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import FasorFooter from "@/components/organisms/FasorFooter"


type UserType = "external" | "internal" | "guest"

interface UserProfile {
	id_user?: string
	email: string
	namaLengkap: string
	noTelp: string
	nik: string
	passwordMasked: string
	akunDibuat: string
	userType: UserType
}

const EMPTY_USER: UserProfile = {
	id_user: undefined,
	email: "",
	namaLengkap: "",
	noTelp: "",
	nik: "",
	passwordMasked: "••••••••",
	akunDibuat: "-",
	userType: "guest",
}


interface EditProfilModalProps {
	isOpen: boolean
	onClose: () => void
	user: UserProfile
	onSave: (data: { email: string; namaLengkap: string; noTelp: string }) => Promise<void>
}

const EditProfilModal = ({ isOpen, onClose, user, onSave }: EditProfilModalProps) => {
	const [email, setEmail] = useState(user.email)
	const [nama, setNama] = useState(user.namaLengkap)
	const [noTelp, setNoTelp] = useState(user.noTelp)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		setEmail(user.email)
		setNama(user.namaLengkap)
		setNoTelp(user.noTelp)
		setError("")
		setIsLoading(false)
	}, [user, isOpen])

	const handleSimpan = async () => {
		setIsLoading(true)
		setError("")

		const sanitizedEmail = sanitizeText(email).trim()
		const sanitizedNama = sanitizeText(nama).trim()
		const sanitizedNoTelp = sanitizeText(noTelp).trim()

		if (!sanitizedEmail || !sanitizedNama || !sanitizedNoTelp) {
			setError("Data tidak valid. Input tidak boleh kosong atau mengandung karakter script berbahaya (XSS).")
			setIsLoading(false)
			return
		}

		try {
			await onSave({ email: sanitizedEmail, namaLengkap: sanitizedNama, noTelp: sanitizedNoTelp })
			onClose()
		} catch (e: any) {
			setError(e?.response?.data?.message || "Gagal menyimpan profil.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
			<ModalOverlay bg="blackAlpha.400" />
			<ModalContent borderRadius="2xl" mx={4}>
				<ModalHeader fontWeight="700" fontSize="lg" pt={6} pb={2}>
					Informasi Profil
				</ModalHeader>
				<ModalCloseButton top={4} right={4} />
				<ModalBody pb={6}>
					<VStack spacing={4} align="stretch">
						{error && (
							<Alert status="error" borderRadius="lg" fontSize="sm">
								<AlertIcon />
								{error}
							</Alert>
						)}
						<Box>
							<Text fontSize="sm" color="gray.600" mb={1}>Email</Text>
							<Input
								value={email}
								onChange={(e: any) => setEmail(e.target.value)}
								borderRadius="lg"
								borderColor="gray.300"
								_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
							/>
						</Box>
						<Box>
							<Text fontSize="sm" color="gray.600" mb={1}>Nama Lengkap</Text>
							<Input
								value={nama}
								onChange={(e: any) => setNama(e.target.value)}
								borderRadius="lg"
								borderColor="gray.300"
								_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
							/>
						</Box>
						<Box>
							<Text fontSize="sm" color="gray.600" mb={1}>Nomor Telepon</Text>
							<Input
								value={noTelp}
								onChange={(e: any) => setNoTelp(e.target.value)}
								borderRadius="lg"
								borderColor="gray.300"
								_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
							/>
						</Box>
						<Box>
							<Text fontSize="sm" color="gray.600" mb={1}>NIK</Text>
							<Input
								value={maskNik(user.nik)}
								isDisabled
								borderRadius="lg"
								bg="gray.50"
								color="gray.400"
							/>
							<Text fontSize="xs" color="gray.400" mt={1}>
								NIK tidak dapat diubah sendiri. Hubungi admin jika ada kesalahan data.
							</Text>
						</Box>
						<Button
							bg="#008FFF"
							color="white"
							borderRadius="xl"
							fontWeight="700"
							_hover={{ bg: "#0070CC" }}
							onClick={handleSimpan}
							isLoading={isLoading}
							loadingText="Menyimpan..."
							isDisabled={!email || !nama || !noTelp}
						>
							Simpan
						</Button>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}


interface UbahPasswordModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>
}

const UbahPasswordModal = ({ isOpen, onClose, onSave }: UbahPasswordModalProps) => {
	const [passwordLama, setPasswordLama] = useState("")
	const [passwordBaru, setPasswordBaru] = useState("")
	const [konfirmasi, setKonfirmasi] = useState("")
	const [showLama, setShowLama] = useState(false)
	const [showBaru, setShowBaru] = useState(false)
	const [showKonfirmasi, setShowKonfirmasi] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")

	const isValid = passwordLama && passwordBaru.length >= 8 && konfirmasi === passwordBaru

	useEffect(() => {
		if (!isOpen) return
		setPasswordLama("")
		setPasswordBaru("")
		setKonfirmasi("")
		setError("")
		setIsLoading(false)
	}, [isOpen])

	const handleSimpan = async () => {
		if (!isValid) return
		setIsLoading(true)
		setError("")
		try {
			await onSave({ oldPassword: passwordLama, newPassword: passwordBaru, confirmPassword: konfirmasi })
			onClose()
		} catch (e: any) {
			setError(e?.response?.data?.message || "Gagal mengubah password.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
			<ModalOverlay bg="blackAlpha.400" />
			<ModalContent borderRadius="2xl" mx={4}>
				<ModalHeader fontWeight="700" fontSize="lg" pt={6} pb={2}>
					Keamanan Akun
				</ModalHeader>
				<ModalCloseButton top={4} right={4} />
				<ModalBody pb={6}>
					<VStack spacing={4} align="stretch">
						{error && (
							<Alert status="error" borderRadius="lg" fontSize="sm">
								<AlertIcon />
								{error}
							</Alert>
						)}
						<Box>
							<Text fontSize="sm" color="gray.600" mb={1}>Password Lama</Text>
							<InputGroup>
								<Input
									placeholder="Masukkan Password Lama"
									type={showLama ? "text" : "password"}
									value={passwordLama}
									onChange={(e: any) => setPasswordLama(e.target.value)}
									borderRadius="lg"
									borderColor="gray.300"
									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
								<InputRightElement>
									<IconButton aria-label="toggle" icon={showLama ? <FaEyeSlash /> : <FaEye />} variant="ghost" size="sm" color="gray.400" onClick={() => setShowLama(v => !v)} tabIndex={-1} />
								</InputRightElement>
							</InputGroup>
						</Box>
						<Box>
							<Text fontSize="sm" color="gray.600" mb={1}>Password Baru</Text>
							<InputGroup>
								<Input
									placeholder="Masukkan Password Baru"
									type={showBaru ? "text" : "password"}
									value={passwordBaru}
									onChange={(e: any) => setPasswordBaru(e.target.value)}
									borderRadius="lg"
									borderColor="gray.300"
									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
								<InputRightElement>
									<IconButton aria-label="toggle" icon={showBaru ? <FaEyeSlash /> : <FaEye />} variant="ghost" size="sm" color="gray.400" onClick={() => setShowBaru(v => !v)} tabIndex={-1} />
								</InputRightElement>
							</InputGroup>
						</Box>
						<Box>
							<Text fontSize="sm" color="gray.600" mb={1}>Konfirmasi Password Baru</Text>
							<InputGroup>
								<Input
									placeholder="Konfirmasi Password Baru"
									type={showKonfirmasi ? "text" : "password"}
									value={konfirmasi}
									onChange={(e: any) => setKonfirmasi(e.target.value)}
									borderRadius="lg"
									borderColor={konfirmasi && konfirmasi !== passwordBaru ? "red.400" : "gray.300"}
									_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
								/>
								<InputRightElement>
									<IconButton aria-label="toggle" icon={showKonfirmasi ? <FaEyeSlash /> : <FaEye />} variant="ghost" size="sm" color="gray.400" onClick={() => setShowKonfirmasi(v => !v)} tabIndex={-1} />
								</InputRightElement>
							</InputGroup>
							{konfirmasi && konfirmasi !== passwordBaru && (
								<Text fontSize="xs" color="red.500" mt={1}>Password tidak cocok</Text>
							)}
						</Box>
						<Button
							bg="#008FFF"
							color="white"
							borderRadius="xl"
							fontWeight="700"
							_hover={{ bg: "#0070CC" }}
							isDisabled={!isValid}
							onClick={handleSimpan}
							isLoading={isLoading}
							loadingText="Menyimpan..."
						>
							Simpan
						</Button>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}


interface HapusAkunModalProps {
	isOpen: boolean
	onClose: () => void
	onHapus: () => Promise<void>
}

const HapusAkunModal = ({ isOpen, onClose, onHapus }: HapusAkunModalProps) => {
	const [konfirmasi, setKonfirmasi] = useState("")
	const isValid = konfirmasi === "HAPUS"
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		if (!isOpen) return
		setKonfirmasi("")
		setError("")
		setIsLoading(false)
	}, [isOpen])

	const handleHapus = async () => {
		if (!isValid) return
		setIsLoading(true)
		setError("")
		try {
			await onHapus()
		} catch (e: any) {
			setError(e?.response?.data?.message || "Gagal menghapus akun.")
			setIsLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={() => { onClose(); setKonfirmasi("") }} size="md" isCentered>
			<ModalOverlay bg="blackAlpha.400" />
			<ModalContent borderRadius="2xl" mx={4}>
				<ModalCloseButton top={4} right={4} />
				<ModalBody pb={8} pt={8}>
					<VStack spacing={4} align="center">
						{error && (
							<Alert status="error" borderRadius="lg" fontSize="sm" w="full">
								<AlertIcon />
								{error}
							</Alert>
						)}
						<Box
							w="72px"
							h="72px"
							borderRadius="full"
							bg="red.50"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<Icon as={FaExclamationTriangle} color="red.400" boxSize={8} />
						</Box>
						<Text fontWeight="800" fontSize="lg" color="red.500" textAlign="center">
							Hapus Akun Permanen?
						</Text>
						<Text fontSize="sm" color="gray.500" textAlign="center" lineHeight="1.6">
							Apakah kamu yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan
							dan seluruh data pemesanan kamu akan dihapus secara permanen.
						</Text>
						<Box w="full">
							<Text fontSize="sm" color="gray.700" mb={2}>
								Ketik{" "}
								<Text as="span" fontWeight="700" color="red.500">HAPUS</Text>
								{" "}untuk konfirmasi
							</Text>
							<Input
								placeholder="ketik HAPUS"
								value={konfirmasi}
								onChange={(e: any) => setKonfirmasi(e.target.value)}
								borderRadius="lg"
								borderColor="gray.300"
								_focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #FC8181" }}
							/>
						</Box>
						<Button
							w="full"
							bg={isValid ? "red.500" : "gray.200"}
							color={isValid ? "white" : "gray.400"}
							borderRadius="xl"
							fontWeight="700"
							_hover={isValid ? { bg: "red.600" } : {}}
							isDisabled={!isValid}
							onClick={handleHapus}
							isLoading={isLoading}
							loadingText="Menghapus..."
						>
							Hapus Akun Permanen
						</Button>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}


export default function ProfilPage() {
	const router = useRouter()
	const toast = useToast()
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"
	const [user, setUser] = useState<UserProfile>(EMPTY_USER)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [showEditProfil, setShowEditProfil] = useState(false)
	const [showUbahPassword, setShowUbahPassword] = useState(false)
	const [showHapusAkun, setShowHapusAkun] = useState(false)

	useEffect(() => {
		const fetchMe = async () => {
			setLoading(true)
			setError("")
			try {
				const res = await axios.get(`${baseUrl}/auth/user`, { withCredentials: true })
				const d = res.data?.data
				if (!d) {
					router.push("/login")
					return
				}

				const createdAt = d.created_at ? new Date(d.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"
				setUser({
					id_user: d.id_user,
					email: d.email || "",
					namaLengkap: d.name || "",
					noTelp: d.phone || "",
					nik: d.nik || "",
					passwordMasked: "••••••••",
					akunDibuat: createdAt,
					userType: d.user_type || "guest",
				})
			} catch (e: any) {
				if (e?.response?.status === 401) router.push("/login")
				else setError(e?.response?.data?.message || "Gagal memuat profil.")
			} finally {
				setLoading(false)
			}
		}

		fetchMe()
	}, [baseUrl, router])

	const handleSaveProfil = async (data: { email: string; namaLengkap: string; noTelp: string }) => {
		const res = await axios.put(`${baseUrl}/auth/profile-external`, {
			name: data.namaLengkap,
			email: data.email,
			phone: data.noTelp,
		}, { withCredentials: true })

		if (res.data?.status === "success") {
			setUser(prev => ({ ...prev, email: data.email, namaLengkap: data.namaLengkap, noTelp: data.noTelp }))
			toast({ title: "Profil tersimpan", status: "success", duration: 2500, isClosable: true })
		}
	}

	const handleChangePassword = async (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
		const res = await axios.put(`${baseUrl}/auth/password-external`, {
			old_password: data.oldPassword,
			password: data.newPassword,
			password_confirmation: data.confirmPassword,
		}, { withCredentials: true })

		if (res.data?.status === "success") {
			toast({ title: "Password diperbarui", status: "success", duration: 2500, isClosable: true })
		}
	}

	const handleHapusAkun = async () => {
		const res = await axios.delete(`${baseUrl}/auth/me`, { withCredentials: true })
		if (res.data?.status === "success") {
			sessionStorage.removeItem("fasor_logged_in")
			router.push("/")
		}
	}

	if (loading) {
		return (
			<Center h="100vh" bg="gray.50">
				<VStack spacing={4}>
					<Spinner size="xl" color="#008FFF" thickness="4px" />
					<Text color="gray.500">Memuat profil...</Text>
				</VStack>
			</Center>
		)
	}

	return (
		<Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
			<FasorNavbar />

			<Box flex={1} maxW="860px" mx="auto" w="full" px={{ base: 4, md: 8 }} py={10}>
				<Text fontSize="2xl" fontWeight="800" color="gray.800" mb={0.5}>
					Profil Saya
				</Text>
				<Text fontSize="sm" color="gray.500" mb={8}>
					Kelola informasi akun dan keamanan akun Fasor ITS kamu
				</Text>

				<VStack spacing={5} align="stretch">
					{error && (
						<Alert status="error" borderRadius="xl" fontSize="sm">
							<AlertIcon />
							{error}
						</Alert>
					)}
					<Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" p={6} boxShadow="sm">
						<Flex justify="space-between" align="center" mb={5}>
							<Text fontWeight="700" fontSize="md" color="gray.800">
								Informasi Profil
							</Text>
							<Button
								variant="ghost"
								size="sm"
								color="#008FFF"
								fontWeight="600"
								rightIcon={<Icon as={FaEdit} boxSize={3.5} />}
								_hover={{ bg: "blue.50" }}
								onClick={() => setShowEditProfil(true)}
							>
								Edit
							</Button>
						</Flex>
						<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
							<HStack spacing={3} align="start">
								<Icon as={FaEnvelope} color="gray.400" mt={0.5} boxSize={4} flexShrink={0} />
								<VStack align="start" spacing={0}>
									<Text fontSize="xs" color="gray.400">Email</Text>
									<Text fontSize="sm" fontWeight="600" color="gray.800">{user.email}</Text>
								</VStack>
							</HStack>
							<HStack spacing={3} align="start">
								<Icon as={FaUser} color="gray.400" mt={0.5} boxSize={4} flexShrink={0} />
								<VStack align="start" spacing={0}>
									<Text fontSize="xs" color="gray.400">Nama Lengkap</Text>
									<Text fontSize="sm" fontWeight="600" color="gray.800">{user.namaLengkap}</Text>
								</VStack>
							</HStack>
							<HStack spacing={3} align="start">
								<Icon as={FaPhone} color="gray.400" mt={0.5} boxSize={4} flexShrink={0} />
								<VStack align="start" spacing={0}>
									<Text fontSize="xs" color="gray.400">Nomor HP</Text>
									<Text fontSize="sm" fontWeight="600" color="gray.800">{maskPhone(user.noTelp)}</Text>
								</VStack>
							</HStack>
							<HStack spacing={3} align="start">
								<Icon as={FaIdCard} color="gray.400" mt={0.5} boxSize={4} flexShrink={0} />
								<VStack align="start" spacing={0}>
									<Text fontSize="xs" color="gray.400">NIK</Text>
									<Text fontSize="sm" fontWeight="600" color="gray.800">{maskNik(user.nik)}</Text>
								</VStack>
							</HStack>
						</Grid>
					</Box>

					<Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" p={6} boxShadow="sm">
						<Flex justify="space-between" align="center" mb={5}>
							<Text fontWeight="700" fontSize="md" color="gray.800">
								Keamanan Akun
							</Text>
							<Button
								variant="ghost"
								size="sm"
								color="#008FFF"
								fontWeight="600"
								rightIcon={<Icon as={FaEdit} boxSize={3.5} />}
								_hover={{ bg: "blue.50" }}
								onClick={() => setShowUbahPassword(true)}
							>
								Ubah Password
							</Button>
						</Flex>
						<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
							<HStack spacing={3} align="start">
								<Icon as={FaLock} color="gray.400" mt={0.5} boxSize={4} flexShrink={0} />
								<VStack align="start" spacing={0}>
									<Text fontSize="xs" color="gray.400">Password</Text>
									<Text fontSize="sm" fontWeight="600" color="gray.800" letterSpacing="widest">
										{user.passwordMasked}
									</Text>
								</VStack>
							</HStack>
							<HStack spacing={3} align="start">
								<Icon as={FaCalendarAlt} color="gray.400" mt={0.5} boxSize={4} flexShrink={0} />
								<VStack align="start" spacing={0}>
									<Text fontSize="xs" color="gray.400">Akun Dibuat</Text>
									<Text fontSize="sm" fontWeight="600" color="gray.800">{user.akunDibuat}</Text>
								</VStack>
							</HStack>
						</Grid>
					</Box>

					<Box bg="white" border="1px solid" borderColor="red.200" borderRadius="xl" p={6} boxShadow="sm">
						<Flex justify="space-between" align="center" mb={5}>
							<Text fontWeight="700" fontSize="md" color="red.500">
								Zona Berbahaya
							</Text>
							<Button
								variant="ghost"
								size="sm"
								color="red.500"
								fontWeight="600"
								rightIcon={<Icon as={FaTrash} boxSize={3.5} />}
								_hover={{ bg: "red.50" }}
								onClick={() => setShowHapusAkun(true)}
							>
								Hapus Akun
							</Button>
						</Flex>
						<HStack spacing={3} align="start">
							<Icon as={FaTrash} color="red.400" mt={0.5} boxSize={4} flexShrink={0} />
							<VStack align="start" spacing={0}>
								<Text fontSize="sm" fontWeight="600" color="gray.800">Hapus akun</Text>
								<Text fontSize="xs" color="gray.500">
									Menghapus akun secara permanen beserta seluruh data pemesanan
								</Text>
							</VStack>
						</HStack>
					</Box>
				</VStack>
			</Box>

			<FasorFooter />

			<EditProfilModal
				isOpen={showEditProfil}
				onClose={() => setShowEditProfil(false)}
				user={user}
				onSave={handleSaveProfil}
			/>
			<UbahPasswordModal
				isOpen={showUbahPassword}
				onClose={() => setShowUbahPassword(false)}
				onSave={handleChangePassword}
			/>
			<HapusAkunModal
				isOpen={showHapusAkun}
				onClose={() => setShowHapusAkun(false)}
				onHapus={handleHapusAkun}
			/>
		</Box>
	)
}
