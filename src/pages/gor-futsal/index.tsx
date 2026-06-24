import GorFutsalPage from "@/modules/gor-futsal"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Page: NextPageWithLayout = () => <GorFutsalPage />
Page.getLayout = (page: ReactElement) => page
export default Page
