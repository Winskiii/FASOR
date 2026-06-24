import LapanganVoliPage from "@/modules/lapangan-voli"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Page: NextPageWithLayout = () => <LapanganVoliPage />
Page.getLayout = (page: ReactElement) => page
export default Page
