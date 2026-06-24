import {
	Box,
	Flex,
	Text,
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
	Grid,
	GridItem,
	Icon,
} from "@chakra-ui/react"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { useState, useMemo } from "react"
import AdminLayout from "./AdminLayout"
// @ts-ignore
import * as XLSX from "xlsx"

const DUMMY_DATA = [
	{
		id: 1,
		nama: "FTSPK PA",
		fasilitas: "Bulutangkis Line 3",
		tanggal: "Jumat, 19 Juni 2026",
		sesi: ["Sesi Rutin 4 : 17:00:00 - 20:00:00"],
		kategori: "EKSTERNAL",
		jumlah_sesi: 1
	},
	{
		id: 2,
		nama: "DOSKAR TENNIS ITS",
		fasilitas: "Lapangan Tennis Outdoor 1",
		tanggal: "Jumat, 19 Juni 2026",
		sesi: [
			"Pagi Sesi 1 : 06:00:00 - 09:00:00",
			"Pagi Sesi 2 : 09:00:00 - 12:00:00"
		],
		kategori: "EKSTERNAL",
		jumlah_sesi: 2
	},
	{
		id: 3,
		nama: "DOSKAR TENNIS ITS",
		fasilitas: "Lapangan Tennis Outdoor 2",
		tanggal: "Jumat, 19 Juni 2026",
		sesi: [
			"Pagi Sesi 1 : 06:00:00 - 09:00:00",
			"Pagi Sesi 2 : 09:00:00 - 12:00:00"
		],
		kategori: "EKSTERNAL",
		jumlah_sesi: 2
	},
	{
		id: 4,
		nama: "Espirito",
		fasilitas: "Lapangan Futsal Indoor",
		tanggal: "Jumat, 19 Juni 2026",
		sesi: [
			"Sesi 1 : 16:00:00 - 18:00:00",
			"Sesi 2 : 18:00:00 - 20:00:00"
		],
		kategori: "EKSTERNAL",
		jumlah_sesi: 2
	}
]

const LaporanPengguna = () => {
	const [startDate, setStartDate] = useState("2026-06-19")
	const [endDate, setEndDate] = useState("2026-12-31")
	const [fasilitas, setFasilitas] = useState("")
	const [search, setSearch] = useState("")
	const [data, setData] = useState(DUMMY_DATA)

	const handleTampilkan = () => {
		// Mock filter logic
		setData(DUMMY_DATA)
	}

	const handleExportExcel = () => {
		const ws = XLSX.utils.json_to_sheet(
			filteredAndSortedData.map((d: any, index: number) => ({
				No: index + 1,
				Nama: d.nama,
				Fasilitas: d.fasilitas,
				"Jadwal Penggunaan": d.tanggal + " | " + d.sesi.join(" | "),
				Kategori: d.kategori,
				"Jumlah Sesi Yg Disewa": d.jumlah_sesi,
			}))
		)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, "Laporan Pengguna")
		XLSX.writeFile(wb, `Laporan_Pengguna_${startDate}_to_${endDate}.xlsx`)
	}

	const handleExportCSV = () => {
		const ws = XLSX.utils.json_to_sheet(
			filteredAndSortedData.map((d: any, index: number) => ({
				No: index + 1,
				Nama: d.nama,
				Fasilitas: d.fasilitas,
				"Jadwal Penggunaan": d.tanggal + " | " + d.sesi.join(" | "),
				Kategori: d.kategori,
				"Jumlah Sesi Yg Disewa": d.jumlah_sesi,
			}))
		)
		const csv = XLSX.utils.sheet_to_csv(ws)
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.setAttribute("download", `Laporan_Pengguna_${startDate}_to_${endDate}.csv`)
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const [roleFilter, setRoleFilter] = useState("all")
	const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'asc'
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc'
		}
		setSortConfig({ key, direction })
	}

	const filteredAndSortedData = useMemo(() => {
		let result = data.filter((item) =>
			(item.nama.toLowerCase().includes(search.toLowerCase()) ||
			item.fasilitas.toLowerCase().includes(search.toLowerCase()) ||
			item.kategori.toLowerCase().includes(search.toLowerCase())) &&
			(roleFilter === "all" || item.kategori === roleFilter)
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
	}, [data, search, roleFilter, sortConfig])

	const SortIcon = ({ columnKey }: { columnKey: string }) => {
		if (sortConfig?.key === columnKey) {
			return sortConfig.direction === 'asc' ? <Icon as={FaSortUp} ml={1} /> : <Icon as={FaSortDown} ml={1} />
		}
		return <Icon as={FaSort} ml={1} color="gray.300" />
	}

	return (
		<AdminLayout>
			<Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden" mb={6}>
				<Flex px={6} py={4} borderBottom="1px solid" borderColor="gray.100" bg="white">
					<Text fontSize="xl" fontWeight="600" color="gray.600">
						Laporan Pengguna
					</Text>
				</Flex>
				
				<Box p={6}>
					<Grid templateColumns="repeat(4, 1fr)" gap={4} alignItems="center" mb={6}>
						<GridItem colSpan={1}>
							<Flex align="center">
								<Text fontSize="sm" color="gray.600" whiteSpace="nowrap" mr={4}>Pilih Tanggal :</Text>
								<Input type="date" size="sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} borderRadius="md" />
							</Flex>
						</GridItem>
						<GridItem colSpan={1}>
							<Flex align="center">
								<Text fontSize="sm" color="gray.600" whiteSpace="nowrap" mr={4}>Sampai</Text>
								<Input type="date" size="sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} borderRadius="md" />
							</Flex>
						</GridItem>
						<GridItem colSpan={1}>
							<Select size="sm" borderRadius="md" value={fasilitas} onChange={(e) => setFasilitas(e.target.value)}>
								<option value="">Pilih Fasilitas</option>
								<option value="Bulutangkis Line 3">Bulutangkis Line 3</option>
								<option value="Lapangan Tennis Outdoor 1">Lapangan Tennis Outdoor 1</option>
								<option value="Lapangan Futsal Indoor">Lapangan Futsal Indoor</option>
							</Select>
						</GridItem>
						<GridItem colSpan={1}>
							<Button size="sm" bg="#6f72c4" color="white" _hover={{ bg: "#5a5da1" }} borderRadius="md" px={6} onClick={handleTampilkan}>
								Tampilkan
							</Button>
						</GridItem>
					</Grid>

					<Flex justify="space-between" align="center" mb={4}>
						<HStack>
							<Button size="sm" bg="gray.100" color="gray.700" _hover={{ bg: "gray.200" }} borderRadius="md" onClick={handleExportCSV}>
								CSV
							</Button>
							<Button size="sm" bg="gray.100" color="gray.700" _hover={{ bg: "gray.200" }} borderRadius="md" onClick={handleExportExcel}>
								Excel
							</Button>
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
						<HStack>
							<Select size="sm" borderRadius="md" w="150px" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
								<option value="all">Semua Role</option>
								<option value="INTERNAL">INTERNAL</option>
								<option value="EKSTERNAL">EKSTERNAL</option>
							</Select>
						</HStack>
					</Flex>

					<TableContainer>
						<Table size="sm" variant="simple">
							<Thead>
								<Tr>
									<Th color="gray.700" fontWeight="700" rowSpan={2} borderBottom="none" pt={4} pb={2}>No</Th>
									<Th color="gray.700" fontWeight="700" rowSpan={2} borderBottom="none" pt={4} pb={2} cursor="pointer" onClick={() => handleSort('nama')}>
										<Flex align="center">Nama <SortIcon columnKey="nama" /></Flex>
									</Th>
									<Th color="gray.700" fontWeight="700" rowSpan={2} borderBottom="none" pt={4} pb={2} cursor="pointer" onClick={() => handleSort('fasilitas')}>
										<Flex align="center">Fasilitas <SortIcon columnKey="fasilitas" /></Flex>
									</Th>
									<Th color="gray.700" fontWeight="700" rowSpan={2} borderBottom="none" pt={4} pb={2} cursor="pointer" onClick={() => handleSort('tanggal')}>
										<Flex align="center">Jadwal Penggunaan <SortIcon columnKey="tanggal" /></Flex>
									</Th>
									<Th color="gray.700" fontWeight="700" colSpan={2} textAlign="center" borderBottom="1px solid" borderColor="gray.200" pb={2}>Kategori</Th>
									<Th color="gray.700" fontWeight="700" rowSpan={2} borderBottom="none" pt={4} pb={2} cursor="pointer" onClick={() => handleSort('jumlah_sesi')}>
										<Flex align="center">Jumlah Sesi Yg Disewa <SortIcon columnKey="jumlah_sesi" /></Flex>
									</Th>
								</Tr>
								<Tr>
									<Th color="gray.700" fontWeight="700" textAlign="center" pt={2} pb={2}>Internal</Th>
									<Th color="gray.700" fontWeight="700" textAlign="center" pt={2} pb={2}>Eksternal</Th>
								</Tr>
							</Thead>
							<Tbody>
								{filteredAndSortedData.map((row: any, i: number) => (
									<Tr key={row.id} _hover={{ bg: "gray.50" }}>
										<Td fontSize="sm" color="gray.600" verticalAlign="top" pt={4}>{i + 1}</Td>
										<Td fontSize="sm" color="gray.600" verticalAlign="top" pt={4}>{row.nama}</Td>
										<Td fontSize="sm" color="gray.600" verticalAlign="top" pt={4}>{row.fasilitas}</Td>
										<Td fontSize="sm" color="gray.600" verticalAlign="top" pt={4}>
											<Text mb={1}>{row.tanggal}</Text>
											{row.sesi.map((s: string, idx: number) => (
												<Text key={idx} color="gray.500">{s}</Text>
											))}
										</Td>
										<Td fontSize="sm" color="gray.600" textAlign="center" verticalAlign="top" pt={4}>
											{row.kategori === "INTERNAL" ? "INTERNAL" : ""}
										</Td>
										<Td fontSize="sm" color="gray.600" textAlign="center" verticalAlign="top" pt={4}>
											{row.kategori === "EKSTERNAL" ? "EKSTERNAL" : ""}
										</Td>
										<Td fontSize="sm" color="gray.600" verticalAlign="top" pt={4}>{row.jumlah_sesi}</Td>
									</Tr>
								))}
								{filteredAndSortedData.length === 0 && (
									<Tr>
										<Td colSpan={7} textAlign="center" py={6} color="gray.500">
											Tidak ada data laporan.
										</Td>
									</Tr>
								)}
							</Tbody>
						</Table>
					</TableContainer>
				</Box>
			</Box>
		</AdminLayout>
	)
}

export default LaporanPengguna
