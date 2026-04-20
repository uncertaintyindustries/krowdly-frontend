import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../components/Toast'
import AuthModal from '../components/AuthModal'

const ICONS = ['💬','🌍','💻','🏛️','💰','🎵','📚','⚽','❤️','🎭','🍔','✈️','💡','🔥','🎮','📱','🏋️','🎨','🐾','🌿']

function slugify(str) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export default function CreateCommunity() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const toast      = useToast()

  const [form, setForm] = useState({ name: '', description: '', icon: '💬' })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [showAuth, setShowAuth] = useState(!user)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const slug = slugify(form.name)

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 3)   e.name = 'Name must be at least 3 characters'
    if (form.name.trim().length > 50)  e.name = 'Name must be under 50 characters'
    if (!/^[a-zA-Z0-9 _-]+$/.test(form.name)) e.name = 'Only letters, numbers, spaces, hyphens'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!user) { setShowAuth(true); return }
    if (!validate()) return
    setLoading(true)

    const { data, error } = await supabase
      .from('communities')
      .insert({
        name:        form.name.trim(),
        slug,
        description: form.description.trim() || null,
        icon:        form.icon,
        creator_id:  user.id,
        member_count: 1,
      })
      .select('slug')
      .single()

    if (error) {
      setLoading(false)
      if (error.code === '23505') toast('Community name already taken', 'error')
      else toast(error.message, 'error')
      return
    }

    // Auto-join as creator
    await supabase.from('community_members').insert({
      user_id: user.id,
      community_id: data.id,
    }).catch(() => {})

    toast(`k/${form.name.trim()} created! 🎉`)
    navigate(`/k/${data.slug}`)
  }

  return (
    <>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ fontFamily:'var(--font-head)', fontSize:'1.3rem', fontWeight:800, color:'var(--ink)', marginBottom:20 }}>
          Create a Community
        </h1>

        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r3)', padding:24 }}>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="field">
              <label>Community Name *</label>
              <input
                placeholder="LagosDevs, PoliticsNG, NaijaMusic…"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                maxLength={50}
                autoFocus
              />
              {slug && form.name.length >= 3 && (
                <span style={{ fontSize:'.72rem', color:'var(--ink3)', marginTop:2 }}>
                  URL: k/<strong style={{ color:'var(--blue)' }}>{slug}</strong>
                </span>
              )}
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            {/* Icon picker */}
            <div className="field">
              <label>Icon</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => set('icon', ic)}
                    style={{
                      width:36, height:36, borderRadius:'var(--r2)', fontSize:'1.1rem',
                      border: form.icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: form.icon === ic ? 'rgba(247,129,102,.12)' : 'var(--bg3)',
                      cursor:'pointer', transition:'var(--T)',
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="field">
              <label>Description</label>
              <textarea
                placeholder="What is this community about? (optional)"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                style={{ minHeight: 90 }}
                maxLength={500}
              />
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:4 }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <span className="spinner" style={{ width:16, height:16, margin:0 }} />
                  : 'Create Community'
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => { setShowAuth(false); if (!user) navigate('/') }} />}
    </>
  )
}
