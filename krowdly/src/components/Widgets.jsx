import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export function CommunityWidget({ community, isMember, onJoin }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!community) return null

  return (
    <div className="widget">
      <div className="widget-head">About k/{community.name}</div>
      <div className="widget-body">
        <p style={{ fontSize: '.84rem', color: 'var(--ink2)', lineHeight: 1.6, marginBottom: 12 }}>
          {community.description || 'A place to discuss anything.'}
        </p>
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{community.member_count?.toLocaleString() ?? 0}</div>
            <div style={{ fontSize: '.68rem', color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: 1 }}>Members</div>
          </div>
        </div>
        {user ? (
          <button
            className={`btn ${isMember ? 'btn-secondary' : 'btn-primary'}`}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onJoin}
          >
            {isMember ? '✓ Joined' : 'Join Community'}
          </button>
        ) : null}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          onClick={() => navigate('/submit', { state: { communityId: community.id } })}
        >
          + Create Post
        </button>
      </div>
    </div>
  )
}

export function TopCommunitiesWidget() {
  const navigate    = useNavigate()
  const [comms, setComms] = useState([])

  useEffect(() => {
    supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false })
      .limit(8)
      .then(({ data }) => { if (data) setComms(data) })
  }, [])

  return (
    <div className="widget">
      <div className="widget-head">Top Communities</div>
      <div className="widget-body" style={{ padding: '6px 0' }}>
        {comms.map((c, i) => (
          <div key={c.id} className="widget-item" onClick={() => navigate(`/k/${c.slug}`)}>
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', minWidth: 18 }}>
              {i + 1}.
            </span>
            <span className="icon">{c.icon}</span>
            <span style={{ fontWeight: 600 }}>k/{c.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: '.7rem', color: 'var(--ink3)' }}>
              {c.member_count?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WelcomeWidget({ onSignUp }) {
  return (
    <div className="widget">
      <div className="widget-head">Welcome to Krowdly</div>
      <div className="widget-body">
        <p style={{ fontSize: '.82rem', color: 'var(--ink2)', lineHeight: 1.6, marginBottom: 12 }}>
          Nigeria's home for real discussions. Join communities, share your thoughts, and connect with the culture.
        </p>
        <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={onSignUp}>
          Get Started
        </button>
      </div>
    </div>
  )
}
