import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PostFeed from '../components/PostFeed'
import { TopCommunitiesWidget, WelcomeWidget } from '../components/Widgets'
import { useAuth } from '../lib/AuthContext'
import AuthModal from '../components/AuthModal'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      {/* Page layout uses CSS grid — right panel is passed via context */}
      <div>
        {/* Quick post prompt */}
        <div
          onClick={() => user ? navigate('/submit') : setShowAuth(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r3)', padding: '10px 14px',
            marginBottom: 14, cursor: 'pointer', transition: 'var(--T)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: user ? 'var(--accent)' : 'var(--bg4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '.82rem', flexShrink: 0,
          }}>
            {user ? (user.email?.[0] || '?').toUpperCase() : '?'}
          </div>
          <div style={{
            flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 'var(--r2)', padding: '8px 12px',
            color: 'var(--ink3)', fontSize: '.86rem',
          }}>
            {user ? 'Create a post…' : 'Join to post…'}
          </div>
          <button className="btn btn-secondary btn-sm">Post</button>
        </div>

        <PostFeed />
      </div>

      {/* Right panel content — rendered via AppLayout */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}

// Separate export for the right panel
export function HomeRightPanel() {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  return (
    <>
      {!user && <WelcomeWidget onSignUp={() => setShowAuth(true)} />}
      <TopCommunitiesWidget />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
