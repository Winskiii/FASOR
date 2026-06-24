import PengumumanListPage from "@/modules/pengumuman"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Pengumuman: NextPageWithLayout = () => <PengumumanListPage />
Pengumuman.getLayout = (page: ReactElement) => page

export default Pengumuman
