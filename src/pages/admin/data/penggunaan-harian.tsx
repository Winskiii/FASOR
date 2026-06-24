import PenggunaanHarianAdmin from "../../../modules/admin/PenggunaanHarian"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const PenggunaanHarianPage: NextPageWithLayout = () => <PenggunaanHarianAdmin />

PenggunaanHarianPage.getLayout = (page: ReactElement) => page

export default PenggunaanHarianPage
