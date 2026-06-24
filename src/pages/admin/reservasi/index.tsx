import SemuaReservasi from "../../../modules/admin/SemuaReservasi"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const SemuaReservasiPage: NextPageWithLayout = () => <SemuaReservasi />

SemuaReservasiPage.getLayout = (page: ReactElement) => page

export default SemuaReservasiPage
