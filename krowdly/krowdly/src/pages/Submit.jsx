import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../components/Toast'
import AuthModal from '../components/AuthModal'

export default function SubmitPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const toast      = useToast()

  const prefilledCommunity = location.state?.communityId ?? ''
  const prefilledSlug      = location.state?.communitySlug ?? ''

  const [communities, setCommunities] = useState([])
  const [form, setForm] = useState({
    title:       '',
    content:     '',
    communityId: prefilledCommunity,
  })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    supabase
      .from('communities')
      .select('id, name, slug, icon')
      .order('member_count', { ascending: false })
      .then(({ data }) => { if (data) setCommunities(data) })
  }, [])

  useEffect(() => {
    if (!user) setShowAuth(true)
  }, [user])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title = 'Title is required'
    if (form.title.length > 300)  e.title = 'Title must be under 300 characters'
    if (!form.communityId)        e.community = 'Choose a community'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!user) { setShowAuth(true); return }
    if (!validate()) return
    setLoading(true)

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title:        form.title.trim(),
        content:      form.content.trim() || null,
        user_id:      user.id,
        community_id: form.communityId,
      })
      .select('id')
      .single()

    setLoading(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Post created! 🚀')
    navigate(`/post/${data.id}`)
  }

  return (
    <>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-head)', fontSize: '1.3rem', fontWeight: 800,
          color: 'var(--ink)', marginBottom: 20,
        }}>
          Create a Post
        </h1>

        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--r3)', padding: '24px',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Community selector */}
            <div className="field">
              <label>Community *</label>
              <select
                value={form.communityId}
                onChange={e => set('communityId', e.target.value)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '9px 12px', color: form.communityId ? 'var(--ink)' : 'var(--ink3)', fontSize: '.88rem', outline: 'none' }}
              >
                <option value="">Choose a community…</option>
                {communities.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} k/{c.name}
                  </option>
                ))}
              </select>
              {errors.community && <span className="field-error">{errors.community}</span>}
            </div>

            {/* Title */}
            <div className="field">
              <label>Title *</label>
              <input
                placeholder="An interesting title…"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                maxLength={300}
                autoFocus
              />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
                {errors.title
                  ? <span className="field-error">{errors.title}</span>
                  : <span />}
                <span style={{ fontSize:'.68rem', color:'var(--ink3)', fontFamily:'var(--font-mono)' }}>
                  {form.title.length}/300
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="field">
              <label>Content <span style={{ color:'var(--ink3)', fontWeight:400 }}>(optional)</span></label>
              <textarea
                placeholder="Share your thoughts, a link, or some context…"
                value={form.content}
                onChange={e => set('content', e.target.value)}
                style={{ minHeight: 140 }}
              />
            </div>

            {/* Actions */}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:4 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading
                  ? <span className="spinner" style={{ width:16, height:16, margin:0 }} />
                  : 'Post'
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => { setShowAuth(false); navigate('/') }} />}
    </>
  )
}

export function SubmitRightPanel() {
  return (
    <div className="widget">
      <div className="widget-head">Posting Guidelines</div>
      <div className="widget-body">
        {[
          ['Be respectful', 'Treat others as you would want to be treated'],
          ['Stay on topic', 'Post in the right community'],
          ['No spam', 'Quality over quantity'],
          ['Sources matter', 'Cite your sources when sharing news'],
        ].map(([title, desc]) => (
          <div key={title} style={{ marginBottom: 12 }}>
            <div style={{ fontSize:'.8rem', fontWeight:700, color:'var(--ink)', marginBottom:2 }}>✦ {title}</div>
            <div style={{ fontSize:'.76rem', color:'var(--ink3)' }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
