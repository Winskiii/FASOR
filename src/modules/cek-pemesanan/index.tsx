import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import {
	Box,
	Flex,
	VStack,
	HStack,
	Text,
	Button,
	Input,
	InputGroup,
	InputLeftElement,
	Icon,
	Spinner,
	useToast,
} from "@chakra-ui/react"
import { FaSearch } from "react-icons/fa"
import Image from "next/image"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import FasorFooter from "@/components/organisms/FasorFooter"


const BookingIllustration = () => (
	<Box w="full" maxW="480px" mx="auto" userSelect="none">
		<Image
			src="/images/cek pemesanan bg.png"
			alt="Cek Pemesanan Background"
			width={480}
			height={420}
			style={{ width: "100%", height: "auto" }}
			priority
		/>
	</Box>
)


export default function CekPemesananPage() {
	const router = useRouter()
	const toast = useToast()
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"
	const [bookingCode, setBookingCode] = useState("")
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	const handleSearch = async () => {
		const code = bookingCode.trim().toUpperCase()
		if (!code) {
			setError("Masukkan kode booking terlebih dahulu.")
			return
		}
		setError("")
		setIsLoading(true)
		try {
			const res = await axios.get(`${baseUrl}/fasilitas/reservasi/${code}`, {
				withCredentials: true,
				headers: { Accept: "application/json" },
			})
			
			if (res.data?.data?.status === "cancelled" || res.data?.data?.status === "Canceled") {
				toast({
					title: "Pesanan Dibatalkan",
					description: "Pesanan anda sudah dibatalkan, hubungi admin jika ada kesalahan",
					status: "warning",
					duration: 6000,
					isClosable: true,
					position: "top",
				})
				setIsLoading(false)
				return
			}
			
			router.push({ pathname: "/detail-pemesanan", query: { code } })
		} catch (err: any) {
			const status = err?.response?.status
			if (status === 404 || status === 410) {
				const msg = "Kode booking yang dimasukkan salah atau tidak ditemukan."
				setError(msg)
				toast({
					title: "Kode Booking Tidak Ditemukan",
					description: msg,
					status: "error",
					duration: 4000,
					isClosable: true,
					position: "top",
				})
			} else {
				setError("Gagal menghubungi server. Pastikan koneksi Anda aktif.")
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleSearch()
	}

	return (
		<Box bg="gray.50" display="flex" flexDirection="column">
			<FasorNavbar />

			<Flex
				as="main"
				flex={1}
				minH="100vh"
				maxW="1200px"
				mx="auto"
				w="full"
				px={{ base: 4, md: 8 }}
				py={{ base: 10, md: 16 }}
				align="center"
				gap={{ base: 8, md: 16 }}
				direction={{ base: "column", md: "row" }}
			>
				<Box flex="1" maxW={{ base: "100%", md: "460px" }}>
					<Box
						bg="white"
						border="1px solid"
						borderColor="gray.200"
						borderRadius="2xl"
						p={{ base: 6, md: 10 }}
						boxShadow="sm"
					>
						<VStack spacing={5} align="stretch">
							<VStack spacing={1} align="start">
								<Text
									fontSize={{ base: "2xl", md: "3xl" }}
									fontWeight="800"
									color="gray.800"
									lineHeight="1.2"
								>
									Cek Pemesanan
								</Text>
								<Text fontSize="sm" color="gray.500">
									Masukkan kode booking-mu.
								</Text>
							</VStack>

							<VStack spacing={2} align="stretch">
								<InputGroup>
									<InputLeftElement pointerEvents="none" h="full" pl={1}>
										<Icon as={FaSearch} color="gray.400" boxSize={4} />
									</InputLeftElement>
									<Input
										placeholder="Search..."
										value={bookingCode}
										onChange={e => {
											setBookingCode(e.target.value)
											if (error) setError("")
										}}
										onKeyDown={handleKeyDown}
										bg="white"
										color="gray.800"
										borderColor={error ? "red.400" : "gray.300"}
										borderRadius="md"
										fontSize="sm"
										_placeholder={{ color: "gray.400" }}
										_focus={{
											borderColor: error ? "red.400" : "#008FFF",
											boxShadow: error
												? "0 0 0 1px #FC8181"
												: "0 0 0 1px #008FFF",
										}}
										autoFocus
									/>
								</InputGroup>

								{error && (
									<Text fontSize="xs" color="red.500">
										{error}
									</Text>
								)}
							</VStack>

							<Button
								bg="#008FFF"
								color="white"
								borderRadius="md"
								fontWeight="700"
								fontSize="sm"
								size="md"
								w="full"
								_hover={{ bg: "#0070CC" }}
								onClick={handleSearch}
								isLoading={isLoading}
								loadingText="Mencari..."
								spinner={<Spinner size="sm" />}
							>
								Cari Pemesanan
							</Button>
						</VStack>
					</Box>
				</Box>

				<Box
					flex="1"
					display={{ base: "none", md: "flex" }}
					justifyContent="center"
					alignItems="center"
				>
					<BookingIllustration />
				</Box>
			</Flex>

			<FasorFooter />
		</Box>
	)
}
