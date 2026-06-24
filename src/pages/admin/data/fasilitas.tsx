import Fasilitas from "../../../modules/admin/Fasilitas"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const FasilitasPage: NextPageWithLayout = () => <Fasilitas />

FasilitasPage.getLayout = (page: ReactElement) => page

export default FasilitasPage
