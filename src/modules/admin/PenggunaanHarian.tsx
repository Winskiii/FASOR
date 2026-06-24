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
	Spinner,
	Center,
} from "@chakra-ui/react"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import AdminLayout from "./AdminLayout"
// @ts-ignore
import * as XLSX from "xlsx"

const PenggunaanHarianAdmin = () => {
	const [selectedDate, setSelectedDate] = useState(() => {
		const today = new Date()
		return today.toISOString().split("T")[0]
	})
	const [usageData, setUsageData] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [search, setSearch] = useState("")

	const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local"

	useEffect(() => {
		fetchDailyUsage()
	}, [])

	const fetchDailyUsage = async () => {
		setIsLoading(true)
		try {
			const res = await axios.get(`${baseUrl}/admin/fasilitas/daily-usage?date=${selectedDate}`, {
				withCredentials: true,
			})
			if (res.data?.data) {
				setUsageData(res.data.data)
			}
		} catch (error) {
			console.error("Failed to fetch daily usage:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleExportExcel = () => {
		const ws = XLSX.utils.json_to_sheet(
			filteredAndSortedData.map((d: any, index: number) => ({
				No: index + 1,
				Fasilitas: d.fasilitas,
				Jam: d.jam,
				"Atas Nama": d.atas_nama,
			}))
		)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, "Penggunaan Harian")
		XLSX.writeFile(wb, `Penggunaan_Harian_${selectedDate}.xlsx`)
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
		let result = usageData.filter(
			(item) =>
				item.fasilitas?.toLowerCase().includes(search.toLowerCase()) ||
				item.atas_nama?.toLowerCase().includes(search.toLowerCase())
		)

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
	}, [usageData, search, sortConfig])

	const SortIcon = ({ columnKey }: { columnKey: string }) => {
		if (sortConfig?.key === columnKey) {
			return sortConfig.direction === 'asc' ? <Icon as={FaSortUp} ml={1} /> : <Icon as={FaSortDown} ml={1} />
		}
		return <Icon as={FaSort} ml={1} color="gray.300" />
	}

	const displayDateStr = new Date(selectedDate).toLocaleDateString("id-ID", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	}).toUpperCase()

	return (
		<AdminLayout>
			<Flex align="center" justify="space-between" mb={6}>
				<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px" textTransform="uppercase">
					Jadwal Penggunaan Fasor
				</Text>
				<HStack spacing={0}>
					<Input
						type="date"
						value={selectedDate}
						onChange={(e) => setSelectedDate(e.target.value)}
						bg="gray.50"
						borderRightRadius="none"
					/>
					<Button
						bg="#7879e6" // Purple matching the mockup
						color="white"
						_hover={{ bg: "#6b6cce" }}
						borderLeftRadius="none"
						px={6}
						onClick={fetchDailyUsage}
					>
						Tampilkan
					</Button>
				</HStack>
			</Flex>

			<Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden" p={6}>
				<Text fontSize="md" fontWeight="700" color="gray.800" mb={4}>
					{displayDateStr}
				</Text>

				<Flex justify="space-between" align="center" mb={4}>
					<Button
						size="sm"
						bg="#4aa9e6" // Blue for Excel button
						color="white"
						_hover={{ bg: "#4298ce" }}
						onClick={handleExportExcel}
					>
						Excel
					</Button>
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
								<Th color="gray.700" fontWeight="700" py={3}>No</Th>
								<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('fasilitas')}>
									<Flex align="center">Fasilitas <SortIcon columnKey="fasilitas" /></Flex>
								</Th>
								<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('jam')}>
									<Flex align="center">Jam <SortIcon columnKey="jam" /></Flex>
								</Th>
								<Th color="gray.700" fontWeight="700" cursor="pointer" onClick={() => handleSort('atas_nama')}>
									<Flex align="center">Atas Nama <SortIcon columnKey="atas_nama" /></Flex>
								</Th>
							</Tr>
						</Thead>
						<Tbody>
							{isLoading ? (
								<Tr>
									<Td colSpan={4}>
										<Center py={6}><Spinner color="blue.500" /></Center>
									</Td>
								</Tr>
							) : filteredAndSortedData.length === 0 ? (
								<Tr>
									<Td colSpan={4} textAlign="center" py={6} color="gray.500">
										Tidak ada penggunaan untuk tanggal ini.
									</Td>
								</Tr>
							) : (
								filteredAndSortedData.map((row: any, i: number) => (
									<Tr key={i} _hover={{ bg: "gray.50" }}>
										<Td fontSize="sm" color="gray.600">{i + 1}</Td>
										<Td fontSize="sm" color="gray.700">{row.fasilitas}</Td>
										<Td fontSize="sm" color="gray.600">{row.jam}</Td>
										<Td fontSize="sm" color="gray.600">{row.atas_nama}</Td>
									</Tr>
								))
							)}
						</Tbody>
					</Table>
				</TableContainer>
			</Box>
		</AdminLayout>
	)
}

export default PenggunaanHarianAdmin
