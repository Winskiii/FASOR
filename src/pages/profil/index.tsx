import ProfilPage from "@/modules/profil"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Profil: NextPageWithLayout = () => <ProfilPage />
Profil.getLayout = (page: ReactElement) => page

export default Profil
