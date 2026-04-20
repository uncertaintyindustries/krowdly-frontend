import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PostCard from '../components/PostCard'
import { usePosts } from '../hooks/usePosts'
import { useAuth } from '../lib/AuthContext'

export default function SearchPage() {
  const [searchParams]   = useSearchParams()
  const q                = searchParams.get('q') || ''
  const { user }         = useAuth()
  const navigate         = useNavigate()

  const [posts,    setPosts]    = useState([])
  const [comms,    setComms]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [userVotes,setUserVotes]= useState(new Set())
  const [tab,      setTab]      = useState('posts')

  useEffect(() => {
    if (!q) return
    setLoading(true)

    Promise.all([
      supabase
        .from('posts')
        .select(`id, title, content, vote_count, comment_count, created_at,
          profiles:user_id(username), communities:community_id(name, slug, icon)`)
        .ilike('title', `%${q}%`)
        .order('vote_count', { ascending: false })
        .limit(20),
      supabase
        .from('communities')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(8),
    ]).then(([postsRes, commsRes]) => {
      setPosts(postsRes.data || [])
      setComms(commsRes.data || [])
      setLoading(false)
    })
  }, [q])

  useEffect(() => {
    if (!user) return
    supabase.from('votes').select('post_id').eq('user_id', user.id)
      .then(({ data }) => { if (data) setUserVotes(new Set(data.map(v => v.post_id))) })
  }, [user])

  const handleVote = async (postId) => {
    if (!user) return
    const hasVoted = userVotes.has(postId)
    setUserVotes(prev => { const n = new Set(prev); hasVoted ? n.delete(postId) : n.add(postId); return n })
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, vote_count: p.vote_count + (hasVoted ? -1 : 1) } : p))
    if (hasVoted) {
      await supabase.from('votes').delete().eq('user_id', user.id).eq('post_id', postId)
    } else {
      await supabase.from('votes').insert({ user_id: user.id, post_id: postId })
    }
  }

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:'.8rem', color:'var(--ink3)', marginBottom:4 }}>Search results for</div>
        <h1 style={{ fontFamily:'var(--font-head)', fontSize:'1.3rem', fontWeight:800, color:'var(--ink)' }}>
          "{q}"
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:16 }}>
        {[['posts', `Posts (${posts.length})`], ['communities', `Communities (${comms.length})`]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding:'9px 16px', background:'none', border:'none',
              borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom:-1, color: tab === key ? 'var(--ink)' : 'var(--ink3)',
              fontWeight: tab === key ? 700 : 500, fontSize:'.84rem', cursor:'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px 0' }}><div className="spinner" /></div>
      ) : tab === 'posts' ? (
        posts.length === 0
          ? <p style={{ color:'var(--ink3)', textAlign:'center', padding:'30px 0' }}>No posts found for "{q}"</p>
          : posts.map(p => (
              <PostCard key={p.id} post={p} voted={userVotes.has(p.id)} onVote={handleVote} />
            ))
      ) : (
        comms.length === 0
          ? <p style={{ color:'var(--ink3)', textAlign:'center', padding:'30px 0' }}>No communities found</p>
          : comms.map(c => (
              <div
                key={c.id}
                onClick={() => navigate(`/k/${c.slug}`)}
                style={{
                  background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r2)',
                  padding:'14px 16px', marginBottom:8, cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'var(--T)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--ink3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
              >
                <div style={{ fontSize:'1.4rem' }}>{c.icon}</div>
                <div>
                  <div style={{ fontWeight:700, color:'var(--ink)' }}>k/{c.name}</div>
                  <div style={{ fontSize:'.76rem', color:'var(--ink3)' }}>{c.member_count?.toLocaleString()} members</div>
                </div>
              </div>
            ))
      )}
    </div>
  )
}
