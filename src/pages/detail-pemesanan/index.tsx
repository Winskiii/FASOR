import DetailPemesananPage from "@/modules/detail-pemesanan"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const DetailPemesanan: NextPageWithLayout = () => <DetailPemesananPage />
DetailPemesanan.getLayout = (page: ReactElement) => page

export default DetailPemesanan
