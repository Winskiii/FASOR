import AdminDashboard from "@/modules/admin"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const AdminPage: NextPageWithLayout = () => <AdminDashboard />

AdminPage.getLayout = (page: ReactElement) => page

export default AdminPage
