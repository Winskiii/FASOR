import DetailOrderPage from "@/modules/admin/DetailOrder"
import { useRouter } from "next/router"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const AdminDetailOrder: NextPageWithLayout = () => {
	const router = useRouter()
	const { kode } = router.query
	return <DetailOrderPage kode={kode as string} />
}

AdminDetailOrder.getLayout = (page: ReactElement) => page

export default AdminDetailOrder
