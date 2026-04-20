import { Routes, Route, useLocation } from 'react-router-dom'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import Home, { HomeRightPanel }       from './pages/Home'
import CommunityPage, { CommunityRightPanel } from './pages/Community'
import ThreadPage, { ThreadRightPanel }       from './pages/Thread'
import SubmitPage, { SubmitRightPanel }       from './pages/Submit'
import CreateCommunity                        from './pages/CreateCommunity'
import CommunitiesPage                        from './pages/Communities'
import ProfilePage                            from './pages/Profile'
import SearchPage                             from './pages/Search'

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-head)', color: 'var(--ink)', marginBottom: 8 }}>Page not found</h1>
      <p style={{ color: 'var(--ink3)', marginBottom: 20 }}>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary">← Go Home</a>
    </div>
  )
}

function AllPosts() {
  // Same as Home feed but without the community filter
  return <Home />
}

export default function App() {
  const location = useLocation()

  // Choose right panel based on route
  const rightPanel = (() => {
    if (location.pathname.startsWith('/k/'))     return <CommunityRightPanel />
    if (location.pathname.startsWith('/post/'))  return <ThreadRightPanel />
    if (location.pathname === '/submit')         return <SubmitRightPanel />
    return <HomeRightPanel />
  })()

  return (
    <div className="app-shell">
      <Topbar />
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"                  element={<Home />} />
          <Route path="/all"               element={<AllPosts />} />
          <Route path="/communities"       element={<CommunitiesPage />} />
          <Route path="/k/:slug"           element={<CommunityPage />} />
          <Route path="/post/:id"          element={<ThreadPage />} />
          <Route path="/submit"            element={<SubmitPage />} />
          <Route path="/create-community"  element={<CreateCommunity />} />
          <Route path="/profile"           element={<ProfilePage />} />
          <Route path="/search"            element={<SearchPage />} />
          <Route path="*"                  element={<NotFound />} />
        </Routes>
      </main>
      <aside className="right-panel">
        {rightPanel}
      </aside>
    </div>
  )
}
