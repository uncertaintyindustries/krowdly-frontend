import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CommunitiesPage() {
  const navigate   = useNavigate()
  const [communities, setCommunities] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')

  useEffect(() => {
    supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false })
      .then(({ data }) => {
        if (data) setCommunities(data)
        setLoading(false)
      })
  }, [])

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h1 style={{ fontFamily:'var(--font-head)', fontSize:'1.3rem', fontWeight:800, color:'var(--ink)' }}>
          All Communities
        </h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-community')}>
          + New Community
        </button>
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:16 }}>
        <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink3)', width:14, height:14, pointerEvents:'none' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          placeholder="Search communities…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width:'100%', background:'var(--bg2)', border:'1px solid var(--border)',
            borderRadius:'var(--r2)', padding:'9px 12px 9px 36px',
            color:'var(--ink)', fontSize:'.88rem', outline:'none',
          }}
        />
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius:'var(--r3)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--ink3)' }}>
          {search ? `No communities matching "${search}"` : 'No communities yet'}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => navigate(`/k/${c.slug}`)}
              style={{
                background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r3)',
                padding:16, cursor:'pointer', transition:'var(--T)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--ink3)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)' }}
            >
              <div style={{ fontSize:'1.6rem', marginBottom:8 }}>{c.icon}</div>
              <div style={{ fontWeight:700, color:'var(--ink)', marginBottom:4 }}>k/{c.name}</div>
              <div style={{ fontSize:'.78rem', color:'var(--ink3)', lineHeight:1.5, marginBottom:10,
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
              }}>
                {c.description || 'A community for discussion.'}
              </div>
              <div style={{ fontSize:'.72rem', color:'var(--ink3)', fontFamily:'var(--font-mono)' }}>
                {c.member_count?.toLocaleString() ?? 0} members
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
