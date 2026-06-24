import LapanganFutsalPlnPage from "@/modules/lapangan-futsal-pln"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Page: NextPageWithLayout = () => <LapanganFutsalPlnPage />
Page.getLayout = (page: ReactElement) => page
export default Page
