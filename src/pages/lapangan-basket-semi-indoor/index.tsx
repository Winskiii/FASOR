import LapanganBasketSemiIndoorPage from "@/modules/lapangan-basket-semi-indoor"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Page: NextPageWithLayout = () => <LapanganBasketSemiIndoorPage />
Page.getLayout = (page: ReactElement) => page
export default Page
