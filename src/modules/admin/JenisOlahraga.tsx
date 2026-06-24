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
	useDisclosure,
	Select,
	Textarea,
	Image,
} from "@chakra-ui/react"
import { MdSearch, MdAdd, MdEdit, MdDelete } from "react-icons/md"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { useState, useEffect, useMemo } from "react"
import { sanitizeText } from "@/utils/sanitize"
import AdminLayout from "./AdminLayout"

const INITIAL_DATA = [
	{ id: 1, nama: "Futsal", status: "Aktif", fasilitas: 2 },
	{ id: 2, nama: "Bulu Tangkis", status: "Aktif", fasilitas: 4 },
	{ id: 3, nama: "Basket", status: "Aktif", fasilitas: 2 },
	{ id: 4, nama: "Tenis", status: "Aktif", fasilitas: 1 },
	{ id: 5, nama: "Mini Soccer", status: "Aktif", fasilitas: 1 },
	{ id: 6, nama: "Voli", status: "Tidak Aktif", fasilitas: 0 },
]

const JenisOlahraga = () => {
	const [data, setData] = useState(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("jenis_olahraga_data")
			if (saved) return JSON.parse(saved)
		}
		return INITIAL_DATA
	})

	useEffect(() => {
		localStorage.setItem("jenis_olahraga_data", JSON.stringify(data))
	}, [data])
	const [search, setSearch] = useState("")
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [formData, setFormData] = useState({ id: 0, nama: "", status: "Aktif", image: "", keterangan: "" })

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

	const openModal = (item?: any) => {
		if (item) {
			setFormData({ id: item.id, nama: item.nama, status: item.status, image: item.image || "", keterangan: item.keterangan || "" })
		} else {
			setFormData({ id: 0, nama: "", status: "Aktif", image: "", keterangan: "" })
		}
		onOpen()
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
			item.nama.toLowerCase().includes(search.toLowerCase())
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

	const handleSubmit = () => {
		if (formData.nama) {
			const sanitizedNama = sanitizeText(formData.nama)
			const sanitizedKeterangan = sanitizeText(formData.keterangan)
			if (formData.id === 0) {
				setData([...data, { id: Date.now(), nama: sanitizedNama, status: formData.status, fasilitas: 0, image: formData.image, keterangan: sanitizedKeterangan }])
			} else {
				setData(data.map((d: any) => d.id === formData.id ? { ...d, nama: sanitizedNama, status: formData.status, image: formData.image, keterangan: sanitizedKeterangan } : d))
			}
			setFormData({ id: 0, nama: "", status: "Aktif", image: "", keterangan: "" })
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
						Jenis Olahraga
					</Text>
					<Text fontSize="sm" color="gray.500" mt={0.5}>
						Kelola data kategori atau jenis olahraga yang tersedia
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
					Tambah Jenis Olahraga
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
							placeholder="Cari jenis olahraga..."
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
										<Flex align="center">Nama Olahraga <SortIcon columnKey="nama" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" isNumeric cursor="pointer" onClick={() => handleSort('fasilitas')}>
										<Flex align="center" justify="flex-end">Jumlah Fasilitas Terkait <SortIcon columnKey="fasilitas" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('status')}>
										<Flex align="center">Status <SortIcon columnKey="status" /></Flex>
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
										<Td fontSize="sm" color="gray.700" isNumeric>{row.fasilitas} Fasilitas</Td>
										<Td>
											<Box
												display="inline-flex"
												alignItems="center"
												px={2.5}
												py={0.5}
												borderRadius="full"
												bg={row.status === "Aktif" ? "green.50" : "red.50"}
												color={row.status === "Aktif" ? "green.700" : "red.700"}
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

			<Modal isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
				<ModalContent borderRadius="xl">
					<ModalHeader fontSize="md" fontWeight="700" borderBottom="1px solid" borderColor="gray.100">
						{formData.id === 0 ? "Tambah Jenis Olahraga" : "Edit Jenis Olahraga"}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody py={5}>
						<FormControl isRequired mb={4}>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Nama Olahraga</FormLabel>
							<Input
								size="sm"
								borderRadius="lg"
								placeholder="Contoh: Panahan"
								value={formData.nama}
								onChange={(e: any) => setFormData({ ...formData, nama: e.target.value })}
							/>
						</FormControl>
						<FormControl mb={4}>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Gambar/Ikon</FormLabel>
							<Input
								type="file"
								accept="image/*"
								size="sm"
								p={1}
								borderRadius="lg"
								onChange={handleImageUpload}
							/>
							{formData.image && (
								<Box mt={2} w="80px" h="80px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
									<Image src={formData.image} alt="Preview" width="100%" height="100%" objectFit="cover" />
								</Box>
							)}
						</FormControl>
						<FormControl mb={4}>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Keterangan</FormLabel>
							<Textarea
								size="sm"
								borderRadius="lg"
								placeholder="Tambahkan deskripsi olahraga..."
								value={formData.keterangan}
								onChange={(e: any) => setFormData({ ...formData, keterangan: e.target.value })}
							/>
						</FormControl>
						<FormControl isRequired>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Status</FormLabel>
							<Select size="sm" borderRadius="lg" value={formData.status} onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}>
								<option value="Aktif">Aktif</option>
								<option value="Tidak Aktif">Tidak Aktif</option>
							</Select>
						</FormControl>
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

export default JenisOlahraga
