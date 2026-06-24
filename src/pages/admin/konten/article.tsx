import Article from "../../../modules/admin/Article"
import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../../_app"

const ArticlePage: NextPageWithLayout = () => <Article />

ArticlePage.getLayout = (page: ReactElement) => page

export default ArticlePage
