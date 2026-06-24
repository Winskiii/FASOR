import CekPemesananPage from "@/modules/cek-pemesanan"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const CekPemesanan: NextPageWithLayout = () => <CekPemesananPage />
CekPemesanan.getLayout = (page: ReactElement) => page

export default CekPemesanan
