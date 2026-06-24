import StadionITSPage from "@/modules/stadion-its"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const StadionITS: NextPageWithLayout = () => <StadionITSPage />
StadionITS.getLayout = (page: ReactElement) => page

export default StadionITS
