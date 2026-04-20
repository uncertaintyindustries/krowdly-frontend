import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useToast } from './Toast'

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth()
  const toast = useToast()
  const [tab,     setTab]     = useState('signin')
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({ email: '', password: '', username: '' })
  const [errors,  setErrors]  = useState({})

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.email.includes('@')) e.email = 'Enter a valid email'
    if (form.password.length < 6)  e.password = 'Password must be 6+ characters'
    if (tab === 'signup' && form.username.length < 3) e.username = 'Username must be 3+ characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    if (tab === 'signin') {
      const { error } = await signIn(form.email, form.password)
      if (error) { toast(error.message, 'error'); setLoading(false); return }
      toast('Welcome back!')
      onClose()
    } else {
      const { error } = await signUp(form.email, form.password, form.username)
      if (error) { toast(error.message, 'error'); setLoading(false); return }
      toast('Account created! Check your email to confirm.')
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="form-card modal-card" style={{ width: '100%', maxWidth: 420 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {['signin', 'signup'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setErrors({}) }}
              style={{
                flex: 1, padding: '10px 0',
                background: 'none', border: 'none',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1,
                color: tab === t ? 'var(--ink)' : 'var(--ink3)',
                fontWeight: tab === t ? 700 : 500,
                fontSize: '.86rem', cursor: 'pointer', transition: 'var(--T)',
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <p className="form-title" style={{ marginBottom: 20 }}>
          {tab === 'signin' ? 'Welcome back' : 'Join Krowdly'}
        </p>

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="field">
              <label>Username</label>
              <input
                placeholder="your_username"
                value={form.username}
                onChange={e => set('username', e.target.value)}
                autoFocus
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              autoFocus={tab === 'signin'}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading
              ? <span className="spinner" style={{ width: 16, height: 16, margin: 0 }} />
              : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-muted text-center mt-2">
          {tab === 'signin'
            ? <span>No account? <button onClick={() => setTab('signup')} style={{ background:'none', border:'none', color:'var(--blue)', cursor:'pointer', fontSize:'inherit' }}>Sign up</button></span>
            : <span>Already have one? <button onClick={() => setTab('signin')} style={{ background:'none', border:'none', color:'var(--blue)', cursor:'pointer', fontSize:'inherit' }}>Sign in</button></span>
          }
        </p>
      </div>
    </div>
  )
}
