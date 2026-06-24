import GorBulutangkisPage from "@/modules/gor-bulutangkis"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const GorBulutangkis: NextPageWithLayout = () => <GorBulutangkisPage />
GorBulutangkis.getLayout = (page: ReactElement) => page

export default GorBulutangkis
