import RiwayatPemesananPage from "@/modules/riwayat-pemesanan"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const RiwayatPemesanan: NextPageWithLayout = () => <RiwayatPemesananPage />
RiwayatPemesanan.getLayout = (page: ReactElement) => page

export default RiwayatPemesanan
