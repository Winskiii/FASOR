import LapanganBasketFlexyPage from "@/modules/lapangan-basket-flexy"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Page: NextPageWithLayout = () => <LapanganBasketFlexyPage />
Page.getLayout = (page: ReactElement) => page
export default Page
