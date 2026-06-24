import SesiAdmin from "../../../modules/admin/Sesi"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const SesiPage: NextPageWithLayout = () => <SesiAdmin />

SesiPage.getLayout = (page: ReactElement) => page

export default SesiPage
