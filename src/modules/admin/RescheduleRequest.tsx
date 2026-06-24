import {
	Box,
	Flex,
	Text,
	Icon,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Button,
	HStack,
	Badge,
	Input,
	InputGroup,
	InputLeftElement,
	Select,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
	VStack,
	useToast,
} from "@chakra-ui/react"
import { MdSearch, MdCheck, MdClose, MdVisibility } from "react-icons/md"
import { useState, useEffect } from "react"
import AdminLayout from "./AdminLayout"
import { adminService } from "@/services/adminService"

const RescheduleRequest = () => {
	const [data, setData] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [filterStatus, setFilterStatus] = useState("all")
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [selectedReq, setSelectedReq] = useState<any>(null)
	const toast = useToast()

	const fetchRequests = async () => {
		try {
			setLoading(true)
			const res = await adminService.getRescheduleRequests()
			if (res.status === "success") {
				setData(res.data)
			}
		} catch (err) {
			console.error(err)
			toast({
				title: "Gagal memuat data",
				description: "Terjadi kesalahan saat memuat permintaan reschedule.",
				status: "error",
				duration: 3000,
				isClosable: true,
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchRequests()
	}, [])

	const filteredData = data.filter((item: any) => {
		const matchSearch = item.kodeReservasi.toLowerCase().includes(search.toLowerCase()) ||
			item.namaPemesan.toLowerCase().includes(search.toLowerCase())
		const matchStatus = filterStatus === "all" || item.status === filterStatus
		return matchSearch && matchStatus
	})

	const handleAction = async (id: string, newStatus: string) => {
		try {
			const action = newStatus === "Disetujui" ? "approve" : "reject"
			const res = await adminService.handleRescheduleRequest(id, action)
			if (res.status === "success") {
				toast({
					title: "Berhasil",
					description: `Permintaan reschedule berhasil ${newStatus.toLowerCase()}.`,
					status: "success",
					duration: 3000,
					isClosable: true,
				})
				fetchRequests()
			}
		} catch (err) {
			console.error(err)
			toast({
				title: "Gagal memproses",
				description: "Terjadi kesalahan saat memproses permintaan reschedule.",
				status: "error",
				duration: 3000,
				isClosable: true,
			})
		}
		onClose()
	}

	const openDetail = (req: any) => {
		setSelectedReq(req)
		onOpen()
	}

	return (
		<AdminLayout>
			<Flex align="center" justify="space-between" mb={6}>
				<Box>
					<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
						Permintaan Reschedule
					</Text>
					<Text fontSize="sm" color="gray.500" mt={0.5}>
						Kelola pengajuan perubahan jadwal (reschedule) dari pengguna
					</Text>
				</Box>
			</Flex>

			<Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
				<Flex
					align="center"
					justify="space-between"
					px={6}
					py={4}
					borderBottom="1px solid"
					borderColor="gray.100"
					bg="white"
				>
					<HStack spacing={3}>
						<InputGroup size="sm" w="260px">
							<InputLeftElement pointerEvents="none">
								<Icon as={MdSearch} color="gray.400" />
							</InputLeftElement>
							<Input
								placeholder="Cari kode atau nama..."
								borderRadius="lg"
								bg="gray.50"
								border="1px solid"
								borderColor="gray.200"
								_focus={{ borderColor: "blue.400", bg: "white" }}
								value={search}
								onChange={(e: any) => setSearch(e.target.value)}
							/>
						</InputGroup>
						<Select size="sm" borderRadius="lg" w="160px" bg="gray.50" value={filterStatus} onChange={(e: any) => setFilterStatus(e.target.value)}>
							<option value="all">Semua Status</option>
							<option value="Menunggu">Menunggu</option>
							<option value="Disetujui">Disetujui</option>
							<option value="Ditolak">Ditolak</option>
						</Select>
					</HStack>
				</Flex>

				<Box p={4}>
					<TableContainer>
						<Table size="sm" variant="simple">
							<Thead>
								<Tr>
									<Th color="gray.500" fontSize="xs" py={3}>Kode Reschedule</Th>
									<Th color="gray.500" fontSize="xs">Kode Reservasi</Th>
									<Th color="gray.500" fontSize="xs">Nama Pemesan</Th>
									<Th color="gray.500" fontSize="xs">Jadwal Baru</Th>
									<Th color="gray.500" fontSize="xs">Status</Th>
									<Th color="gray.500" fontSize="xs" textAlign="center">Aksi</Th>
								</Tr>
							</Thead>
							<Tbody>
								{filteredData.map((row: any) => (
									<Tr key={row.id} _hover={{ bg: "gray.50" }}>
										<Td fontSize="sm" fontWeight="600" color="gray.800">{row.id}</Td>
										<Td fontSize="sm" color="blue.600" cursor="pointer" _hover={{ textDecoration: "underline" }}>
											{row.kodeReservasi}
										</Td>
										<Td fontSize="sm" color="gray.700">{row.namaPemesan}</Td>
										<Td fontSize="sm" color="gray.700" isTruncated maxW="200px">{row.jadwalBaru}</Td>
										<Td>
											<Badge
												px={2} py={0.5} borderRadius="md"
												colorScheme={row.status === "Menunggu" ? "orange" : row.status === "Disetujui" ? "green" : "red"}
											>
												{row.status}
											</Badge>
										</Td>
										<Td textAlign="center">
											<Button size="xs" colorScheme="blue" variant="outline" leftIcon={<Icon as={MdVisibility} />} onClick={() => openDetail(row)}>
												Detail
											</Button>
										</Td>
									</Tr>
								))}
								{filteredData.length === 0 && (
									<Tr>
										<Td colSpan={6} textAlign="center" py={6} color="gray.500">
											{loading ? "Memuat data..." : "Tidak ada permintaan reschedule."}
										</Td>
									</Tr>
								)}
							</Tbody>
						</Table>
					</TableContainer>
				</Box>
			</Box>

			{/* Modal Detail */}
			<Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
				<ModalContent borderRadius="xl">
					<ModalHeader fontSize="md" fontWeight="700" borderBottom="1px solid" borderColor="gray.100">
						Detail Permintaan Reschedule
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody py={5}>
						{selectedReq && (
							<VStack align="stretch" spacing={4}>
								<Box>
									<Text fontSize="xs" color="gray.500" fontWeight="600">Kode Reservasi</Text>
									<Text fontSize="sm" fontWeight="700" color="blue.600">{selectedReq.kodeReservasi}</Text>
								</Box>
								<Box>
									<Text fontSize="xs" color="gray.500" fontWeight="600">Nama Pemesan / Tim</Text>
									<Text fontSize="sm" color="gray.800">{selectedReq.namaPemesan}</Text>
								</Box>
								<Box>
									<Text fontSize="xs" color="gray.500" fontWeight="600">Fasilitas</Text>
									<Text fontSize="sm" color="gray.800">{selectedReq.fasilitas}</Text>
								</Box>
								<Flex gap={4}>
									<Box flex={1} p={3} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.100">
										<Text fontSize="xs" color="red.600" fontWeight="700" mb={1}>Jadwal Lama</Text>
										<Text fontSize="sm" color="gray.800">{selectedReq.jadwalLama}</Text>
									</Box>
									<Box flex={1} p={3} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.100">
										<Text fontSize="xs" color="green.600" fontWeight="700" mb={1}>Jadwal Baru Diajukan</Text>
										<Text fontSize="sm" color="gray.800">{selectedReq.jadwalBaru}</Text>
									</Box>
								</Flex>
								<Box>
									<Text fontSize="xs" color="gray.500" fontWeight="600">Alasan Reschedule</Text>
									<Box p={3} bg="gray.50" borderRadius="lg" mt={1}>
										<Text fontSize="sm" color="gray.700" fontStyle="italic">"{selectedReq.alasan}"</Text>
									</Box>
								</Box>
								{selectedReq.bukti && (
									<Box>
										<Text fontSize="xs" color="gray.500" fontWeight="600">Dokumen Pendukung / Bukti</Text>
										<Box mt={2}>
											<Button
												as="a"
												href={selectedReq.bukti}
												target="_blank"
												rel="noopener noreferrer"
												size="xs"
												colorScheme="blue"
												variant="outline"
											>
												Lihat Dokumen / Bukti Foto
											</Button>
										</Box>
									</Box>
								)}
							</VStack>
						)}
					</ModalBody>
					<ModalFooter gap={2} borderTop="1px solid" borderColor="gray.100" justifyContent="space-between">
						{selectedReq?.status === "Menunggu" ? (
							<>
								<Button size="sm" colorScheme="red" variant="outline" leftIcon={<Icon as={MdClose} />} onClick={() => handleAction(selectedReq.id, "Ditolak")}>
									Tolak
								</Button>
								<Button size="sm" colorScheme="green" leftIcon={<Icon as={MdCheck} />} onClick={() => handleAction(selectedReq.id, "Disetujui")}>
									Setujui
								</Button>
							</>
						) : (
							<Button size="sm" w="full" onClick={onClose}>Tutup</Button>
						)}
					</ModalFooter>
				</ModalContent>
			</Modal>
		</AdminLayout>
	)
}

export default RescheduleRequest
