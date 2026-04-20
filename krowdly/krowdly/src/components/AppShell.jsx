import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

export default function AppShell({ rightPanel }) {
  return (
    <div className="app-shell">
      <Topbar />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <aside className="right-panel">
        {rightPanel}
      </aside>
    </div>
  )
}
