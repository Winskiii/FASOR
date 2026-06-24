import VenueDetailTemplate, { type VenueConfig } from "@/components/organisms/VenueDetailTemplate"

const CONFIG: VenueConfig = {
name: "Stadion ITS",
sport: "Sepak Bola",
description:
"Stadion ITS (Lapangan Sepak Bola) adalah bagian dari fasilitas olahraga yang dikelola oleh UPT Fasilitas Olahraga di lingkungan Institut Teknologi Sepuluh Nopember (ITS), Surabaya, yang didirikan pada tahun 1991.",
rules: [
"Lapangan bisa ditutup sewaktu-waktu jika terjadi force majeure (hujan) yang menyebabkan tanah lapangan menjadi gembur dan tidak bisa digunakan; jika terjadi peliburan bisa direschedule dan tidak bisa direfund.",
"Lapangan Utama hanya untuk Game; kegiatan fisik bisa dilakukan di belakang gawang.",
],
images: {
main: "/images/stadion its.png",
img2: "/images/kursi stadion its.png",
img3: "/images/track lari stadion.png",
},
startingPrice: "Rp800.000",
priceUnit: "Per Sesi",
courts: ["Stadion ITS"],
slots: [
{ time: "06:00 - 08:00", price: 800000,  statuses: ["booked"] },
{ time: "08:00 - 10:00", price: 800000,  statuses: ["kosong"] },
{ time: "10:00 - 12:00", price: 800000,  statuses: ["kosong"] },
{ time: "12:00 - 14:00", price: 800000,  statuses: ["kosong"] },
{ time: "14:00 - 16:00", price: 1000000, statuses: ["kosong"] },
{ time: "16:00 - 18:00", price: 1000000, statuses: ["kosong"] },
{ time: "18:00 - 20:00", price: 1200000, statuses: ["kosong"] },
{ time: "20:00 - 22:00", price: 1200000, statuses: ["booked"] },
{ time: "22:00 - 00:00", price: 1200000, statuses: ["kosong"] },
],
}

export default function StadionITSPage() {
return <VenueDetailTemplate config={CONFIG} />
}
