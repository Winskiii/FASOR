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
	Input,
	InputGroup,
	InputLeftElement,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	FormControl,
	FormLabel,
	Select,
	useDisclosure,
	VStack,
	Textarea,
	Image,
} from "@chakra-ui/react"
import { MdSearch, MdAdd, MdEdit, MdDelete } from "react-icons/md"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { useState, useEffect, useMemo } from "react"
import { sanitizeText } from "@/utils/sanitize"
import AdminLayout from "./AdminLayout"

const INITIAL_DATA = [
	{ id: 1, nama: "GOR Futsal Indoor", olahraga: "Futsal", status: "Bagus", image: "/images/gor futsal its.png" },
	{ id: 2, nama: "Lapangan Futsal Outdoor", olahraga: "Futsal", status: "Bagus", image: "/images/lapangan futsal pln.png" },
	{ id: 3, nama: "Lapangan Basket Semi Indoor", olahraga: "Basket", status: "Bagus", image: "/images/lapangan basket semi indoor.png" },
	{ id: 4, nama: "Lapangan Basket Outdoor", olahraga: "Basket", status: "Bagus", image: "/images/lapangan basket flexy.png" },
	{ id: 5, nama: "GOR Badminton", olahraga: "Bulutangkis", status: "Bagus", image: "/images/gor badminton its.png" },
	{ id: 6, nama: "Lapangan Tenis", olahraga: "Tenis", status: "Bagus", image: "/images/lapangan tennis its.png" },
	{ id: 7, nama: "Stadion Sepak Bola", olahraga: "Sepakbola", status: "Bagus", image: "/images/stadion its.png" },
	{ id: 8, nama: "Mini Soccer", olahraga: "Sepakbola", status: "Bagus", image: "/images/lapangan mini soccer.png" },
	{ id: 9, nama: "Lapangan Voli Outdoor", olahraga: "Voli", status: "Bagus", image: "/images/lapangan voli its.png" },
]

const Fasilitas = () => {
	const [data, setData] = useState(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("fasilitas_data")
			if (saved) {
				const parsed = JSON.parse(saved)
				if (parsed.some((p: any) => p.nama === "GOR Bulutangkis ITS" || p.nama === "Stadion ITS" || p.nama === "GOR Futsal Outdoor")) {
					return INITIAL_DATA
				}
				return parsed
			}
		}
		return INITIAL_DATA
	})

	const [sportsData, setSportsData] = useState<any[]>([])

	useEffect(() => {
		localStorage.setItem("fasilitas_data", JSON.stringify(data))
	}, [data])

	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("jenis_olahraga_data")
			if (saved) setSportsData(JSON.parse(saved))
		}
	}, [])

	const [search, setSearch] = useState("")
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [formData, setFormData] = useState({ id: 0, nama: "", olahraga: "Basket", status: "Bagus", image: "", keterangan: "", lokasi: "" })

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setFormData(prev => ({ ...prev, image: reader.result as string }))
			}
			reader.readAsDataURL(file)
		}
	}

	const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'asc'
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc'
		}
		setSortConfig({ key, direction })
	}

	const filteredAndSortedData = useMemo(() => {
		let result = data.filter((item: any) =>
			item.nama.toLowerCase().includes(search.toLowerCase()) ||
			item.olahraga.toLowerCase().includes(search.toLowerCase())
		)

		if (sortConfig !== null) {
			result.sort((a: any, b: any) => {
				const aValue = a[sortConfig.key]
				const bValue = b[sortConfig.key]
				
				if (aValue === undefined || aValue === null) return 1
				if (bValue === undefined || bValue === null) return -1
				
				if (typeof aValue === 'number' && typeof bValue === 'number') {
					return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
				}
				
				const aStr = String(aValue).toLowerCase()
				const bStr = String(bValue).toLowerCase()
				
				if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
				if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
				return 0
			})
		}

		return result
	}, [data, search, sortConfig])

	const SortIcon = ({ columnKey }: { columnKey: string }) => {
		if (sortConfig?.key === columnKey) {
			return sortConfig.direction === 'asc' ? <Icon as={FaSortUp} ml={1} /> : <Icon as={FaSortDown} ml={1} />
		}
		return <Icon as={FaSort} ml={1} color="gray.300" />
	}

	const openModal = (item?: any) => {
		if (item) {
			setFormData({ ...item, image: item.image || "", keterangan: item.keterangan || "", lokasi: item.lokasi || "" })
		} else {
			setFormData({ id: 0, nama: "", olahraga: sportsData[0]?.nama || "Basket", status: "Bagus", image: "", keterangan: "", lokasi: "" })
		}
		onOpen()
	}

	const handleSubmit = () => {
		if (formData.nama) {
			const sanitizedData = {
				...formData,
				nama: sanitizeText(formData.nama),
				lokasi: sanitizeText(formData.lokasi),
				keterangan: sanitizeText(formData.keterangan)
			}
			if (formData.id === 0) {
				setData([...data, { ...sanitizedData, id: Date.now() }])
			} else {
				setData(data.map(d => d.id === formData.id ? sanitizedData : d))
			}
			onClose()
		}
	}

	const handleDelete = (id: number) => {
		setData(data.filter((item: any) => item.id !== id))
	}

	return (
		<AdminLayout>
			<Flex align="center" justify="space-between" mb={6}>
				<Box>
					<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
						Data Fasilitas
					</Text>
					<Text fontSize="sm" color="gray.500" mt={0.5}>
						Kelola data fisik lapangan dan fasilitas olahraga yang tersedia
					</Text>
				</Box>
				<Button
					size="sm"
					bg="blue.500"
					color="white"
					leftIcon={<Icon as={MdAdd} />}
					borderRadius="lg"
					_hover={{ bg: "blue.600" }}
					onClick={() => openModal()}
				>
					Tambah Fasilitas
				</Button>
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
					<InputGroup size="sm" w="300px">
						<InputLeftElement pointerEvents="none">
							<Icon as={MdSearch} color="gray.400" />
						</InputLeftElement>
						<Input
							placeholder="Cari nama fasilitas atau olahraga..."
							borderRadius="lg"
							bg="gray.50"
							border="1px solid"
							borderColor="gray.200"
							_focus={{ borderColor: "blue.400", bg: "white" }}
							value={search}
							onChange={(e: any) => setSearch(e.target.value)}
						/>
					</InputGroup>
				</Flex>

				<Box p={4}>
					<TableContainer>
						<Table size="sm" variant="simple">
							<Thead>
								<Tr>
									<Th color="gray.500" fontSize="xs" py={3}>No</Th>
									<Th color="gray.500" fontSize="xs">Gambar</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('nama')}>
										<Flex align="center">Nama Fasilitas <SortIcon columnKey="nama" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('olahraga')}>
										<Flex align="center">Jenis Olahraga <SortIcon columnKey="olahraga" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('status')}>
										<Flex align="center">Kondisi/Status <SortIcon columnKey="status" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" textAlign="center">Aksi</Th>
								</Tr>
							</Thead>
							<Tbody>
								{filteredAndSortedData.map((row: any, i: number) => (
									<Tr key={row.id} _hover={{ bg: "gray.50" }}>
										<Td color="gray.500" fontSize="sm">{i + 1}</Td>
										<Td>
											<Box w="40px" h="40px" borderRadius="md" overflow="hidden" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
												{row.image ? (
													<Image src={row.image} alt={row.nama} width="100%" height="100%" objectFit="cover" />
												) : (
													<Icon as={MdSearch} color="gray.400" />
												)}
											</Box>
										</Td>
										<Td fontSize="sm" fontWeight="600" color="gray.800">{row.nama}</Td>
										<Td fontSize="sm" color="gray.700">{row.olahraga}</Td>
										<Td>
											<Box
												display="inline-flex"
												alignItems="center"
												px={2.5}
												py={0.5}
												borderRadius="full"
												bg={row.status === "Bagus" ? "green.50" : "orange.50"}
												color={row.status === "Bagus" ? "green.700" : "orange.700"}
												fontSize="xs"
												fontWeight="600"
											>
												{row.status}
											</Box>
										</Td>
										<Td textAlign="center">
											<HStack spacing={2} justify="center">
												<Button size="xs" variant="ghost" colorScheme="blue" onClick={() => openModal(row)}>
													<Icon as={MdEdit} boxSize={4} />
												</Button>
												<Button size="xs" variant="ghost" colorScheme="red" onClick={() => handleDelete(row.id)}>
													<Icon as={MdDelete} boxSize={4} />
												</Button>
											</HStack>
										</Td>
									</Tr>
								))}
								{filteredAndSortedData.length === 0 && (
									<Tr>
										<Td colSpan={5} textAlign="center" py={6} color="gray.500">
											Data tidak ditemukan.
										</Td>
									</Tr>
								)}
							</Tbody>
						</Table>
					</TableContainer>
				</Box>
			</Box>

			<Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
				<ModalContent borderRadius="xl">
					<ModalHeader fontSize="md" fontWeight="700" borderBottom="1px solid" borderColor="gray.100">
						{formData.id === 0 ? "Tambah Fasilitas" : "Edit Fasilitas"}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody py={5}>
						<VStack spacing={4} align="stretch">
							<FormControl isRequired>
								<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Nama Fasilitas</FormLabel>
								<Input
									size="sm"
									borderRadius="lg"
									placeholder="Contoh: Lapangan Basket Outdoor"
									value={formData.nama}
									onChange={(e: any) => setFormData({ ...formData, nama: e.target.value })}
								/>
							</FormControl>
							<FormControl mb={4}>
								<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Gambar Fasilitas</FormLabel>
								<Input
									type="file"
									accept="image/*"
									size="sm"
									p={1}
									borderRadius="lg"
									onChange={handleImageUpload}
								/>
								{formData.image && (
									<Box mt={2} w="120px" h="80px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
										<Image src={formData.image} alt="Preview" width="100%" height="100%" objectFit="cover" />
									</Box>
								)}
							</FormControl>
							
							<FormControl isRequired>
								<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Jenis Olahraga</FormLabel>
								<Select size="sm" borderRadius="lg" value={formData.olahraga} onChange={(e: any) => setFormData({ ...formData, olahraga: e.target.value })}>
									{sportsData.length > 0 ? (
										sportsData.map(sport => (
											<option key={sport.id} value={sport.nama}>{sport.nama}</option>
										))
									) : (
										<>
											<option value="Basket">Basket</option>
											<option value="Bulutangkis">Bulutangkis</option>
											<option value="Futsal">Futsal</option>
											<option value="Sepakbola">Sepakbola</option>
											<option value="Tenis">Tenis</option>
											<option value="Voli">Voli</option>
										</>
									)}
								</Select>
							</FormControl>
							
							<FormControl mb={2}>
								<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Lokasi / Keterangan Letak</FormLabel>
								<Input
									size="sm"
									borderRadius="lg"
									placeholder="Contoh: Gedung Timur ITS"
									value={formData.lokasi}
									onChange={(e: any) => setFormData({ ...formData, lokasi: e.target.value })}
								/>
							</FormControl>

							<FormControl mb={2}>
								<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Deskripsi Singkat</FormLabel>
								<Textarea
									size="sm"
									borderRadius="lg"
									rows={3}
									placeholder="Tambahkan fasilitas yang ada..."
									value={formData.keterangan}
									onChange={(e: any) => setFormData({ ...formData, keterangan: e.target.value })}
								/>
							</FormControl>

							<FormControl isRequired>
								<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Kondisi / Status</FormLabel>
								<Select size="sm" borderRadius="lg" value={formData.status} onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}>
									<option value="Bagus">Bagus (Dapat Digunakan)</option>
									<option value="Perbaikan">Sedang Perbaikan</option>
									<option value="Tutup">Ditutup Sementara</option>
								</Select>
							</FormControl>
						</VStack>
					</ModalBody>
					<ModalFooter gap={2} borderTop="1px solid" borderColor="gray.100">
						<Button size="sm" variant="ghost" onClick={onClose}>Batal</Button>
						<Button size="sm" bg="blue.500" color="white" borderRadius="lg" _hover={{ bg: "blue.600" }} onClick={handleSubmit}>
							Simpan
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</AdminLayout>
	)
}

export default Fasilitas
