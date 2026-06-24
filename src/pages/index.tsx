/**
 * @file index.tsx
 * @description Public landing page - Fasor ITS
 **/
import LandingPage from "@/modules/landing"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "./_app"

const Home: NextPageWithLayout = () => <LandingPage />

Home.getLayout = (page: ReactElement) => page

export default Home
