import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PostFeed from '../components/PostFeed'
import { TopCommunitiesWidget, WelcomeWidget } from '../components/Widgets'
import { useAuth } from '../lib/AuthContext'
import AuthModal from '../components/AuthModal'
import Logo from '../components/Logo'

export default function Home() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      {/* ── Hero title card ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1830 0%, #1a2744 60%, #0d2137 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r3)',
        padding: '28px 28px 24px',
        marginBottom: 18,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* subtle glow behind logo */}
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(88,166,255,.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <Logo height={48} wordmark={true} darkBg={true} />

        {/* Tagline */}
        <h1 style={{
          fontFamily: 'var(--font-head)',
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          fontWeight: 800,
          color: '#e6edf3',
          margin: 0,
          lineHeight: 1.3,
          letterSpacing: '-0.3px',
        }}>
          Krowdly — Home of Real Time Discussions
        </h1>

        <p style={{
          fontSize: '.82rem',
          color: '#8b949e',
          margin: 0,
          maxWidth: 400,
          lineHeight: 1.6,
        }}>
          Join communities, share your thoughts, and connect with the conversation — live.
        </p>

        {/* CTA buttons */}
        {!user && (
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowAuth(true)}
            >
              Get Started
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setShowAuth(true)}
              style={{ color: '#8b949e', borderColor: '#30363d' }}
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* ── Quick post prompt ────────────────────────────── */}
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
          {user ? (user.email?.[0] || '?').toUpperCase() : '✏'}
        </div>
        <div style={{
          flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--r2)', padding: '8px 12px',
          color: 'var(--ink3)', fontSize: '.86rem',
        }}>
          {user ? 'Create a post…' : 'Join the discussion…'}
        </div>
        <button className="btn btn-secondary btn-sm">Post</button>
      </div>

      {/* ── Feed ────────────────────────────────────────── */}
      <PostFeed />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}

export function HomeRightPanel() {
  const { user }   = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  return (
    <>
      {!user && <WelcomeWidget onSignUp={() => setShowAuth(true)} />}
      <TopCommunitiesWidget />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
