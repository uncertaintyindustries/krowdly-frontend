import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import AuthModal from './AuthModal'
import Logo from './Logo'

export default function Topbar() {
  const { user, profile, signOut } = useAuth()
  const navigate  = useNavigate()
  const [showAuth, setShowAuth]   = useState(false)
  const [showMenu, setShowMenu]   = useState(false)
  const [search,   setSearch]     = useState('')

  const handleSearch = e => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <>
      <header className="topbar">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', lineHeight: 1, padding: '2px 0' }}
          aria-label="Krowdly home"
        >
          <Logo height={34} wordmark={true} />
        </button>

        {/* Search */}
        <form className="topbar-search" onSubmit={handleSearch}>
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search Krowdly…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        {/* Right side */}
        <div className="topbar-right">
          {user ? (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/submit')}
              >
                + Post
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMenu(m => !m)}
                  style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r2)', padding: '5px 10px',
                    color: 'var(--ink)', fontSize: '.82rem', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'var(--T)',
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.7rem', fontWeight: 800,
                  }}>
                    {(profile?.username || user.email)?.[0]?.toUpperCase()}
                  </span>
                  {profile?.username || 'Me'}
                </button>
                {showMenu && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                      onClick={() => setShowMenu(false)}
                    />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                      background: 'var(--bg2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r2)', minWidth: 160, zIndex: 100,
                      boxShadow: 'var(--sh2)', overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => { setShowMenu(false); navigate('/profile') }}
                        style={{ display:'block',width:'100%',textAlign:'left',padding:'9px 14px',background:'none',border:'none',color:'var(--ink)',fontSize:'.84rem',cursor:'pointer' }}
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => { setShowMenu(false); navigate('/create-community') }}
                        style={{ display:'block',width:'100%',textAlign:'left',padding:'9px 14px',background:'none',border:'none',color:'var(--ink)',fontSize:'.84rem',cursor:'pointer' }}
                      >
                        Create Community
                      </button>
                      <div style={{ height: 1, background: 'var(--border)' }} />
                      <button
                        onClick={() => { signOut(); setShowMenu(false) }}
                        style={{ display:'block',width:'100%',textAlign:'left',padding:'9px 14px',background:'none',border:'none',color:'var(--accent2)',fontSize:'.84rem',cursor:'pointer' }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAuth(true)}>Log In</button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>Sign Up</button>
            </>
          )}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
