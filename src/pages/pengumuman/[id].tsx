import type { ReactElement } from "react"
import { useRouter } from "next/router"
import type { NextPageWithLayout } from "../_app"
import PengumumanDetailPage from "@/modules/pengumuman/DetailPage"
import { useAnnouncementById } from "@/data/pengumuman"

const PengumumanDetail: NextPageWithLayout = () => {
	const router = useRouter()
	const { id } = router.query

	const announcement = useAnnouncementById(id ? Number(id) : undefined)

	if (!id) return null

	if (!announcement) {
		return <div>Pengumuman tidak ditemukan</div>
	}

	return <PengumumanDetailPage announcement={announcement} />
}

PengumumanDetail.getLayout = (page: ReactElement) => page

export default PengumumanDetail
