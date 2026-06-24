import {
	Box,
	Flex,
	Text,
	Icon,
	Grid,
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
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
} from "@chakra-ui/react"
import { MdSearch, MdEventNote, MdPendingActions, MdCheckCircle, MdCancel, MdTrendingUp, MdTrendingDown } from "react-icons/md"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { FiClock } from "react-icons/fi"
import { useRouter } from "next/router"
import { useState, useEffect, useMemo } from "react"
import { adminService } from "../../services/adminService"
import AdminLayout from "./AdminLayout"

const STAT_CARDS = [
	{
		label: "Total Reservasi",
		icon: MdEventNote,
		color: "blue.500",
		bg: "blue.50",
	},
	{
		label: "Menunggu Verifikasi",
		icon: MdPendingActions,
		color: "purple.500",
		bg: "purple.50",
	},
	{
		label: "Menunggu Pembayaran",
		icon: FiClock,
		color: "orange.500",
		bg: "orange.50",
	},
	{
		label: "Disetujui",
		icon: MdCheckCircle,
		color: "green.500",
		bg: "green.50",
	},
	{
		label: "Dibatalkan",
		icon: MdCancel,
		color: "red.500",
		bg: "red.50",
	},
]

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

const OrdersTable = ({ data, searchQuery = "" }: { data: any[], searchQuery?: string }) => {
	const router = useRouter()
	const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'asc'
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc'
		}
		setSortConfig({ key, direction })
	}

	const filteredAndSortedData = useMemo(() => {
		let result = [...data]

		if (searchQuery) {
			const lowerSearch = searchQuery.toLowerCase()
			result = result.filter(order => 
				order.kode?.toLowerCase().includes(lowerSearch) || 
				order.atas_nama?.toLowerCase().includes(lowerSearch) ||
				order.fasilitas?.toLowerCase().includes(lowerSearch)
			)
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
	}, [data, searchQuery, sortConfig])

	const SortIcon = ({ columnKey }: { columnKey: string }) => {
		if (sortConfig?.key === columnKey) {
			return sortConfig.direction === 'asc' ? <Icon as={FaSortUp} ml={1} /> : <Icon as={FaSortDown} ml={1} />
		}
		return <Icon as={FaSort} ml={1} color="gray.300" />
	}

	return (
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
				{filteredAndSortedData.map((row: any, i: number) => (
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
	)
}

const AdminDashboard = () => {
	const [data, setData] = useState<{
		stats: { total: number; waiting_verification: number; waiting_payment: number; approved: number; canceled: number }
		changes: { total: number; waiting_verification: number; waiting_payment: number; approved: number; canceled: number }
		orders: any[]
	}>({
		stats: { total: 0, waiting_verification: 0, waiting_payment: 0, approved: 0, canceled: 0 },
		changes: { total: 0, waiting_verification: 0, waiting_payment: 0, approved: 0, canceled: 0 },
		orders: []
	})

	const [filterType, setFilterType] = useState<"tahun" | "bulan" | "tanggal">("tahun")
	const [filterYear, setFilterYear] = useState("2026")
	const [filterMonth, setFilterMonth] = useState("07") // July
	const [filterDate, setFilterDate] = useState(() => {
		const d = new Date()
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
	})
	const [searchQuery, setSearchQuery] = useState("")

	const handleTampilkan = () => {
		let value = ""
		if (filterType === "tahun") {
			value = filterYear
		} else if (filterType === "bulan") {
			value = `${filterYear}-${filterMonth}`
		} else if (filterType === "tanggal") {
			value = filterDate
		}
		
		adminService.getDashboardData(filterType, value).then((res) => {
			if (res.status === 'success') {
				setData({
					stats: res.data.stats,
					changes: res.data.changes || { total: 0, waiting_verification: 0, waiting_payment: 0, approved: 0, canceled: 0 },
					orders: res.data.orders
				})
			}
		}).catch(console.error)
	}

	useEffect(() => {
		handleTampilkan()
	}, [])

	const waitingVerificationOrders = useMemo(() => {
		return data.orders
			.filter(o => o.status === 'WaitingVerification')
			.sort((a, b) => {
				const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
				const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
				return bTime - aTime; // Newest first (descending)
			});
	}, [data.orders])

	const waitingPaymentOrders = useMemo(() => {
		return data.orders
			.filter(o => o.status === 'WaitingPayment')
			.sort((a, b) => {
				const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
				const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
				return bTime - aTime; // Newest first (descending)
			});
	}, [data.orders])
	
	const dynamicStatCards = [
		{ ...STAT_CARDS[0], value: (data.stats.total ?? 0).toString(), change: data.changes?.total ?? 0 },
		{ ...STAT_CARDS[1], value: (data.stats.waiting_verification ?? 0).toString(), change: data.changes?.waiting_verification ?? 0 },
		{ ...STAT_CARDS[2], value: (data.stats.waiting_payment ?? 0).toString(), change: data.changes?.waiting_payment ?? 0 },
		{ ...STAT_CARDS[3], value: (data.stats.approved ?? 0).toString(), change: data.changes?.approved ?? 0 },
		{ ...STAT_CARDS[4], value: (data.stats.canceled ?? 0).toString(), change: data.changes?.canceled ?? 0 },
	]

	const changePeriodLabel = 
		filterType === "tahun" ? "dari tahun lalu" : 
		filterType === "bulan" ? "dari bulan lalu" : "dari kemarin"

	return (
		<AdminLayout>
			<Flex align="center" justify="space-between" mb={6}>
				<Box>
					<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
						Dashboard
					</Text>
					<Text fontSize="sm" color="gray.500" mt={0.5}>
						Selamat datang di panel admin Fasor ITS
					</Text>
				</Box>
				<HStack spacing={3}>
					<Select
						size="sm"
						borderRadius="lg"
						w="150px"
						value={filterType}
						onChange={(e: any) => setFilterType(e.target.value)}
						bg="white"
					>
						<option value="tahun">Berdasarkan Tahun</option>
						<option value="bulan">Berdasarkan Bulan</option>
						<option value="tanggal">Berdasarkan Tanggal</option>
					</Select>
					
					{filterType === "tahun" && (
						<Select
							size="sm"
							borderRadius="lg"
							w="100px"
							value={filterYear}
							onChange={(e: any) => setFilterYear(e.target.value)}
							bg="white"
						>
							{[2026, 2025, 2024].map((y) => (
								<option key={y} value={y}>{y}</option>
							))}
						</Select>
					)}
					
					{filterType === "bulan" && (
						<Select
							size="sm"
							borderRadius="lg"
							w="130px"
							value={filterMonth}
							onChange={(e: any) => setFilterMonth(e.target.value)}
							bg="white"
						>
							{[
								{ val: "01", label: "Januari" },
								{ val: "02", label: "Februari" },
								{ val: "03", label: "Maret" },
								{ val: "04", label: "April" },
								{ val: "05", label: "Mei" },
								{ val: "06", label: "Juni" },
								{ val: "07", label: "Juli" },
								{ val: "08", label: "Agustus" },
								{ val: "09", label: "September" },
								{ val: "10", label: "Oktober" },
								{ val: "11", label: "November" },
								{ val: "12", label: "Desember" },
							].map((m) => (
								<option key={m.val} value={m.val}>{m.label}</option>
							))}
						</Select>
					)}
					
					{filterType === "tanggal" && (
						<Input
							size="sm"
							borderRadius="lg"
							type="date"
							w="150px"
							value={filterDate}
							onChange={(e) => setFilterDate(e.target.value)}
							bg="white"
						/>
					)}
					
					<Button
						size="sm"
						bg="blue.500"
						color="white"
						borderRadius="lg"
						_hover={{ bg: "blue.600" }}
						onClick={handleTampilkan}
					>
						Tampilkan
					</Button>
				</HStack>
			</Flex>

			<Grid templateColumns={{ base: "1fr 1fr", xl: "repeat(5, 1fr)" }} gap={4} mb={6}>
				{dynamicStatCards.map((card) => (
					<Box
						key={card.label}
						bg="white"
						borderRadius="xl"
						p={5}
						boxShadow="sm"
						border="1px solid"
						borderColor="gray.100"
					>
						<Flex align="flex-start" justify="space-between">
							<Box>
								<Text fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
									{card.label}
								</Text>
								<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
									{card.value}
								</Text>
								<HStack spacing={1} mt={1}>
									<Icon
									as={card.change >= 0 ? MdTrendingUp : MdTrendingDown}
										boxSize={3}
										color={card.change >= 0 ? "green.500" : "red.500"}
									/>
									<Text
										fontSize="xs"
										fontWeight="600"
										color={card.change >= 0 ? "green.600" : "red.600"}
									>
										{card.change >= 0 ? "+" : ""}{card.change}%
									</Text>
									<Text fontSize="xs" color="gray.400">{changePeriodLabel}</Text>
								</HStack>
							</Box>
							<Box p={2.5} borderRadius="lg" bg={card.bg}>
								<Icon as={card.icon} boxSize={6} color={card.color} />
							</Box>
						</Flex>
					</Box>
				))}
			</Grid>

			<Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
				<Tabs variant="line" colorScheme="blue">
					<Flex
						align="center"
						justify="space-between"
						px={6}
						pt={5}
						pb={0}
						borderBottom="1px solid"
						borderColor="gray.100"
					>
						<TabList border="none" gap={4}>
							<Tab
								fontSize="sm"
								fontWeight="600"
								pb={4}
								px={0}
								color="gray.500"
								_selected={{ color: "blue.600", borderColor: "blue.600" }}
							>
								<HStack spacing={2}>
									<Icon as={MdPendingActions} boxSize={4} />
									<Text>Menunggu Verifikasi</Text>
									<Box
										bg="purple.100"
										color="purple.700"
										borderRadius="full"
										px={2}
										fontSize="xs"
										fontWeight="700"
									>
										{waitingVerificationOrders.length}
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
									<Icon as={FiClock} boxSize={4} />
									<Text>Menunggu Pembayaran</Text>
									<Box
										bg="orange.100"
										color="orange.700"
										borderRadius="full"
										px={2}
										fontSize="xs"
										fontWeight="700"
									>
										{waitingPaymentOrders.length}
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
								Semua Pesanan
							</Tab>
						</TabList>
						<InputGroup size="sm" w="220px" mb={2}>
							<InputLeftElement pointerEvents="none">
								<Icon as={MdSearch} color="gray.400" />
							</InputLeftElement>
							<Input
								placeholder="Cari reservasi..."
								borderRadius="lg"
								bg="gray.50"
								border="1px solid"
								borderColor="gray.200"
								_focus={{ borderColor: "blue.400", bg: "white" }}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</InputGroup>
					</Flex>

					<TabPanels>
						<TabPanel p={0}>
							<Box p={4}>
								{waitingVerificationOrders.length === 0 ? (
									<Flex align="center" justify="center" py={12} color="gray.400">
										<Text fontSize="sm">Tidak ada pesanan menunggu verifikasi</Text>
									</Flex>
								) : (
									<OrdersTable data={waitingVerificationOrders} searchQuery={searchQuery} />
								)}
							</Box>
						</TabPanel>
						<TabPanel p={0}>
							<Box p={4}>
								{waitingPaymentOrders.length === 0 ? (
									<Flex align="center" justify="center" py={12} color="gray.400">
										<Text fontSize="sm">Tidak ada pesanan menunggu pembayaran</Text>
									</Flex>
								) : (
									<OrdersTable data={waitingPaymentOrders} searchQuery={searchQuery} />
								)}
							</Box>
						</TabPanel>
						<TabPanel p={0}>
							<Box p={4}>
								<OrdersTable data={data.orders} searchQuery={searchQuery} />
								<Flex align="center" justify="space-between" mt={4}>
									<Text fontSize="xs" color="gray.500">
										Menampilkan {data.orders.length > 0 ? 1 : 0}–{data.orders.length} dari {data.stats.total} entri
									</Text>
									<HStack spacing={1}>
										{["1", "2", "3", "4", "5", "...", "231"].map((p) => (
											<Button
												key={p}
												size="xs"
												borderRadius="md"
												variant={p === "1" ? "solid" : "ghost"}
												bg={p === "1" ? "blue.500" : undefined}
												color={p === "1" ? "white" : "gray.600"}
												_hover={{ bg: p === "1" ? "blue.600" : "gray.100" }}
												minW="32px"
											>
												{p}
											</Button>
										))}
									</HStack>
								</Flex>
							</Box>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>
		</AdminLayout>
	)
}

export default AdminDashboard
