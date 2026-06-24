import LapanganTenisPage from "@/modules/lapangan-tenis"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Page: NextPageWithLayout = () => <LapanganTenisPage />
Page.getLayout = (page: ReactElement) => page
export default Page
