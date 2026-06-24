import { Box, Flex, Text, Divider, Grid, GridItem, Button, Icon } from "@chakra-ui/react"
import { MdPrint, MdClose } from "react-icons/md"
import { useRef } from "react"

export interface KwitansiData {
	bookingCode: string
	transactionNo: string
	facilityName: string
	lapangan: string
	tanggal: string
	waktu: string
	nama: string
	noTelp: string
	jenisSewa: string
	total: number
	status: string
	printedAt?: string
	kegiatan?: string
	keterangan?: string
	sesi?: string
}

const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID")

const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<Grid templateColumns="180px 20px 1fr" gap={1} py={1.5}>
		<GridItem>
			<Text fontSize="sm" color="gray.600" fontWeight="500">{label}</Text>
		</GridItem>
		<GridItem>
			<Text fontSize="sm" color="gray.600">:</Text>
		</GridItem>
		<GridItem>
			<Text fontSize="sm" color="gray.800" fontWeight="600">{value}</Text>
		</GridItem>
	</Grid>
)

export const KwitansiPrint = ({ data, onClose }: { data: KwitansiData; onClose?: () => void }) => {
	const printRef = useRef<HTMLDivElement>(null)

	const terbilang = (nilai: number): string => {
		if (nilai === 0) return "Nol"
		const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"]
		let temp = ""
		if (nilai < 12) temp = " " + bilangan[Math.floor(nilai)]
		else if (nilai < 20) temp = terbilang(nilai - 10) + " Belas"
		else if (nilai < 100) temp = terbilang(Math.floor(nilai / 10)) + " Puluh" + (nilai % 10 > 0 ? terbilang(nilai % 10) : "")
		else if (nilai < 200) temp = " Seratus" + (nilai - 100 > 0 ? terbilang(nilai - 100) : "")
		else if (nilai < 1000) temp = terbilang(Math.floor(nilai / 100)) + " Ratus" + (nilai % 100 > 0 ? terbilang(nilai % 100) : "")
		else if (nilai < 2000) temp = " Seribu" + (nilai - 1000 > 0 ? terbilang(nilai - 1000) : "")
		else if (nilai < 1000000) temp = terbilang(Math.floor(nilai / 1000)) + " Ribu" + (nilai % 1000 > 0 ? terbilang(nilai % 1000) : "")
		else if (nilai < 1000000000) temp = terbilang(Math.floor(nilai / 1000000)) + " Juta" + (nilai % 1000000 > 0 ? terbilang(nilai % 1000000) : "")
		else if (nilai < 1000000000000) temp = terbilang(Math.floor(nilai / 1000000000)) + " Miliar" + (nilai % 1000000000 > 0 ? terbilang(nilai % 1000000000) : "")
		return temp.trim()
	}

	const formatDatePdf = (dateStr: string) => {
		if (!dateStr) return ""
		try {
			const dt = new Date(dateStr)
			if (isNaN(dt.getTime())) return dateStr
			const MONTH_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
			return `${dt.getDate()} ${MONTH_ID[dt.getMonth()]} ${dt.getFullYear()}`
		} catch {
			return dateStr
		}
	}

	const bottomReceiverName = data.nama || "............................."
	const isRutin = data.jenisSewa?.toLowerCase().includes("rutin")

	const handlePrint = () => {
		const printWindow = window.open("", "_blank", "width=800,height=600")
		if (!printWindow) return

		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Kwitansi - ${data.bookingCode}</title>
				<style>
					* { margin: 0; padding: 0; box-sizing: border-box; }
					body { padding: 40px; }
					@media print { body { padding: 0; } }
				</style>
			</head>
			<body>
				${printRef.current?.innerHTML}
			</body>
			</html>
		`)

		printWindow.document.close()
		setTimeout(() => {
			printWindow.print()
		}, 300)
	}

	const saveReceipt = () => {
		const receiptRecord = {
			...data,
			printedAt: new Date().toISOString(),
		}

		const existing = JSON.parse(localStorage.getItem("fasor_receipts") || "[]")
		existing.push(receiptRecord)
		localStorage.setItem("fasor_receipts", JSON.stringify(existing))
	}

	const handlePrintAndSave = () => {
		saveReceipt()
		handlePrint()
	}

	return (
		<Box>
			<Flex justify="space-between" align="center" mb={4}>
				<Text fontSize="lg" fontWeight="700" color="gray.800">
					Kwitansi Pembayaran
				</Text>
			</Flex>

			<Box
				bg="white"
				border="1px solid"
				borderColor="gray.200"
				borderRadius="xl"
				p={6}
				overflowX="auto"
			>
				<Box ref={printRef} minW="700px">
					{/* Header */}
					<div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid black", paddingBottom: "12px", marginBottom: "20px" }}>
						<img src="/images/its kwitansi.png" alt="Logo ITS" style={{ width: "75px", height: "75px", marginRight: "20px" }} />
						<div style={{ flex: 1 }}>
							<h2 style={{ margin: 0, fontSize: "16pt", fontWeight: "bold", fontFamily: "Arial, sans-serif", color: "black" }}>Formulir Penggunaan Fasilitas Olahraga ITS</h2>
							<p style={{ margin: "3px 0 0 0", fontSize: "9pt", fontFamily: "Arial, sans-serif", color: "black" }}>Kampus ITS Sukolilo, Jl. Teknik Mesin (samping Lapangan Basket A) Surabaya</p>
							<p style={{ margin: "2px 0 0 0", fontSize: "9pt", fontFamily: "Arial, sans-serif", color: "black" }}>Telepon: 031-5923476, 031-5994251-54 (ext. 1175), No. Fax: 031-5912797, email: fasor@its.ac.id</p>
						</div>
					</div>

					{/* Two-Column Detail Table */}
					<table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial, sans-serif", fontSize: "10pt", lineHeight: "1.8", color: "black" }}>
						<tbody>
							<tr>
								<td style={{ width: "15%", verticalAlign: "top", padding: "6px 0" }}>Kode Booking</td>
								<td style={{ width: "2%", verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ width: "33%", verticalAlign: "top", padding: "6px 0", fontSize: "15pt", fontWeight: "bold", lineHeight: 1 }}>{data.bookingCode}</td>
								
								<td style={{ width: "15%", verticalAlign: "top", padding: "6px 0" }}>Lapangan</td>
								<td style={{ width: "2%", verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ width: "33%", verticalAlign: "top", padding: "6px 0" }}>{data.lapangan || data.facilityName}</td>
							</tr>

							<tr>
								<td style={{ padding: "6px 0" }}></td>
								<td style={{ padding: "6px 0" }}></td>
								<td style={{ padding: "6px 0" }}></td>
								
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>Kepentingan</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>
									{data.kegiatan || (isRutin ? "Latihan Rutin" : "Latihan Insidentil")}
								</td>
							</tr>

							<tr>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>Nama</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>{data.nama}</td>
								
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>Tanggal</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>{formatDatePdf(data.tanggal)}</td>
							</tr>

							<tr>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>NRP/NIP</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>-</td>
								
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>Keterangan</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>{data.keterangan || data.jenisSewa || "-"}</td>
							</tr>

							<tr>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>Telp./HP</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>{data.noTelp}</td>
								
								<td style={{ padding: "6px 0" }}></td>
								<td style={{ padding: "6px 0" }}></td>
								<td style={{ padding: "6px 0" }}></td>
							</tr>

							<tr>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>Jumlah</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>Rp. {Number(data.total || 0).toLocaleString("id-ID")}</td>
								
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>Terbilang</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>{terbilang(Number(data.total || 0))}</td>
							</tr>

							<tr>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>Jadwal</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>:</td>
								<td style={{ verticalAlign: "top", padding: "6px 0" }}>
									{data.sesi ? data.sesi + " " + data.waktu : data.waktu}
								</td>
								
								<td style={{ padding: "6px 0" }}></td>
								<td style={{ padding: "6px 0" }}></td>
								<td style={{ padding: "6px 0" }}></td>
							</tr>
						</tbody>
					</table>

					{/* Signatures */}
					<div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", fontFamily: "Arial, sans-serif", fontSize: "10pt", color: "black" }}>
						<div style={{ width: "40%" }}>
							<p style={{ margin: "0 0 5px 0" }}>Mengetahui :</p>
							<p style={{ margin: "0" }}>Manajer UPT Property ITS</p>
							<div style={{ height: "70px" }}></div>
							<p style={{ margin: "0" }}>Niken Indira Vindy Lestari</p>
							<p style={{ margin: "2px 0 0 0" }}>NIP. 1991202342113</p>
						</div>
						<div style={{ width: "40%" }}>
							<p style={{ margin: "0 0 5px 0" }}>Penerima</p>
							<div style={{ height: "85px" }}></div>
							<p style={{ margin: "0" }}>{bottomReceiverName}</p>
						</div>
					</div>

					{/* Note */}
					<div style={{ marginTop: "40px", fontFamily: "Arial, sans-serif", fontSize: "8.5pt", lineHeight: "1.4", color: "black", borderTop: "1px dashed #ccc", paddingTop: "10px" }}>
						<strong>NB :</strong> Pembatalan/pemindahan jadwal yang sudah dibayar, bisa dilakukan selambat lambatnya 7 hari sebelum menggunakan lapangan, kurang dari 7 hari tidak bisa dibatalkan/dipindah jadwal
					</div>
				</Box>
			</Box>

			<Flex justify="center" mt={4} gap={3}>
				<Button
					size="sm"
					bg="#008FFF"
					color="white"
					borderRadius="lg"
					leftIcon={<Icon as={MdPrint} />}
					_hover={{ bg: "#0070CC" }}
					onClick={handlePrintAndSave}
				>
					Cetak Kwitansi
				</Button>
				{onClose && (
					<Button size="sm" variant="outline" borderRadius="lg" onClick={onClose}>
						Tutup
					</Button>
				)}
			</Flex>
		</Box>
	)
}

export default KwitansiPrint
