import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../components/Toast'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const navigate  = useNavigate()
  const toast     = useToast()

  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [bio,     setBio]     = useState(profile?.bio || '')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    supabase
      .from('posts')
      .select('id, title, vote_count, comment_count, created_at, communities:community_id(name, slug, icon)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setPosts(data)
        setLoading(false)
      })
  }, [user, navigate])

  useEffect(() => { setBio(profile?.bio || '') }, [profile])

  const saveBio = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ bio: bio.trim() || null })
      .eq('id', user.id)
    setSaving(false)
    if (error) { toast('Failed to save', 'error'); return }
    toast('Profile updated!')
    setEditing(false)
  }

  if (!user) return null

  const initials = (profile?.username || user.email || 'U')[0].toUpperCase()

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Profile card */}
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r3)', padding:24, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:16 }}>
          <div style={{
            width:60, height:60, borderRadius:'50%',
            background:'var(--accent)', color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.5rem', fontWeight:800, flexShrink:0,
          }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'var(--font-head)', fontSize:'1.2rem', fontWeight:800, color:'var(--ink)', marginBottom:2 }}>
              u/{profile?.username ?? user.email?.split('@')[0]}
            </div>
            <div style={{ fontSize:'.76rem', color:'var(--ink3)', fontFamily:'var(--font-mono)' }}>
              Joined {profile?.created_at
                ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
                : 'recently'
              }
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(e => !e)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <div>
            <textarea
              className="comment-input"
              placeholder="Tell people about yourself…"
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={300}
              style={{ minHeight: 80 }}
            />
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:6 }}>
              <span style={{ fontSize:'.72rem', color:'var(--ink3)', alignSelf:'center' }}>{bio.length}/300</span>
              <button className="btn btn-primary btn-sm" onClick={saveBio} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          profile?.bio && (
            <p style={{ fontSize:'.86rem', color:'var(--ink2)', lineHeight:1.6 }}>{profile.bio}</p>
          )
        )}

        <div style={{ display:'flex', gap:20, marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700, color:'var(--ink)', fontSize:'1.1rem' }}>{posts.length}</div>
            <div style={{ fontSize:'.68rem', color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1 }}>Posts</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700, color:'var(--ink)', fontSize:'1.1rem' }}>
              {posts.reduce((s, p) => s + (p.vote_count || 0), 0)}
            </div>
            <div style={{ fontSize:'.68rem', color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1 }}>Upvotes</div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1rem', fontWeight:700, color:'var(--ink2)', marginBottom:12, textTransform:'uppercase', letterSpacing:1, fontSize:'.78rem' }}>
        My Posts
      </h2>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ marginBottom:10 }}>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
              <div className="skeleton" style={{ height:11, width:80 }} />
              <div className="skeleton" style={{ height:16, width:'75%' }} />
              <div className="skeleton" style={{ height:11, width:'45%' }} />
            </div>
          </div>
        ))
      ) : posts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'30px 0', color:'var(--ink3)', fontSize:'.84rem' }}>
          You haven't posted anything yet.
          <br />
          <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={() => navigate('/submit')}>
            Create your first post
          </button>
        </div>
      ) : (
        posts.map(p => (
          <div
            key={p.id}
            onClick={() => navigate(`/post/${p.id}`)}
            style={{
              background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r2)',
              padding:'12px 14px', marginBottom:8, cursor:'pointer', transition:'var(--T)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--ink3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
          >
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
              <span style={{ fontSize:'.7rem', color:'var(--blue)', fontWeight:600 }}>
                {p.communities?.icon} k/{p.communities?.name}
              </span>
              <span style={{ fontSize:'.65rem', color:'var(--ink3)', fontFamily:'var(--font-mono)' }}>
                {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
              </span>
            </div>
            <div style={{ fontWeight:600, color:'var(--ink)', fontSize:'.9rem', marginBottom:6, lineHeight:1.3 }}>
              {p.title}
            </div>
            <div style={{ display:'flex', gap:12, fontSize:'.72rem', color:'var(--ink3)' }}>
              <span>▲ {p.vote_count ?? 0}</span>
              <span>💬 {p.comment_count ?? 0}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
