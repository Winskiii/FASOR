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
	Select,
	Input,
	InputGroup,
	InputLeftElement,
} from "@chakra-ui/react"
import { MdSearch, MdFilterList, MdFileDownload } from "react-icons/md"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { useRouter } from "next/router"
import { useState, useEffect, useMemo } from "react"
import { adminService } from "../../services/adminService"
import AdminLayout from "./AdminLayout"

const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID")

const STATUS_MAP: Record<string, { color: string; bg: string; label: string }> = {
	WaitingVerification: { color: "purple.700", bg: "purple.50", label: "Menunggu Verifikasi" },
	WaitingPayment:      { color: "orange.700", bg: "orange.50", label: "Menunggu Pembayaran" },
	Approved:            { color: "green.700",  bg: "green.50",  label: "Disetujui" },
	Canceled:            { color: "red.700",    bg: "red.50",    label: "Dibatalkan" },
	Booked:              { color: "blue.700",   bg: "blue.50",   label: "Dipesan" },
}

const StatusBadge = ({ status }: { status: string }) => {
	const s = STATUS_MAP[status] ?? { color: "gray.700", bg: "gray.100", label: status }
	return (
		<Box
			display="inline-flex"
			alignItems="center"
			px={2.5}
			py={0.5}
			borderRadius="full"
			bg={s.bg}
			color={s.color}
			fontSize="xs"
			fontWeight="600"
		>
			{s.label}
		</Box>
	)
}

const SemuaReservasi = () => {
	const router = useRouter()
	const [orders, setOrders] = useState<any[]>([])
	const [search, setSearch] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

	useEffect(() => {
		adminService.getDashboardData().then((res) => {
			if (res.status === 'success') {
				setOrders(res.data.orders)
			}
		}).catch(console.error)
	}, [])

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'asc'
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc'
		}
		setSortConfig({ key, direction })
	}

	const filteredAndSortedOrders = useMemo(() => {
		let result = [...orders]

		if (search) {
			const lowerSearch = search.toLowerCase()
			result = result.filter(order => 
				order.kode?.toLowerCase().includes(lowerSearch) || 
				order.atas_nama?.toLowerCase().includes(lowerSearch) ||
				order.fasilitas?.toLowerCase().includes(lowerSearch)
			)
		}

		if (statusFilter !== "all") {
			result = result.filter(order => order.status === statusFilter)
		}

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
	}, [orders, search, statusFilter, sortConfig])

	const SortIcon = ({ columnKey }: { columnKey: string }) => {
		if (sortConfig?.key === columnKey) {
			return sortConfig.direction === 'asc' ? <Icon as={FaSortUp} ml={1} /> : <Icon as={FaSortDown} ml={1} />
		}
		return <Icon as={FaSort} ml={1} color="gray.300" />
	}

	return (
		<AdminLayout>
			<Flex align="center" justify="space-between" mb={6}>
				<Box>
					<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
						Semua Reservasi
					</Text>
					<Text fontSize="sm" color="gray.500" mt={0.5}>
						Daftar seluruh riwayat pemesanan fasilitas olahraga
					</Text>
				</Box>
				<HStack spacing={3}>
					<Button size="sm" leftIcon={<Icon as={MdFileDownload} />} variant="outline" borderRadius="lg">
						Export CSV
					</Button>
				</HStack>
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
								placeholder="Cari kode booking, nama..."
								borderRadius="lg"
								bg="gray.50"
								border="1px solid"
								borderColor="gray.200"
								_focus={{ borderColor: "blue.400", bg: "white" }}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</InputGroup>
						<Select 
							size="sm" 
							borderRadius="lg" 
							w="180px" 
							value={statusFilter} 
							onChange={(e) => setStatusFilter(e.target.value)} 
							bg="gray.50"
						>
							<option value="all">Semua Status</option>
							<option value="WaitingVerification">Menunggu Verifikasi</option>
							<option value="WaitingPayment">Menunggu Pembayaran</option>
							<option value="Approved">Disetujui</option>
							<option value="Canceled">Dibatalkan</option>
						</Select>
					</HStack>
					<Button size="sm" leftIcon={<Icon as={MdFilterList} />} variant="ghost" colorScheme="blue">
						Filter Lainnya
					</Button>
				</Flex>

				<Box p={4}>
					<TableContainer>
						<Table size="sm" variant="simple">
							<Thead>
								<Tr>
									<Th color="gray.500" fontSize="xs" py={3}>No</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('kode')}>
										<Flex align="center">Kode Booking <SortIcon columnKey="kode" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('tanggal')}>
										<Flex align="center">Tanggal Pesan <SortIcon columnKey="tanggal" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('fasilitas')}>
										<Flex align="center">Fasilitas <SortIcon columnKey="fasilitas" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('atas_nama')}>
										<Flex align="center">Atas Nama <SortIcon columnKey="atas_nama" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('harga')}>
										<Flex align="center">Total Harga <SortIcon columnKey="harga" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('status')}>
										<Flex align="center">Status <SortIcon columnKey="status" /></Flex>
									</Th>
								</Tr>
							</Thead>
							<Tbody>
								{filteredAndSortedOrders.map((row: any, i: number) => (
									<Tr key={row.kode} _hover={{ bg: "gray.50" }} transition="background 0.1s">
										<Td color="gray.500" fontSize="sm">{i + 1}</Td>
										<Td>
											<Text
												fontSize="sm"
												fontWeight="600"
												color="blue.600"
												cursor="pointer"
												_hover={{ color: "blue.800", textDecoration: "underline" }}
												onClick={() => router.push(`/admin/reservasi/${row.kode}`)}
											>
												{row.kode}
											</Text>
										</Td>
										<Td fontSize="sm" color="gray.700">{row.tanggal}</Td>
										<Td fontSize="sm" color="gray.700">{row.fasilitas}</Td>
										<Td fontSize="sm" color="gray.700">{row.atas_nama}</Td>
										<Td fontSize="sm" fontWeight="600" color="gray.800">{formatRupiah(row.harga)}</Td>
										<Td><StatusBadge status={row.status} /></Td>
									</Tr>
								))}
							</Tbody>
						</Table>
					</TableContainer>

					<Flex align="center" justify="space-between" mt={4}>
						<Text fontSize="xs" color="gray.500">
							Menampilkan {filteredAndSortedOrders.length > 0 ? 1 : 0}–{filteredAndSortedOrders.length} dari {filteredAndSortedOrders.length} entri
						</Text>
						<HStack spacing={1}>
							<Button size="xs" borderRadius="md" colorScheme="blue" minW="32px">1</Button>
						</HStack>
					</Flex>
				</Box>
			</Box>
		</AdminLayout>
	)
}

export default SemuaReservasi
