import DaftarHargaPage from "@/modules/admin/DaftarHarga"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const AdminDaftarHarga: NextPageWithLayout = () => <DaftarHargaPage />

AdminDaftarHarga.getLayout = (page: ReactElement) => page

export default AdminDaftarHarga
