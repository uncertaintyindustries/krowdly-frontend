import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ToastProvider } from './components/Toast'
import App from './App'
import './index.css'

// Catch any render crash and show it instead of a blank screen
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 16, padding: 24, background: '#0d1117', color: '#e6edf3',
          fontFamily: 'monospace',
        }}>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <h2 style={{ color: '#f78166', margin: 0 }}>Something went wrong</h2>
          <pre style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
            padding: '14px 18px', maxWidth: 600, width: '100%', overflow: 'auto',
            fontSize: '.82rem', color: '#8b949e', lineHeight: 1.6,
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack?.split('\n').slice(0, 6).join('\n')}
          </pre>
          <p style={{ color: '#8b949e', fontSize: '.84rem', textAlign: 'center' }}>
            Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel environment variables, then redeploy.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#f78166', color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
