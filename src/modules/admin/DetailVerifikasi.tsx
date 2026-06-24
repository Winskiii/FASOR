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
import { MdSearch, MdFilterList, MdCheckCircle } from "react-icons/md"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { adminService } from "../../services/adminService"
import AdminLayout from "./AdminLayout"

const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID")

const STATUS_MAP: Record<string, { color: string; bg: string; label: string }> = {
	Waiting:  { color: "orange.700", bg: "orange.50", label: "Menunggu" },
	Approved: { color: "green.700",  bg: "green.50",  label: "Disetujui" },
	Canceled: { color: "red.700",    bg: "red.50",    label: "Dibatalkan" },
	Booked:   { color: "blue.700",   bg: "blue.50",   label: "Dipesan" },
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

const DetailVerifikasi = () => {
	const router = useRouter()
	const [orders, setOrders] = useState<any[]>([])
	const [search, setSearch] = useState("")
	const [filterFasilitas, setFilterFasilitas] = useState("all")

	useEffect(() => {
		adminService.getDashboardData().then((res) => {
			if (res.status === 'success') {
				// Show all orders so admin can search, or only Waiting if desired.
				// Based on "Detail Verifikasi", admin needs to be able to find any transaction.
				setOrders(res.data.orders)
			}
		}).catch(console.error)
	}, [])

	// Filter data based on search and selected facility
	const filteredOrders = orders.filter((o) => {
		const matchSearch = 
			o.kode.toLowerCase().includes(search.toLowerCase()) || 
			o.atas_nama.toLowerCase().includes(search.toLowerCase());
		const matchFasilitas = filterFasilitas === "all" || o.fasilitas.includes(filterFasilitas);
		return matchSearch && matchFasilitas;
	})

	return (
		<AdminLayout>
			<Flex align="center" justify="space-between" mb={6}>
				<Box>
					<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
						Detail Verifikasi
					</Text>
					<Text fontSize="sm" color="gray.500" mt={0.5}>
						Cari dan verifikasi transaksi/bookingan yang masuk
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
					flexWrap="wrap"
					gap={4}
				>
					<HStack spacing={3}>
						<InputGroup size="sm" w="300px">
							<InputLeftElement pointerEvents="none">
								<Icon as={MdSearch} color="gray.400" />
							</InputLeftElement>
							<Input
								placeholder="Cari kode booking atau username..."
								borderRadius="lg"
								bg="gray.50"
								border="1px solid"
								borderColor="gray.200"
								_focus={{ borderColor: "blue.400", bg: "white" }}
								value={search}
								onChange={(e: any) => setSearch(e.target.value)}
							/>
						</InputGroup>
						<Select 
							size="sm" 
							borderRadius="lg" 
							w="200px" 
							bg="gray.50" 
							value={filterFasilitas}
							onChange={(e: any) => setFilterFasilitas(e.target.value)}
						>
							<option value="all">Semua Lapangan/Fasilitas</option>
							<option value="Bulutangkis">GOR Bulutangkis</option>
							<option value="Basket">Lapangan Basket</option>
							<option value="Futsal">Lapangan Futsal</option>
							<option value="Tenis">Lapangan Tenis</option>
							<option value="Mini Soccer">Mini Soccer</option>
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
									<Th color="gray.500" fontSize="xs">Kode Booking</Th>
									<Th color="gray.500" fontSize="xs">Tanggal Pesan</Th>
									<Th color="gray.500" fontSize="xs">Fasilitas</Th>
									<Th color="gray.500" fontSize="xs">Username Pemesan</Th>
									<Th color="gray.500" fontSize="xs">Total Harga</Th>
									<Th color="gray.500" fontSize="xs">Status</Th>
									<Th color="gray.500" fontSize="xs" textAlign="center">Aksi</Th>
								</Tr>
							</Thead>
							<Tbody>
								{filteredOrders.map((row: any, i: number) => (
									<Tr key={row.kode} _hover={{ bg: "gray.50" }} transition="background 0.1s">
										<Td color="gray.500" fontSize="sm">{i + 1}</Td>
										<Td>
											<Text
												fontSize="sm"
												fontWeight="700"
												color="gray.800"
											>
												{row.kode}
											</Text>
										</Td>
										<Td fontSize="sm" color="gray.700">{row.tanggal}</Td>
										<Td fontSize="sm" color="gray.700">{row.fasilitas}</Td>
										<Td fontSize="sm" color="gray.800" fontWeight="500">{row.atas_nama}</Td>
										<Td fontSize="sm" fontWeight="600" color="gray.800">{formatRupiah(row.harga)}</Td>
										<Td><StatusBadge status={row.status} /></Td>
										<Td textAlign="center">
											<Button 
												size="xs" 
												colorScheme="blue" 
												variant={row.status === "Waiting" ? "solid" : "outline"}
												onClick={() => router.push(`/admin/reservasi/${row.kode}`)}
											>
												{row.status === "Waiting" ? "Verifikasi" : "Lihat Detail"}
											</Button>
										</Td>
									</Tr>
								))}
								{filteredOrders.length === 0 && (
									<Tr>
										<Td colSpan={8} textAlign="center" py={6} color="gray.500">
											Data transaksi tidak ditemukan.
										</Td>
									</Tr>
								)}
							</Tbody>
						</Table>
					</TableContainer>

					<Flex align="center" justify="space-between" mt={4}>
						<Text fontSize="xs" color="gray.500">
							Menampilkan {filteredOrders.length > 0 ? 1 : 0}–{filteredOrders.length} entri
						</Text>
					</Flex>
				</Box>
			</Box>
		</AdminLayout>
	)
}

export default DetailVerifikasi
