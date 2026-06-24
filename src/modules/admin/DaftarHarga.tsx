import {
	Box,
	Flex,
	Text,
	Icon,
	Button,
	HStack,
	Select,
	Input,
	InputGroup,
	InputLeftElement,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	useDisclosure,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	FormControl,
	FormLabel,
	VStack,
	Badge,
} from "@chakra-ui/react"
import { MdSearch, MdAdd, MdEdit, MdDelete, MdArrowUpward, MdArrowDownward } from "react-icons/md"
import { useState, useEffect } from "react"
import { sanitizeText } from "@/utils/sanitize"
import { adminService } from "../../services/adminService"
import AdminLayout from "./AdminLayout"
import { TARIF_MOCK } from "../../data/tarifMock"

interface HargaRow {
	id: number
	fasilitas: string
	olahraga: string
	kegiatan: string
	jenis_pengguna: string
	harga: number
	shif: string
	waktu: string
	durasi: string
	aktif: boolean
}

const DEFAULT_SPORT_OPTIONS = [
	{ value: "basket",      label: "Basket" },
	{ value: "bulutangkis", label: "Bulutangkis" },
	{ value: "tenis",       label: "Tennis Lapangan" },
	{ value: "futsal",      label: "Futsal" },
	{ value: "sepakbola",   label: "Sepakbola" },
	{ value: "lari",        label: "Lari/Atletik" },
	{ value: "voli",        label: "Voli" },
]


const SHIF_MAP: Record<string, { color: string; bg: string }> = {
	pagi:  { color: "orange.700", bg: "orange.50"  },
	sore:  { color: "blue.700",   bg: "blue.50"    },
	malam: { color: "purple.700", bg: "purple.50"  },
}

const formatRupiah = (n: number) =>
	"Rp " + n.toLocaleString("id-ID")

const HargaTable = ({
	data,
	sportOptions,
	olahragaMap,
	onEdit,
	onDelete,
}: {
	data: HargaRow[]
	sportOptions: { value: string, label: string }[]
	olahragaMap: Record<string, string>
	onEdit: (row: HargaRow) => void
	onDelete: (row: HargaRow) => void
}) => {
	const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'asc'
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc'
		}
		setSortConfig({ key, direction })
	}

	const sortedData = [...data].sort((a, b) => {
		if (!sortConfig) return 0
		let valA: any = a[sortConfig.key as keyof HargaRow]
		let valB: any = b[sortConfig.key as keyof HargaRow]

		if (sortConfig.key === 'olahraga') {
			valA = sportOptions.find(s => s.value === (a.olahraga || olahragaMap[a.fasilitas]))?.label || ''
			valB = sportOptions.find(s => s.value === (b.olahraga || olahragaMap[b.fasilitas]))?.label || ''
		}

		if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
		if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
		return 0
	})

	const SortIcon = ({ columnKey }: { columnKey: string }) => {
		if (!sortConfig || sortConfig.key !== columnKey) return null
		return <Icon as={sortConfig.direction === 'asc' ? MdArrowUpward : MdArrowDownward} ml={1} />
	}

	return (
	<TableContainer>
		<Table size="sm" variant="simple">
			<Thead>
				<Tr>
					<Th color="gray.500" fontSize="xs" py={3}>No</Th>
					<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('fasilitas')}>Fasilitas <SortIcon columnKey="fasilitas" /></Th>
					<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('olahraga')}>Jenis Olahraga <SortIcon columnKey="olahraga" /></Th>
					<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('kegiatan')}>Kegiatan <SortIcon columnKey="kegiatan" /></Th>
					<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('jenis_pengguna')}>Jenis Pengguna <SortIcon columnKey="jenis_pengguna" /></Th>
					<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('harga')}>Harga <SortIcon columnKey="harga" /></Th>
					<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('shif')}>Waktu & Durasi <SortIcon columnKey="shif" /></Th>
					<Th color="gray.500" fontSize="xs">Aksi</Th>
				</Tr>
			</Thead>
			<Tbody>
				{sortedData.map((row: any, i: number) => {
					const shifStyle = SHIF_MAP[row.shif] ?? { color: "gray.700", bg: "gray.100" }
					return (
						<Tr key={row.id} _hover={{ bg: "gray.50" }} transition="background 0.1s">
							<Td color="gray.500" fontSize="sm">{i + 1}</Td>
							<Td fontSize="sm" color="gray.800" fontWeight="500">{row.fasilitas}</Td>
							<Td fontSize="sm" color="gray.700">{sportOptions.find(s => s.value === (row.olahraga || olahragaMap[row.fasilitas]))?.label || (row.olahraga || olahragaMap[row.fasilitas] || "-")}</Td>
							<Td fontSize="sm">
								<Box
									display="inline-flex"
									px={2}
									py={0.5}
									borderRadius="md"
									bg="blue.50"
									color="blue.700"
									fontSize="xs"
									fontWeight="600"
								>
									{row.kegiatan}
								</Box>
							</Td>
							<Td fontSize="sm" color="gray.700" maxW="220px">{row.jenis_pengguna}</Td>
							<Td fontSize="sm" fontWeight="700" color="gray.800">
								{formatRupiah(row.harga)}
							</Td>
							<Td>
								<VStack align="start" spacing={1}>
									<HStack>
										<Box
											display="inline-flex"
											px={2.5}
											py={0.5}
											borderRadius="full"
											bg={shifStyle.bg}
											color={shifStyle.color}
											fontSize="xs"
											fontWeight="600"
										>
											{row.shif}
										</Box>
										<Text fontSize="xs" color="gray.500" fontWeight="600">
											{row.durasi}
										</Text>
									</HStack>
									<Text fontSize="xs" color="gray.500" fontWeight="500">
										{row.waktu}
									</Text>
								</VStack>
							</Td>
							<Td>
								<HStack spacing={2}>
									<Button
										size="xs"
										leftIcon={<Icon as={MdEdit} />}
										colorScheme="blue"
										borderRadius="md"
										onClick={() => onEdit(row)}
									>
										Edit
									</Button>
									<Button
										size="xs"
										leftIcon={<Icon as={MdDelete} />}
										colorScheme="red"
										borderRadius="md"
										onClick={() => onDelete(row)}
									>
										Hapus
									</Button>
								</HStack>
							</Td>
						</Tr>
					)
				})}
			</Tbody>
		</Table>
	</TableContainer>
	)
}

const EditModal = ({
	isOpen,
	onClose,
	row,
	sportOptions,
	olahragaMap,
	onSave,
}: {
	isOpen: boolean
	onClose: () => void
	row: HargaRow | null
	sportOptions: { value: string, label: string }[]
	olahragaMap: Record<string, string>
	onSave: (data: any) => void
}) => {
	const [formData, setFormData] = useState<any>({
		fasilitas: "",
		olahraga: "basket",
		kegiatan: "Umum",
		jenis_pengguna: "Semua",
		harga: 0,
		shif: "pagi",
		waktu: "06.00-12.00",
		durasi: "1 Jam"
	});

	useEffect(() => {
		if (row) {
			setFormData({...row, olahraga: row.olahraga || olahragaMap[row.fasilitas] || "basket", waktu: row.waktu || "06.00-12.00", durasi: row.durasi || "1 Jam"});
		} else {
			setFormData({
				fasilitas: "",
				olahraga: "basket",
				kegiatan: "Umum",
				jenis_pengguna: "Semua",
				harga: 0,
				shif: "pagi",
				waktu: "06.00-12.00",
				durasi: "1 Jam"
			});
		}
	}, [row, isOpen]);

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
			<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
			<ModalContent borderRadius="xl" shadow="xl">
				<ModalHeader fontSize="md" fontWeight="700" borderBottom="1px solid" borderColor="gray.100" pb={4}>
					{row ? "Edit Data Harga" : "Buat Data Baru"}
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody py={5}>
					<VStack spacing={4} align="stretch">
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Jenis Olahraga</FormLabel>
							<Select size="sm" borderRadius="lg" value={formData.olahraga} onChange={(e: any) => setFormData({...formData, olahraga: e.target.value})} bg="gray.50">
								{sportOptions.map(opt => (
									<option key={opt.value} value={opt.value}>{opt.label}</option>
								))}
							</Select>
						</FormControl>
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Fasilitas</FormLabel>
							<Input size="sm" borderRadius="lg" value={formData.fasilitas} onChange={(e: any) => setFormData({...formData, fasilitas: e.target.value})} bg="gray.50" />
						</FormControl>
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Kegiatan</FormLabel>
							<Input size="sm" borderRadius="lg" value={formData.kegiatan} onChange={(e: any) => setFormData({...formData, kegiatan: e.target.value})} bg="gray.50" />
						</FormControl>
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Jenis Pengguna</FormLabel>
							<Input size="sm" borderRadius="lg" value={formData.jenis_pengguna} onChange={(e: any) => setFormData({...formData, jenis_pengguna: e.target.value})} bg="gray.50" />
						</FormControl>
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Harga (Rp)</FormLabel>
							<Input size="sm" borderRadius="lg" type="number" value={formData.harga} onChange={(e: any) => setFormData({...formData, harga: Number(e.target.value)})} bg="gray.50" />
						</FormControl>
						<HStack spacing={3}>
							<FormControl>

								<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Shif</FormLabel>
								<Select size="sm" borderRadius="lg" value={formData.shif} onChange={(e: any) => setFormData({...formData, shif: e.target.value})} bg="gray.50">
									<option value="pagi">Pagi</option>
									<option value="sore">Sore</option>
									<option value="malam">Malam</option>
								</Select>
							</FormControl>
							<FormControl>
								<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Waktu</FormLabel>
								<Input size="sm" borderRadius="lg" value={formData.waktu} onChange={(e) => setFormData({...formData, waktu: e.target.value})} placeholder="06.00-12.00" bg="gray.50" />
							</FormControl>
							<FormControl>
								<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Durasi</FormLabel>
								<Input size="sm" borderRadius="lg" value={formData.durasi} onChange={(e) => setFormData({...formData, durasi: e.target.value})} placeholder="1 Jam" bg="gray.50" />
							</FormControl>
						</HStack>
					</VStack>
				</ModalBody>
				<ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
					<Button size="sm" variant="ghost" onClick={onClose}>Batal</Button>
					<Button size="sm" bg="blue.500" color="white" borderRadius="lg" _hover={{ bg: "blue.600" }} onClick={() => onSave(formData)}>
						Simpan
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}

const DeleteModal = ({
	isOpen,
	onClose,
	row,
	onConfirm,
}: {
	isOpen: boolean
	onClose: () => void
	row: HargaRow | null
	onConfirm: (id: string) => void
}) => (
	<Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
		<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
		<ModalContent borderRadius="xl" shadow="xl">
			<ModalHeader fontSize="md" fontWeight="700">Hapus Data Harga</ModalHeader>
			<ModalCloseButton />
			<ModalBody>
				<Text fontSize="sm" color="gray.600">
					Yakin ingin menonaktifkan harga{" "}
					<Text as="span" fontWeight="700" color="gray.800">
						{row?.fasilitas}
					</Text>{" "}
					({row?.shif})?
				</Text>
			</ModalBody>
			<ModalFooter gap={2}>
				<Button size="sm" variant="ghost" onClick={onClose}>Batal</Button>
				<Button size="sm" colorScheme="red" borderRadius="lg" onClick={() => { if(row?.id) onConfirm(row.id.toString()); }}>
					Hapus
				</Button>
			</ModalFooter>
		</ModalContent>
	</Modal>
)

const DaftarHargaPage = () => {
	const [selectedSport, setSelectedSport] = useState("basket")
	const [search, setSearch] = useState("")
	const [selectedRow, setSelectedRow] = useState<HargaRow | null>(null)
	const [data, setData] = useState<HargaRow[]>([])
	const [sportOptions, setSportOptions] = useState(DEFAULT_SPORT_OPTIONS)
	const [olahragaMap, setOlahragaMap] = useState<Record<string, string>>({})

	const editModal = useDisclosure()
	const deleteModal = useDisclosure()

	useEffect(() => {
		const savedSports = localStorage.getItem("jenis_olahraga_data")
		if (savedSports) {
			const parsed = JSON.parse(savedSports)
			if (Array.isArray(parsed) && parsed.length > 0) {
				setSportOptions(parsed.map((p: any) => ({ value: p.nama.toLowerCase(), label: p.nama })))
			}
		}
		const mapStr = localStorage.getItem("olahraga_map")
		if (mapStr) setOlahragaMap(JSON.parse(mapStr))
	}, [])

	const fetchData = async () => {
		try {
			const res = await adminService.getTarif();
			if (res && res.status === 'success' && Array.isArray(res.data)) {
				setData(res.data);
				localStorage.setItem("tarif_data", JSON.stringify(res.data));
				return;
			}
		} catch (error) {
			console.error("Error fetching tariffs from API:", error);
		}

		// Fallback to localStorage
		const savedData = localStorage.getItem("tarif_data")
		if (savedData) {
			setData(JSON.parse(savedData))
		} else {
			setData(TARIF_MOCK)
			localStorage.setItem("tarif_data", JSON.stringify(TARIF_MOCK))
		}
	}

	useEffect(() => {
		fetchData()
	}, [])

	const activeData = data.filter(
		(h) =>
			h.aktif &&
			(h.fasilitas.toLowerCase().includes(search.toLowerCase()) ||
				h.kegiatan.toLowerCase().includes(search.toLowerCase()))
	)
	const inactiveData = data.filter(
		(h) =>
			!h.aktif &&
			(h.fasilitas.toLowerCase().includes(search.toLowerCase()) ||
				h.kegiatan.toLowerCase().includes(search.toLowerCase()))
	)

	const handleEdit = (row: HargaRow) => {
		setSelectedRow(row)
		editModal.onOpen()
	}

	const handleCreate = () => {
		setSelectedRow(null)
		editModal.onOpen()
	}

	const handleDelete = (row: HargaRow) => {
		setSelectedRow(row)
		deleteModal.onOpen()
	}

	const onSaveHarga = async (formData: any) => {
		try {
			const sanitizedFormData = {
				...formData,
				fasilitas: sanitizeText(formData.fasilitas),
				kegiatan: sanitizeText(formData.kegiatan),
				jenis_pengguna: sanitizeText(formData.jenis_pengguna),
				waktu: sanitizeText(formData.waktu),
				durasi: sanitizeText(formData.durasi)
			}
			const updatedMap = { ...olahragaMap, [sanitizedFormData.fasilitas]: sanitizedFormData.olahraga }
			setOlahragaMap(updatedMap)
			localStorage.setItem("olahraga_map", JSON.stringify(updatedMap))

			if (selectedRow) {
				try {
					await adminService.updateTarif(selectedRow.id.toString(), sanitizedFormData);
				} catch (apiErr) {
					console.error("API updateTarif failed:", apiErr);
				}
				const newData = data.map(d => d.id === selectedRow.id ? { ...d, ...sanitizedFormData, olahraga: sanitizedFormData.olahraga } : d)
				localStorage.setItem("tarif_data", JSON.stringify(newData))
			} else {
				try {
					await adminService.createTarif(sanitizedFormData);
				} catch (apiErr) {
					console.error("API createTarif failed:", apiErr);
				}
				const newId = Date.now()
				const newData = [...data, { ...sanitizedFormData, id: newId, olahraga: sanitizedFormData.olahraga, aktif: true }]
				localStorage.setItem("tarif_data", JSON.stringify(newData))
			}
			fetchData()
			editModal.onClose()
		} catch (e) { console.error(e) }
	}

	const onConfirmDelete = async (id: string) => {
		try {
			try {
				await adminService.deleteTarif(id);
			} catch (apiErr) {
				console.error("API deleteTarif failed:", apiErr);
			}
			const newData = data.filter(d => d.id.toString() !== id)
			localStorage.setItem("tarif_data", JSON.stringify(newData))
			fetchData()
			deleteModal.onClose()
		} catch (e) { console.error(e) }
	}

	return (
		<AdminLayout>
			<Flex align="center" justify="space-between" mb={6}>
				<Box>
					<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
						Daftar Harga
					</Text>
					<Text fontSize="sm" color="gray.500" mt={0.5}>
						Kelola harga sewa fasilitas olahraga
					</Text>
				</Box>
				<Button
					leftIcon={<Icon as={MdAdd} />}
					size="sm"
					bg="blue.500"
					color="white"
					borderRadius="lg"
					fontWeight="600"
					_hover={{ bg: "blue.600" }}
					onClick={handleCreate}
				>
					Buat Data Baru
				</Button>
			</Flex>

			<Flex align="center" gap={3} mb={5}>
				<Select
					size="sm"
					borderRadius="lg"
					w="220px"
					bg="white"
					value={selectedSport}
					onChange={(e: any) => setSelectedSport(e.target.value)}
					fontWeight="500"
					shadow="sm"
					border="1px solid"
					borderColor="gray.200"
				>
					{sportOptions.map((s) => (
						<option key={s.value} value={s.value}>{s.label}</option>
					))}
				</Select>
				<InputGroup size="sm" w="260px">
					<InputLeftElement pointerEvents="none">
						<Icon as={MdSearch} color="gray.400" />
					</InputLeftElement>
					<Input
						placeholder="Cari fasilitas atau kegiatan..."
						borderRadius="lg"
						bg="white"
						border="1px solid"
						borderColor="gray.200"
						value={search}
						onChange={(e: any) => setSearch(e.target.value)}
						_focus={{ borderColor: "blue.400", bg: "white" }}
						shadow="sm"
					/>
				</InputGroup>
			</Flex>

			<Box
				bg="white"
				borderRadius="xl"
				boxShadow="sm"
				border="1px solid"
				borderColor="gray.100"
				overflow="hidden"
			>
				<Tabs variant="line" colorScheme="blue">
					<TabList
						px={6}
						pt={4}
						borderBottom="1px solid"
						borderColor="gray.100"
						gap={4}
					>
						<Tab
							fontSize="sm"
							fontWeight="600"
							pb={4}
							px={0}
							color="gray.500"
							_selected={{ color: "blue.600", borderColor: "blue.600" }}
						>
							<HStack spacing={2}>
								<Text>Harga Aktif</Text>
								<Box
									bg="green.100"
									color="green.700"
									borderRadius="full"
									px={2}
									fontSize="xs"
									fontWeight="700"
								>
									{activeData.length}
								</Box>
							</HStack>
						</Tab>
						<Tab
							fontSize="sm"
							fontWeight="600"
							pb={4}
							px={0}
							color="gray.500"
							_selected={{ color: "blue.600", borderColor: "blue.600" }}
						>
							<HStack spacing={2}>
								<Text>Harga Tidak Aktif</Text>
								<Box
									bg="gray.100"
									color="gray.600"
									borderRadius="full"
									px={2}
									fontSize="xs"
									fontWeight="700"
								>
									{inactiveData.length}
								</Box>
							</HStack>
						</Tab>
					</TabList>

					<TabPanels>
						<TabPanel p={4}>
							{activeData.length === 0 ? (
								<Flex align="center" justify="center" py={12} color="gray.400">
									<Text fontSize="sm">Tidak ada data harga aktif</Text>
								</Flex>
							) : (
								<HargaTable data={activeData} sportOptions={sportOptions} olahragaMap={olahragaMap} onEdit={handleEdit} onDelete={handleDelete} />
							)}
						</TabPanel>
						<TabPanel p={4}>
							{inactiveData.length === 0 ? (
								<Flex align="center" justify="center" py={12} color="gray.400">
									<Text fontSize="sm">Tidak ada data harga tidak aktif</Text>
								</Flex>
							) : (
								<HargaTable data={inactiveData} sportOptions={sportOptions} olahragaMap={olahragaMap} onEdit={handleEdit} onDelete={handleDelete} />
							)}
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>

			<EditModal isOpen={editModal.isOpen} onClose={editModal.onClose} row={selectedRow} sportOptions={sportOptions} olahragaMap={olahragaMap} onSave={onSaveHarga} />
			<DeleteModal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} row={selectedRow} onConfirm={onConfirmDelete} />
		</AdminLayout>
	)
}

export default DaftarHargaPage
