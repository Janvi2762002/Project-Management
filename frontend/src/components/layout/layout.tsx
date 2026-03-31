import type { ReactNode } from "react"
import Sidebar from "./sidebar"
// import Topbar from "./topbar"


type Props = {
  children: ReactNode
}

function Layout({ children }: Props) {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main">

        {/* <Topbar /> */}

        <div className="content">
          {children}
        </div>

      </div>

    </div>
  )
}

export default Layout