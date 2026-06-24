import JenisOlahraga from "../../../modules/admin/JenisOlahraga"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const JenisOlahragaPage: NextPageWithLayout = () => <JenisOlahraga />

JenisOlahragaPage.getLayout = (page: ReactElement) => page

export default JenisOlahragaPage
