import KonfirmasiReservasiPage from "@/modules/konfirmasi-reservasi"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const KonfirmasiReservasi: NextPageWithLayout = () => <KonfirmasiReservasiPage />
KonfirmasiReservasi.getLayout = (page: ReactElement) => page

export default KonfirmasiReservasi
