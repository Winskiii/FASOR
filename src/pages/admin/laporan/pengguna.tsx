import LaporanPengguna from "@/modules/admin/LaporanPengguna"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "@/pages/_app"

const LaporanPenggunaPage: NextPageWithLayout = () => <LaporanPengguna />

LaporanPenggunaPage.getLayout = (page: ReactElement) => page

export default LaporanPenggunaPage
