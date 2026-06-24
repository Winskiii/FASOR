import {
	Box,
	Flex,
	Text,
	Icon,
	Button,
	HStack,
	VStack,
	Grid,
	GridItem,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Divider,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	FormControl,
	FormLabel,
	Input,
	Select,
	Textarea,
	useDisclosure,
	Badge,
} from "@chakra-ui/react"
import {
	MdArrowBack,
	MdEdit,
	MdCheckCircle,
	MdCancel,
	MdWarning,
	MdPayment,
	MdCalendarToday,
	MdPerson,
	MdPhone,
	MdSportsHandball,
} from "react-icons/md"
import { FiFileText, FiUser, FiBriefcase } from "react-icons/fi"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { adminService } from "../../services/adminService"
import AdminLayout from "./AdminLayout"
import { KwitansiPrint, type KwitansiData } from "@/components/organisms/KwitansiPDF"
import RescheduleRefundModal from "../detail-pemesanan/RescheduleRefundModal"

interface JadwalRow {
	no: number
	sesi: string
	tanggal: string
	hari: string
	mulai: string
	selesai: string
	subtotal: number
}

interface PembayaranRow {
	keterangan: string
	kode_va: string
	no_transaksi: string
	batas: string
	subtotal: number
	status: string
}

interface OrderDetail {
	kode: string
	nama_tim: string
	nik: string
	no_hp: string
	jenis_pengguna: string
	jenis_lapangan: string
	kegiatan: string
	status: string
	jadwal: JadwalRow[]
	pembayaran: PembayaranRow[]
}


const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID")

const STATUS_MAP: Record<string, { color: string; bg: string; label: string }> = {
	WaitingVerification: { color: "purple.700", bg: "purple.50", label: "Menunggu Verifikasi" },
	WaitingPayment:      { color: "orange.700", bg: "orange.50",  label: "Menunggu Pembayaran" },
	Approved:            { color: "green.700",  bg: "green.50",   label: "Disetujui" },
	Canceled:            { color: "red.700",    bg: "red.50",     label: "Dibatalkan" },
	Booked:              { color: "blue.700",   bg: "blue.50",    label: "Dipesan" },
}

const InfoRow = ({
	label,
	children,
}: {
	label: string
	children: React.ReactNode
}) => (
	<Grid templateColumns="220px 1fr" gap={4} py={3} borderBottom="1px solid" borderColor="gray.100" _last={{ borderBottom: "none" }}>
		<GridItem>
			<Text fontSize="sm" color="gray.500" fontWeight="500">{label}</Text>
		</GridItem>
		<GridItem>
			{children}
		</GridItem>
	</Grid>
)

const SectionCard = ({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) => (
	<Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden" mb={4}>
		<Box px={6} py={4} borderBottom="1px solid" borderColor="gray.100">
			<Text fontSize="sm" fontWeight="700" color="gray.700" letterSpacing="0.05em" textTransform="uppercase">
				{title}
			</Text>
		</Box>
		<Box px={6} py={4}>
			{children}
		</Box>
	</Box>
)

const VerifikasiModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
}) => (
	<Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
		<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
		<ModalContent borderRadius="xl">
			<ModalHeader fontSize="md" fontWeight="700" borderBottom="1px solid" borderColor="gray.100">
				{title}
			</ModalHeader>
			<ModalCloseButton />
			<ModalBody py={5}>
				<Text fontSize="sm" color="gray.600">{description}</Text>
			</ModalBody>
			<ModalFooter gap={2} borderTop="1px solid" borderColor="gray.100">
				<Button size="sm" variant="ghost" onClick={onClose}>Batal</Button>
				<Button size="sm" bg="blue.500" color="white" borderRadius="lg" _hover={{ bg: "blue.600" }} onClick={onConfirm}>OK</Button>
			</ModalFooter>
		</ModalContent>
	</Modal>
)

const BatalkanModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => (
	<Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
		<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
		<ModalContent borderRadius="xl">
			<ModalHeader fontSize="md" fontWeight="700" borderBottom="1px solid" borderColor="gray.100">
				Pembatalan
			</ModalHeader>
			<ModalCloseButton />
			<ModalBody py={5}>
				<FormControl>
					<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Keterangan Alasan</FormLabel>
					<Textarea size="sm" borderRadius="lg" bg="gray.50" rows={3} placeholder="Masukkan alasan pembatalan..." />
				</FormControl>
			</ModalBody>
			<ModalFooter gap={2} borderTop="1px solid" borderColor="gray.100">
				<Button size="sm" variant="ghost" onClick={onClose}>Batal</Button>
				<Button size="sm" colorScheme="orange" borderRadius="lg" onClick={onConfirm}>OK</Button>
			</ModalFooter>
		</ModalContent>
	</Modal>
)

const PelanggaranModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => (
	<Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
		<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
		<ModalContent borderRadius="xl">
			<ModalHeader fontSize="md" fontWeight="700" borderBottom="1px solid" borderColor="gray.100">
				Pelanggaran
			</ModalHeader>
			<ModalCloseButton />
			<ModalBody py={5}>
				<FormControl>
					<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Keterangan Pelanggaran</FormLabel>
					<Textarea size="sm" borderRadius="lg" bg="gray.50" rows={3} placeholder="Masukkan keterangan pelanggaran..." />
				</FormControl>
			</ModalBody>
			<ModalFooter gap={2} borderTop="1px solid" borderColor="gray.100">
				<Button size="sm" variant="ghost" onClick={onClose}>Batal</Button>
				<Button size="sm" colorScheme="red" borderRadius="lg" onClick={onConfirm}>OK</Button>
			</ModalFooter>
		</ModalContent>
	</Modal>
)

const EditPemesanModal = ({ isOpen, onClose, order, onSave }: { isOpen: boolean; onClose: () => void; order: OrderDetail; onSave: (data: any) => void }) => {
	const [formData, setFormData] = useState({
		nama_tim: order.nama_tim,
		nik: order.nik,
		no_hp: order.no_hp,
		jenis_pengguna: order.jenis_pengguna,
		kegiatan: order.kegiatan,
	})

	return (
		<Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
			<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
			<ModalContent borderRadius="xl">
				<ModalHeader fontSize="md" fontWeight="700" borderBottom="1px solid" borderColor="gray.100">
					Edit Data Pemesan
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody py={5}>
					<VStack spacing={4}>
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Nama Tim / Departemen / Fakultas</FormLabel>
							<Input size="sm" borderRadius="lg" value={formData.nama_tim} onChange={e => setFormData({...formData, nama_tim: e.target.value})} />
						</FormControl>
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">No. KTP / NIP / NRP</FormLabel>
							<Input size="sm" borderRadius="lg" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} />
						</FormControl>
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Nomor HP</FormLabel>
							<Input size="sm" borderRadius="lg" value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} />
						</FormControl>
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Jenis Pengguna</FormLabel>
							<Select size="sm" borderRadius="lg" value={formData.jenis_pengguna} onChange={e => setFormData({...formData, jenis_pengguna: e.target.value})}>
								<option value="internal">Internal</option>
								<option value="eksternal">Eksternal</option>
							</Select>
						</FormControl>
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Kegiatan</FormLabel>
							<Input size="sm" borderRadius="lg" value={formData.kegiatan} onChange={e => setFormData({...formData, kegiatan: e.target.value})} />
						</FormControl>
					</VStack>
				</ModalBody>
				<ModalFooter gap={2} borderTop="1px solid" borderColor="gray.100">
					<Button size="sm" variant="ghost" onClick={onClose}>Batal</Button>
					<Button size="sm" colorScheme="blue" borderRadius="lg" onClick={() => onSave(formData)}>Simpan</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}

const DetailOrderPage = ({ kode }: { kode: string }) => {
	const router = useRouter()
	const [order, setOrder] = useState<OrderDetail | null>(null)

	const verifikasiModal = useDisclosure()
	const batalkanModal = useDisclosure()
	const pelanggaranModal = useDisclosure()
	const editPemesanModal = useDisclosure()
	const kwitansiModal = useDisclosure()
	
	const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
	const [selectedRescheduleJadwal, setSelectedRescheduleJadwal] = useState<JadwalRow | null>(null)

	const fetchOrder = () => {
		if(!kode) return;
		adminService.getReservasiDetail(kode).then(res => {
			if(res.status === 'success') setOrder(res.data);
		}).catch(console.error)
	}

	useEffect(() => {
		fetchOrder()
	}, [kode])

	const handleVerifikasiConfirm = async () => {
		try {
			if (order?.status === "WaitingVerification") {
				await adminService.confirmReservasi(kode)
			} else if (order?.status === "WaitingPayment") {
				await adminService.approveReservasi(kode)
			}
			fetchOrder()
			verifikasiModal.onClose()
		} catch(e) { console.error(e) }
	}

	const handleReject = async () => {
		try {
			await adminService.cancelReservasi(kode)
			fetchOrder()
			batalkanModal.onClose()
		} catch(e) { console.error(e) }
	}

	const handleRescheduleAdmin = async (data: any) => {
		try {
			const payload = {
				newDate: data.newDate.toISOString().split("T")[0],
				newSlot: data.newSlot,
				alasan: data.alasan || "Reschedule by Admin",
			};
			await adminService.rescheduleReservasi(kode, payload);
			fetchOrder();
		} catch (e) {
			console.error(e);
		}
		setRescheduleModalOpen(false);
		setSelectedRescheduleJadwal(null);
	}

	const handlePelanggaranConfirm = () => {
		if (order?.no_hp) {
			const existingStr = localStorage.getItem("fasor_blacklisted_numbers")
			const blacklisted = existingStr ? JSON.parse(existingStr) : []
			if (!blacklisted.includes(order.no_hp)) {
				blacklisted.push(order.no_hp)
				localStorage.setItem("fasor_blacklisted_numbers", JSON.stringify(blacklisted))
			}
		}
		pelanggaranModal.onClose()
	}

	const handleEditPemesanSave = (formData: any) => {
		if (order) {
			setOrder({
				...order,
				...formData
			})
			// In a real app we would call adminService.updateOrder(kode, formData) here
		}
		editPemesanModal.onClose()
	}

	if (!order) {
		return <AdminLayout><Flex justify="center" p={10}>Loading...</Flex></AdminLayout>
	}

	const statusStyle = STATUS_MAP[order.status] ?? { color: "gray.700", bg: "gray.100", label: order.status }
	const totalJadwal = order.jadwal.reduce((sum, j) => sum + j.subtotal, 0)
	const totalPembayaran = order.pembayaran.reduce((sum, p) => sum + p.subtotal, 0)

	return (
		<AdminLayout>
			<Flex align="center" gap={3} mb={6}>
				<Button
					variant="ghost"
					size="sm"
					leftIcon={<Icon as={MdArrowBack} />}
					onClick={() => router.back()}
					color="gray.600"
					borderRadius="lg"
					_hover={{ bg: "gray.100" }}
				>
					Kembali
				</Button>
				<Box h="20px" w="1px" bg="gray.200" />
				<Box>
					<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
						Detail Pemesanan
					</Text>
				</Box>
				<Box
					ml="auto"
					px={3}
					py={1}
					borderRadius="full"
					bg={statusStyle.bg}
					color={statusStyle.color}
					fontSize="sm"
					fontWeight="700"
				>
					{statusStyle.label}
				</Box>
			</Flex>

			<Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" p={6} mb={4}>
				<Text fontSize="sm" color="gray.500" fontWeight="500" mb={1}>Kode Booking</Text>
				<Text fontSize="3xl" fontWeight="900" color="gray.800" letterSpacing="-1px">
					{order.kode}
				</Text>
			</Box>

			<SectionCard title="Data Pemesanan">
				<InfoRow label="Nama Tim / Departemen / Fakultas">
					<Text fontSize="sm" color="gray.800" fontWeight="500">{order.nama_tim}</Text>
				</InfoRow>
				<InfoRow label="No. KTP / NIP / NRP">
					<HStack spacing={3} flexWrap="wrap">
						<Text fontSize="sm" color="gray.800" fontWeight="500">{order.nik}</Text>
						<Button
							size="xs"
							leftIcon={<Icon as={FiFileText} />}
							colorScheme="blue"
							borderRadius="md"
							variant="solid"
						>
							Lihat Kartu Identitas
						</Button>
						<Button
							size="xs"
							leftIcon={<Icon as={FiUser} />}
							colorScheme="teal"
							borderRadius="md"
						>
							Cek Data Mahasiswa
						</Button>
						<Button
							size="xs"
							leftIcon={<Icon as={FiBriefcase} />}
							colorScheme="green"
							borderRadius="md"
						>
							Cek Data Pegawai
						</Button>
					</HStack>
				</InfoRow>
				<InfoRow label="Nomor HP">
					<Text fontSize="sm" color="gray.800" fontWeight="500">{order.no_hp}</Text>
				</InfoRow>
				<InfoRow label="Jenis Pengguna">
					<Text fontSize="sm" color="gray.800" fontWeight="500">{order.jenis_pengguna}</Text>
				</InfoRow>
				<InfoRow label="Jenis Lapangan">
					<Text fontSize="sm" color="gray.800" fontWeight="500">{order.jenis_lapangan}</Text>
				</InfoRow>
				<InfoRow label="Kegiatan">
					<Text fontSize="sm" color="gray.800" fontWeight="500">{order.kegiatan}</Text>
				</InfoRow>

				<HStack spacing={3} mt={5} flexWrap="wrap">
					{order.status === "WaitingVerification" && (
						<Button
							size="sm"
							leftIcon={<Icon as={MdCheckCircle} />}
							colorScheme="blue"
							borderRadius="lg"
							onClick={verifikasiModal.onOpen}
						>
							Verifikasi Pemesanan
						</Button>
					)}
					{order.status === "WaitingPayment" && (
						<Button
							size="sm"
							leftIcon={<Icon as={MdCheckCircle} />}
							colorScheme="green"
							borderRadius="lg"
							onClick={verifikasiModal.onOpen}
						>
							Setujui Pembayaran
						</Button>
					)}
					<Button
						size="sm"
						leftIcon={<Icon as={MdEdit} />}
						variant="outline"
						borderRadius="lg"
						borderColor="gray.300"
						color="gray.700"
						_hover={{ bg: "gray.50" }}
						onClick={editPemesanModal.onOpen}
					>
						Edit Pemesan
					</Button>

					<Button
						size="sm"
						leftIcon={<Icon as={MdCancel} />}
						colorScheme="orange"
						borderRadius="lg"
						onClick={batalkanModal.onOpen}
					>
						Batalkan Pemesanan
					</Button>
					<Button
						size="sm"
						leftIcon={<Icon as={MdWarning} />}
						colorScheme="red"
						borderRadius="lg"
						onClick={pelanggaranModal.onOpen}
					>
						Pelanggaran
					</Button>
					{order.status === "Approved" && (
						<Button
							size="sm"
							leftIcon={<Icon as={FiFileText} />}
							colorScheme="blue"
							borderRadius="lg"
							onClick={kwitansiModal.onOpen}
						>
							Lihat Kwitansi
						</Button>
					)}
				</HStack>
			</SectionCard>

			<SectionCard title="Jadwal Penggunaan Fasilitas Olahraga">
				<TableContainer>
					<Table size="sm" variant="simple">
						<Thead>
							<Tr>
								<Th color="gray.500" fontSize="xs" py={3}>No</Th>
								<Th color="gray.500" fontSize="xs">Sesi</Th>
								<Th color="gray.500" fontSize="xs">Tanggal</Th>
								<Th color="gray.500" fontSize="xs">Hari</Th>
								<Th color="gray.500" fontSize="xs">Mulai</Th>
								<Th color="gray.500" fontSize="xs">Selesai</Th>
								<Th color="gray.500" fontSize="xs" isNumeric>Subtotal</Th>
								<Th color="gray.500" fontSize="xs">Reschedule</Th>
							</Tr>
						</Thead>
						<Tbody>
							{order.jadwal.map((j) => (
								<Tr key={j.no} _hover={{ bg: "gray.50" }}>
									<Td fontSize="sm" color="gray.500">{j.no}</Td>
									<Td fontSize="sm" color="gray.800" fontWeight="500">{j.sesi}</Td>
									<Td fontSize="sm" color="blue.600" fontWeight="500">{j.tanggal}</Td>
									<Td fontSize="sm" color="gray.700">{j.hari}</Td>
									<Td fontSize="sm" color="gray.700">{j.mulai}</Td>
									<Td fontSize="sm" color="blue.600">{j.selesai}</Td>
									<Td fontSize="sm" fontWeight="700" color="gray.800" isNumeric>
										{formatRupiah(j.subtotal)}
									</Td>
									<Td>
										<Button size="xs" variant="outline" borderRadius="md" colorScheme="purple" onClick={() => {
											setSelectedRescheduleJadwal(j)
											setRescheduleModalOpen(true)
										}}>
											Reschedule
										</Button>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</TableContainer>
				<Flex justify="flex-end" mt={3} pr={2}>
					<HStack spacing={4}>
						<Text fontSize="sm" color="gray.500" fontWeight="600">Total</Text>
						<Text fontSize="sm" fontWeight="800" color="gray.800">{formatRupiah(totalJadwal)}</Text>
					</HStack>
				</Flex>
			</SectionCard>

			<SectionCard title="Pembayaran">
				<TableContainer>
					<Table size="sm" variant="simple">
						<Thead>
							<Tr>
								<Th color="gray.500" fontSize="xs" py={3}>Pembayaran</Th>
								<Th color="gray.500" fontSize="xs">Kode Virtual Account</Th>
								<Th color="gray.500" fontSize="xs">Nomor Transaksi</Th>
								<Th color="gray.500" fontSize="xs">Batas Pembayaran</Th>
								<Th color="gray.500" fontSize="xs" isNumeric>Subtotal</Th>
								<Th color="gray.500" fontSize="xs">Status</Th>
							</Tr>
						</Thead>
						<Tbody>
							{order.pembayaran.map((p, i) => (
								<Tr key={i} _hover={{ bg: "gray.50" }}>
									<Td fontSize="sm" color="gray.800" fontWeight="500" maxW="200px">{p.keterangan}</Td>
									<Td fontSize="sm" color={p.kode_va === "Menunggu Verifikasi" ? "orange.500" : "gray.700"}>
										{p.kode_va}
									</Td>
									<Td fontSize="sm" color={p.no_transaksi === "Menunggu Verifikasi" ? "orange.500" : "gray.700"}>
										{p.no_transaksi}
									</Td>
									<Td fontSize="sm" color={p.batas === "Menunggu Verifikasi" ? "orange.500" : "gray.700"}>
										{p.batas}
									</Td>
									<Td fontSize="sm" fontWeight="700" color="gray.800" isNumeric>
										{formatRupiah(p.subtotal)}
									</Td>
									<Td>
										<VStack spacing={1.5} align="flex-start">
											<Box
												px={2.5}
												py={0.5}
												borderRadius="full"
												bg="red.50"
												color="red.700"
												fontSize="xs"
												fontWeight="700"
											>
												{p.status}
											</Box>
											<Button size="xs" colorScheme="red" borderRadius="md">
												Cek Pembayaran
											</Button>
										</VStack>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</TableContainer>
				<Flex justify="flex-end" mt={3} pr={2}>
					<HStack spacing={4}>
						<Text fontSize="sm" color="gray.500" fontWeight="600">Total</Text>
						<Text fontSize="sm" fontWeight="800" color="gray.800">{formatRupiah(totalPembayaran)}</Text>
					</HStack>
				</Flex>
			</SectionCard>

			<VerifikasiModal
				isOpen={verifikasiModal.isOpen}
				onClose={verifikasiModal.onClose}
				onConfirm={handleVerifikasiConfirm}
				title={order.status === "WaitingVerification" ? "Verifikasi Pemesanan" : "Setujui Pembayaran"}
				description={order.status === "WaitingVerification" ? "Yakin ingin memverifikasi pemesanan ini dan menghasilkan kode VA untuk pembayaran?" : "Yakin ingin menyetujui pembayaran untuk pemesanan ini?"}
			/>
			<BatalkanModal isOpen={batalkanModal.isOpen} onClose={batalkanModal.onClose} onConfirm={handleReject} />
			<PelanggaranModal isOpen={pelanggaranModal.isOpen} onClose={pelanggaranModal.onClose} onConfirm={handlePelanggaranConfirm} />
			<EditPemesanModal isOpen={editPemesanModal.isOpen} onClose={editPemesanModal.onClose} order={order} onSave={handleEditPemesanSave} />
			
			{selectedRescheduleJadwal && order && (
				<RescheduleRefundModal
					isOpen={rescheduleModalOpen}
					onClose={() => {
						setRescheduleModalOpen(false)
						setSelectedRescheduleJadwal(null)
					}}
					onRescheduleSubmit={handleRescheduleAdmin}
					idFasilitas={order.kegiatan}
					facility={order.jenis_lapangan}
					image={""}
					lapangan={order.jenis_lapangan}
					tanggal={selectedRescheduleJadwal.tanggal}
					waktu={`${selectedRescheduleJadwal.mulai} - ${selectedRescheduleJadwal.selesai}`}
					noTransaksi={order.kode}
					nama={order.nama_tim}
					noTelp={order.no_hp}
					total={selectedRescheduleJadwal.subtotal}
					tipeUser={order.jenis_pengguna}
				/>
			)}
			
			<Modal isOpen={kwitansiModal.isOpen} onClose={kwitansiModal.onClose} size="lg" isCentered scrollBehavior="inside">
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
				<ModalContent borderRadius="xl" mx={4}>
					<ModalCloseButton />
					<ModalBody p={6}>
						<KwitansiPrint
							data={{
								bookingCode: order.kode,
								transactionNo: order.pembayaran[0]?.no_transaksi || "-",
								facilityName: order.kegiatan,
								lapangan: order.jenis_lapangan,
								tanggal: order.jadwal[0]?.tanggal || "-",
								waktu: `${order.jadwal[0]?.mulai || "-"} - ${order.jadwal[0]?.selesai || "-"}`,
								nama: order.nama_tim,
								noTelp: order.no_hp,
								jenisSewa: order.jenis_pengguna,
								total: totalPembayaran,
								status: "Lunas",
							}}
							onClose={kwitansiModal.onClose}
						/>
					</ModalBody>
				</ModalContent>
			</Modal>
		</AdminLayout>
	)
}

export default DetailOrderPage
