import RescheduleRequest from "../../../modules/admin/RescheduleRequest"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const ReschedulePage: NextPageWithLayout = () => <RescheduleRequest />

ReschedulePage.getLayout = (page: ReactElement) => page

export default ReschedulePage
