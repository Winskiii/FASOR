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
	Select,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	Spinner,
	useToast,
	Badge,
	Center,
	VStack,
} from "@chakra-ui/react"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import AdminLayout from "./AdminLayout"

const SesiAdmin = () => {
	const [fasilitasList, setFasilitasList] = useState<any[]>([])
	const [selectedFasilitas, setSelectedFasilitas] = useState<string>("")
	const [sesiData, setSesiData] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [search, setSearch] = useState("")
	const [tabIndex, setTabIndex] = useState(0) // 0: Aktif, 1: Tidak Aktif
	const toast = useToast()
	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"

	useEffect(() => {
		fetchFasilitas()
	}, [])

	useEffect(() => {
		fetchSesi()
	}, [selectedFasilitas])

	const fetchFasilitas = async () => {
		try {
			const res = await axios.get(`${baseUrl}/admin/fasilitas/fasilitas`, {
				withCredentials: true,
			})
			if (res.data?.data) {
				setFasilitasList(res.data.data)
			}
		} catch (error) {
			console.error("Failed to fetch fasilitas:", error)
		}
	}

	const fetchSesi = async () => {
		setIsLoading(true)
		try {
			const query = selectedFasilitas ? `?id_fasilitas=${selectedFasilitas}` : ""
			const res = await axios.get(`${baseUrl}/admin/fasilitas/sesi${query}`, {
				withCredentials: true,
			})
			if (res.data?.data) {
				setSesiData(res.data.data)
			}
		} catch (error) {
			console.error("Failed to fetch sesi:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleAction = (id_tarif: string, action: string) => {
		toast({
			title: "Fitur Belum Tersedia",
			description: `Fungsi ${action} sesi belum diimplementasikan untuk prototype ini.`,
			status: "info",
			duration: 3000,
			isClosable: true,
		})
	}

	const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'asc'
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc'
		}
		setSortConfig({ key, direction })
	}

	const isActiveTab = tabIndex === 0
	
	const filteredAndSortedData = useMemo(() => {
		let result = sesiData.filter((item) => {
			const matchStatus = item.is_active === isActiveTab
			const matchSearch =
				search === "" ||
				item.sesi?.toLowerCase().includes(search.toLowerCase()) ||
				item.shift?.toLowerCase().includes(search.toLowerCase()) ||
				item.fasilitas?.toLowerCase().includes(search.toLowerCase())
			return matchStatus && matchSearch
		})

		if (sortConfig !== null) {
			result.sort((a, b) => {
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
	}, [sesiData, search, isActiveTab, sortConfig])

	const SortIcon = ({ columnKey }: { columnKey: string }) => {
		if (sortConfig?.key === columnKey) {
			return sortConfig.direction === 'asc' ? <Icon as={FaSortUp} ml={1} /> : <Icon as={FaSortDown} ml={1} />
		}
		return <Icon as={FaSort} ml={1} color="gray.300" />
	}

	return (
		<AdminLayout>
			<Flex align="center" justify="space-between" mb={6}>
				<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
					Sesi
				</Text>
				<Button size="sm" bg="blue.500" color="white" _hover={{ bg: "blue.600" }}>
					Buat Data Baru
				</Button>
			</Flex>

			<Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
				<Flex px={6} py={4} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100">
					<Text fontSize="md" fontWeight="700" color="gray.800">
						DAFTAR SESI
					</Text>
					<Select
						size="sm"
						w="240px"
						borderRadius="md"
						value={selectedFasilitas}
						onChange={(e) => setSelectedFasilitas(e.target.value)}
					>
						<option value="">Semua Fasilitas</option>
						{fasilitasList.map((f: any) => (
							<option key={f.id_fasilitas} value={f.id_fasilitas}>
								{f.nama}
							</option>
						))}
					</Select>
				</Flex>

				<Tabs index={tabIndex} onChange={(i) => setTabIndex(i)} colorScheme="blue" size="sm">
					<TabList px={6} borderBottom="1px solid" borderColor="gray.200">
						<Tab fontWeight="600" py={3}>Sesi Aktif</Tab>
						<Tab fontWeight="600" py={3}>Sesi Tidak Aktif</Tab>
					</TabList>

					<TabPanels>
						<TabPanel p={0}>
							<Flex px={6} py={4} justify="space-between" align="center">
								<HStack spacing={2}>
									<Text fontSize="sm" color="gray.600">Show</Text>
									<Select size="sm" w="70px" borderRadius="md" defaultValue="10">
										<option value="10">10</option>
										<option value="25">25</option>
										<option value="50">50</option>
									</Select>
									<Text fontSize="sm" color="gray.600">entries</Text>
								</HStack>
								<HStack>
									<Text fontSize="sm" color="gray.600" fontWeight="600">Search:</Text>
									<Input
										size="sm"
										w="200px"
										borderRadius="md"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
								</HStack>
							</Flex>

							<TableContainer>
								<Table size="sm" variant="simple">
									<Thead>
										<Tr>
											<Th color="gray.700" fontWeight="700">No</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('fasilitas')}>
												<Flex align="center">Fasilitas <SortIcon columnKey="fasilitas" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('sesi')}>
												<Flex align="center">Sesi <SortIcon columnKey="sesi" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('mulai')}>
												<Flex align="center">Mulai <SortIcon columnKey="mulai" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('selesai')}>
												<Flex align="center">Selesai <SortIcon columnKey="selesai" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('shift')}>
												<Flex align="center">Shift <SortIcon columnKey="shift" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('hari_penggunaan')}>
												<Flex align="center">Hari Penggunaan <SortIcon columnKey="hari_penggunaan" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" textAlign="center">Aksi</Th>
										</Tr>
									</Thead>
									<Tbody>
										{isLoading ? (
											<Tr>
												<Td colSpan={8}>
													<Center py={6}><Spinner color="blue.500" /></Center>
												</Td>
											</Tr>
										) : filteredAndSortedData.length === 0 ? (
											<Tr>
												<Td colSpan={8} textAlign="center" py={6} color="gray.500">
													Tidak ada data sesi.
												</Td>
											</Tr>
										) : (
											filteredAndSortedData.map((row: any, i: number) => (
												<Tr key={`${row.id_tarif}-${i}`} _hover={{ bg: "gray.50" }}>
													<Td fontSize="sm" color="gray.600">{i + 1}</Td>
													<Td fontSize="sm" color="gray.700" whiteSpace="normal" maxW="200px">{row.fasilitas}</Td>
													<Td fontSize="sm" color="gray.600">{row.sesi}</Td>
													<Td fontSize="sm" color="gray.600">{row.mulai}</Td>
													<Td fontSize="sm" color="gray.600">{row.selesai}</Td>
													<Td fontSize="sm" color="gray.600">{row.shift}</Td>
													<Td fontSize="sm" color="gray.500" whiteSpace="normal" maxW="300px">
														{row.hari_penggunaan}
													</Td>
													<Td textAlign="center">
														<VStack spacing={1} justify="center">
															<Button size="xs" colorScheme="blue" w="60px" onClick={() => handleAction(row.id_tarif, "Edit")}>
																Edit
															</Button>
															<Button size="xs" colorScheme="red" w="60px" onClick={() => handleAction(row.id_tarif, "Hapus")}>
																Hapus
															</Button>
														</VStack>
													</Td>
												</Tr>
											))
										)}
									</Tbody>
								</Table>
							</TableContainer>
							<Flex px={6} py={4} justify="flex-end">
								{/* Pagination can go here */}
							</Flex>
						</TabPanel>
						<TabPanel p={0}>
							{/* Inactive tab can share the same table layout, it's just filtered */}
							<Flex px={6} py={4} justify="space-between" align="center">
								<HStack spacing={2}>
									<Text fontSize="sm" color="gray.600">Show</Text>
									<Select size="sm" w="70px" borderRadius="md" defaultValue="10">
										<option value="10">10</option>
									</Select>
									<Text fontSize="sm" color="gray.600">entries</Text>
								</HStack>
								<HStack>
									<Text fontSize="sm" color="gray.600" fontWeight="600">Search:</Text>
									<Input
										size="sm"
										w="200px"
										borderRadius="md"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
								</HStack>
							</Flex>
							<TableContainer>
								<Table size="sm" variant="simple">
									<Thead>
										<Tr>
											<Th color="gray.700" fontWeight="700">No</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('fasilitas')}>
												<Flex align="center">Fasilitas <SortIcon columnKey="fasilitas" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('sesi')}>
												<Flex align="center">Sesi <SortIcon columnKey="sesi" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('mulai')}>
												<Flex align="center">Mulai <SortIcon columnKey="mulai" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('selesai')}>
												<Flex align="center">Selesai <SortIcon columnKey="selesai" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('shift')}>
												<Flex align="center">Shift <SortIcon columnKey="shift" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('hari_penggunaan')}>
												<Flex align="center">Hari Penggunaan <SortIcon columnKey="hari_penggunaan" /></Flex>
											</Th>
											<Th color="gray.700" fontWeight="700" textAlign="center">Aksi</Th>
										</Tr>
									</Thead>
									<Tbody>
										{isLoading ? (
											<Tr>
												<Td colSpan={8}>
													<Center py={6}><Spinner color="blue.500" /></Center>
												</Td>
											</Tr>
										) : filteredAndSortedData.length === 0 ? (
											<Tr>
												<Td colSpan={8} textAlign="center" py={6} color="gray.500">
													Tidak ada data sesi tidak aktif.
												</Td>
											</Tr>
										) : (
											filteredAndSortedData.map((row: any, i: number) => (
												<Tr key={`${row.id_tarif}-${i}`} _hover={{ bg: "gray.50" }}>
													<Td fontSize="sm" color="gray.600">{i + 1}</Td>
													<Td fontSize="sm" color="gray.700" whiteSpace="normal" maxW="200px">{row.fasilitas}</Td>
													<Td fontSize="sm" color="gray.600">{row.sesi}</Td>
													<Td fontSize="sm" color="gray.600">{row.mulai}</Td>
													<Td fontSize="sm" color="gray.600">{row.selesai}</Td>
													<Td fontSize="sm" color="gray.600">{row.shift}</Td>
													<Td fontSize="sm" color="gray.500" whiteSpace="normal" maxW="300px">
														{row.hari_penggunaan}
													</Td>
													<Td textAlign="center">
														<Button size="xs" colorScheme="green" onClick={() => handleAction(row.id_tarif, "Aktifkan")}>
															Aktifkan
														</Button>
													</Td>
												</Tr>
											))
										)}
									</Tbody>
								</Table>
							</TableContainer>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>
		</AdminLayout>
	)
}

export default SesiAdmin
