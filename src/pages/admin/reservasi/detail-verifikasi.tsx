import DetailVerifikasi from "../../../modules/admin/DetailVerifikasi"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const DetailVerifikasiPage: NextPageWithLayout = () => <DetailVerifikasi />

DetailVerifikasiPage.getLayout = (page: ReactElement) => page

export default DetailVerifikasiPage
