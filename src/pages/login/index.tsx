import LoginPage from "@/modules/login"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"

const Login: NextPageWithLayout = () => <LoginPage />
Login.getLayout = (page: ReactElement) => page

export default Login

