import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { sanitizeText } from "@/utils/sanitize"
import { useSubmitRateLimit } from "@/hooks/useSubmitRateLimit"
import { useSignInAction } from "@/utils/auth/SignInAction"
import {
	Box,
	Flex,
	VStack,
	Text,
	Input,
	Button,
	InputGroup,
	InputRightElement,
	IconButton,
	useToast,
	Alert,
	AlertIcon,
} from "@chakra-ui/react"
import Image from "next/image"
import NextLink from "next/link"
import { FaEye, FaEyeSlash } from "react-icons/fa"
const LoginPage = () => {
	const router = useRouter()
	const toast = useToast()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const { isBlocked, cooldown, recordFailure, reset } = useSubmitRateLimit(5, 15)
	const { signIn } = useSignInAction()
	const [isSsoLoading, setIsSsoLoading] = useState(false)
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"
	const nextPath = typeof router.query.next === "string" ? router.query.next : ""

	const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Format email tidak valid" : ""

	const handleMasuk = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email || !password || isBlocked) return
		
		setIsLoading(true)
		setErrorMessage("")

		try {
			const response = await axios.post(`${baseUrl}/auth/login-external`, {
				email: sanitizeText(email.trim().toLowerCase()),
				password
			}, {
				withCredentials: true,
				headers: {
					Accept: "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
			})

			if (response.data.status === "success") {
				reset()
				sessionStorage.setItem("fasor_logged_in", "true")
				toast({
					title: "Login Berhasil",
					description: "Selamat datang kembali!",
					status: "success",
					duration: 3000,
					isClosable: true,
				})
				const target = nextPath && nextPath.startsWith("/") ? nextPath : "/"
				window.location.href = target
			}
		} catch (error: any) {
			recordFailure()
			if (!error?.response) {
				setErrorMessage("Server tidak dapat dijangkau. Pastikan backend bisa diakses (dan sertifikat https amu-fasor.local sudah dipercaya).")
			} else {
				setErrorMessage(error.response?.data?.message || "Login gagal. Periksa kembali email dan kata sandi Anda.")
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Box h="100vh" bg="gray.100" display="flex" alignItems="stretch" p={3}>
			<Flex
				w="full"
				maxW="1400px"
				mx="auto"
				gap={3}
				alignItems="stretch"
			>
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
					w={{ base: "full", md: "380px" }}
					flexShrink={0}
					bg="white"
					borderRadius="2xl"
					boxShadow="md"
					flexDir="column"
					justifyContent="center"
					px={10}
					py={8}
					overflowY="auto"
				>
					<VStack spacing={0} mb={5} align="center">
						<Box mb={3}>
							<Image
								src="/images/logo myits.png"
								alt="myITS"
								width={88}
								height={36}
								style={{ objectFit: "contain" }}
							/>
						</Box>
						<Text fontSize="xl" fontWeight="800" color="gray.800" textAlign="center" lineHeight="1.35">
							Halo, Selamat Datang
							<br />
							di Fasor ITS
						</Text>
						<Text fontSize="sm" color="gray.500" textAlign="center" mt={2} lineHeight="1.5">
							Masukkan Email dan Kata Sandi untuk Masuk
						</Text>
					</VStack>

					<Box as="form" w="full" onSubmit={handleMasuk}>
						<VStack spacing={4} align="stretch">
							{router.query.reason === "idle" && (
								<Alert status="warning" borderRadius="lg" fontSize="sm">
									<AlertIcon />
									Sesi Anda berakhir karena tidak aktif. Silakan masuk kembali.
								</Alert>
							)}
							{router.query.reason === "session" && (
								<Alert status="warning" borderRadius="lg" fontSize="sm">
									<AlertIcon />
									Sesi Anda telah kadaluarsa. Silakan masuk kembali.
								</Alert>
							)}
							{errorMessage && (
								<Alert status="error" borderRadius="lg" fontSize="sm">
									<AlertIcon />
									{errorMessage}
								</Alert>
							)}
							<Box>
								<Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
									Email
								</Text>
								<Input
									placeholder="Email"
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
								<Text fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
									Kata Sandi
								</Text>
								<InputGroup>
									<Input
										placeholder="Kata Sandi"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e: any) => setPassword(e.target.value)}
										borderRadius="lg"
										borderColor="gray.300"
										bg="white"
										_focus={{ borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" }}
									/>
									<InputRightElement>
										<IconButton
											aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
											icon={showPassword ? <FaEyeSlash /> : <FaEye />}
											variant="ghost"
											size="sm"
											color="gray.400"
											_hover={{ color: "gray.600", bg: "transparent" }}
											onClick={() => setShowPassword((v) => !v)}
											tabIndex={-1}
										/>
									</InputRightElement>
								</InputGroup>
							</Box>

							<Text
								fontSize="xs"
								color="gray.500"
								textAlign="right"
								mt={-2}
								cursor="pointer"
								_hover={{ color: "#008FFF" }}
							>
								lupa kata sandi?
							</Text>

							{isBlocked && (
								<Text fontSize="xs" color="red.500" textAlign="center">
									Terlalu banyak percobaan gagal. Coba lagi dalam {cooldown} detik.
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
								loadingText="Masuk..."
								isDisabled={!email || !password || isBlocked}
							>
								{isBlocked ? `Coba lagi dalam ${cooldown}s` : "Masuk"}
							</Button>

							<Text fontSize="xs" color="gray.500" textAlign="center">
								atau masuk menggunakan akun
							</Text>

							<Button
								w="full"
								bg="#013880"
								color="white"
								borderRadius="xl"
								fontWeight="600"
								size="lg"
								_hover={{ bg: "#01295D" }}
								isLoading={isSsoLoading}
								loadingText="Menghubungkan..."
								onClick={async () => {
									setIsSsoLoading(true)
									await signIn()
									setIsSsoLoading(false)
								}}
								display="flex"
								alignItems="center"
								justifyContent="center"
								gap={3}
							>
								<Image
									src="/images/logo its2.png"
									alt="ITS"
									width={28}
									height={28}
									style={{ objectFit: "contain" }}
								/>
								<Text>Masuk dengan MyITS</Text>
							</Button>
						</VStack>
					</Box>

					<VStack spacing={3} mt={5}>
						<Text fontSize="sm" color="gray.600" textAlign="center">
							Belum punya akun?{" "}
							<NextLink href="/daftar" passHref legacyBehavior>
								<Text as="a" color="#008FFF" fontWeight="600" _hover={{ textDecoration: "underline" }}>
									Daftar
								</Text>
							</NextLink>
						</Text>

						<Button
							w="full"
							bg="blue.50"
							color="#008FFF"
							borderRadius="xl"
							fontWeight="600"
							size="lg"
							border="1px solid"
							borderColor="blue.100"
							_hover={{ bg: "blue.100" }}
							onClick={() => router.push("/")}
						>
							Lanjutkan sebagai guest
						</Button>
					</VStack>
				</Flex>
			</Flex>
		</Box>
	)
}

export default LoginPage
