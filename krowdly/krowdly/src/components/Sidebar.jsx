import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function Sidebar() {
  const { user }      = useAuth()
  const navigate      = useNavigate()
  const { slug }      = useParams()
  const [communities, setCommunities] = useState([])
  const [joined,      setJoined]      = useState([])

  useEffect(() => {
    // Load all communities
    supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false })
      .limit(30)
      .then(({ data }) => { if (data) setCommunities(data) })
  }, [])

  useEffect(() => {
    if (!user) { setJoined([]); return }
    supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id)
      .then(({ data }) => { if (data) setJoined(data.map(d => d.community_id)) })
  }, [user])

  const joinedComms = communities.filter(c => joined.includes(c.id))
  const topComms    = communities.slice(0, 10)

  const NavItem = ({ label, icon, path, exact = false }) => {
    const active = exact ? window.location.pathname === path : window.location.pathname.startsWith(path) && path !== '/'
    return (
      <button
        className={`sidebar-link ${active ? 'active' : ''}`}
        onClick={() => navigate(path)}
      >
        <span className="comm-icon">{icon}</span>
        {label}
      </button>
    )
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-section">
        <NavItem label="Home Feed"   icon="🏠" path="/"   exact />
        <NavItem label="All Posts"   icon="🌍" path="/all" />
        <NavItem label="Communities" icon="📋" path="/communities" />
      </div>

      {user && joinedComms.length > 0 && (
        <div className="sidebar-section" style={{ marginTop: 8 }}>
          <div className="sidebar-label">My Communities</div>
          {joinedComms.map(c => (
            <button
              key={c.id}
              className={`sidebar-link ${slug === c.slug ? 'active' : ''}`}
              onClick={() => navigate(`/k/${c.slug}`)}
            >
              <span className="comm-icon">{c.icon}</span>
              k/{c.name}
            </button>
          ))}
        </div>
      )}

      <div className="sidebar-section" style={{ marginTop: 8 }}>
        <div className="sidebar-label">Top Communities</div>
        {topComms.map(c => (
          <button
            key={c.id}
            className={`sidebar-link ${slug === c.slug ? 'active' : ''}`}
            onClick={() => navigate(`/k/${c.slug}`)}
          >
            <span className="comm-icon">{c.icon}</span>
            k/{c.name}
          </button>
        ))}
      </div>

      <div className="sidebar-section" style={{ marginTop: 8 }}>
        <div className="sidebar-label">More</div>
        <NavItem label="Create Community" icon="✚" path="/create-community" />
      </div>

      <div style={{ padding: '16px 12px 4px', fontSize: '.7rem', color: 'var(--ink3)', lineHeight: 1.6 }}>
        Krowdly © 2026 · <span style={{ cursor: 'pointer', color: 'var(--blue)' }}>Help</span>
      </div>
    </nav>
  )
}
