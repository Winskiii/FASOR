import LapanganMiniSoccerPage from "@/modules/lapangan-mini-soccer"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Page: NextPageWithLayout = () => <LapanganMiniSoccerPage />
Page.getLayout = (page: ReactElement) => page
export default Page
