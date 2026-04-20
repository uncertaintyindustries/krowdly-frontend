import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../components/Toast'
import AuthModal from '../components/AuthModal'

function CommentItem({ comment, depth = 0 }) {
  const initials = (comment.profiles?.username || 'A')[0].toUpperCase()
  const ago = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : ''

  return (
    <div
      className="comment"
      style={{ paddingLeft: depth > 0 ? 28 : 0, borderLeft: depth > 0 ? '2px solid var(--border)' : 'none' }}
    >
      <div className="comment-avatar">{initials}</div>
      <div className="comment-body">
        <div className="comment-meta">
          <span className="comment-author">{comment.profiles?.username ?? 'anon'}</span>
          <span className="comment-time">{ago}</span>
        </div>
        <div className="comment-text">{comment.content}</div>
      </div>
    </div>
  )
}

export default function ThreadPage() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const toast     = useToast()

  const [post,       setPost]       = useState(null)
  const [comments,   setComments]   = useState([])
  const [voted,      setVoted]      = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [commentTxt, setCommentTxt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showAuth,   setShowAuth]   = useState(false)

  // Load post
  useEffect(() => {
    if (!id) return
    supabase
      .from('posts')
      .select(`
        id, title, content, vote_count, comment_count, created_at,
        profiles:user_id ( id, username ),
        communities:community_id ( id, name, slug, icon )
      `)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/'); return }
        setPost(data)
        setLoading(false)
      })
  }, [id, navigate])

  // Load comments
  const loadComments = useCallback(() => {
    if (!id) return
    supabase
      .from('comments')
      .select('id, content, created_at, profiles:user_id ( username )')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setComments(data) })
  }, [id])

  useEffect(() => { loadComments() }, [loadComments])

  // Check user vote
  useEffect(() => {
    if (!user || !id) return
    supabase
      .from('votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .maybeSingle()
      .then(({ data }) => setVoted(!!data))
  }, [user, id])

  const handleVote = async () => {
    if (!user) { setShowAuth(true); return }
    if (voted) {
      await supabase.from('votes').delete().eq('user_id', user.id).eq('post_id', id)
      setVoted(false)
      setPost(p => ({ ...p, vote_count: Math.max((p.vote_count || 0) - 1, 0) }))
    } else {
      await supabase.from('votes').insert({ user_id: user.id, post_id: id })
      setVoted(true)
      setPost(p => ({ ...p, vote_count: (p.vote_count || 0) + 1 }))
    }
  }

  const handleComment = async () => {
    if (!user) { setShowAuth(true); return }
    const text = commentTxt.trim()
    if (!text) return
    setSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .insert({ post_id: id, user_id: user.id, content: text })
    setSubmitting(false)
    if (error) { toast('Failed to post comment', 'error'); return }
    setCommentTxt('')
    loadComments()
    toast('Comment posted!')
  }

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: 180, borderRadius: 'var(--r3)', marginBottom: 20 }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ display:'flex', gap:12, padding:'14px 0', borderBottom:'1px solid var(--border2)' }}>
          <div className="skeleton" style={{ width:32, height:32, borderRadius:'50%', flexShrink:0 }} />
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
            <div className="skeleton" style={{ height:11, width:100 }} />
            <div className="skeleton" style={{ height:14, width:'80%' }} />
            <div className="skeleton" style={{ height:14, width:'60%' }} />
          </div>
        </div>
      ))}
    </div>
  )

  if (!post) return null

  const ago = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14, fontSize:'.78rem', color:'var(--ink3)' }}>
        <button onClick={() => navigate('/')} style={{ background:'none',border:'none',color:'var(--ink3)',cursor:'pointer',padding:0 }}>Home</button>
        <span>›</span>
        <button onClick={() => navigate(`/k/${post.communities?.slug}`)} style={{ background:'none',border:'none',color:'var(--blue)',cursor:'pointer',padding:0, fontWeight:600 }}>
          {post.communities?.icon} k/{post.communities?.name}
        </button>
      </div>

      {/* Full post */}
      <div className="thread-post">
        <div style={{ display:'flex', gap:14 }}>
          {/* Vote */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
            <button className={`vote-btn ${voted ? 'voted' : ''}`} onClick={handleVote}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={voted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
            <span className={`vote-count ${voted ? 'voted' : ''}`} style={{ fontSize:'.78rem' }}>
              {post.vote_count ?? 0}
            </span>
          </div>

          {/* Body */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:'.72rem', color:'var(--ink3)' }}>
                Posted by <strong style={{ color:'var(--ink)' }}>u/{post.profiles?.username ?? 'anon'}</strong>
              </span>
              <span style={{ fontSize:'.68rem', color:'var(--ink3)', fontFamily:'var(--font-mono)' }}>{ago}</span>
            </div>

            <h1 className="thread-title">{post.title}</h1>

            {post.content && (
              <div className="thread-content">{post.content}</div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:12 }}>
              <button className="post-action-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {post.comment_count ?? 0} Comments
              </button>
              <button
                className="post-action-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href)
                  toast('Link copied!')
                }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment composer */}
      <div className="comment-box">
        {user ? (
          <>
            <textarea
              className="comment-input"
              placeholder="What are your thoughts?"
              value={commentTxt}
              onChange={e => setCommentTxt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.ctrlKey) handleComment()
              }}
            />
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <span style={{ fontSize:'.72rem', color:'var(--ink3)', alignSelf:'center' }}>Ctrl+Enter to post</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleComment}
                disabled={submitting || !commentTxt.trim()}
              >
                {submitting
                  ? <span className="spinner" style={{ width:14, height:14, margin:0 }} />
                  : 'Comment'
                }
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <span style={{ fontSize:'.84rem', color:'var(--ink3)' }}>
              <button onClick={() => setShowAuth(true)} style={{ background:'none', border:'none', color:'var(--blue)', cursor:'pointer', fontWeight:600, fontSize:'inherit' }}>
                Sign in
              </button>
              {' '}to leave a comment
            </span>
          </div>
        )}
      </div>

      {/* Comments — Nairaland style chronological */}
      {comments.length > 0 ? (
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r3)', padding:'0 16px' }}>
          <div style={{ padding:'12px 0 4px', fontSize:'.8rem', fontWeight:600, color:'var(--ink3)', borderBottom:'1px solid var(--border2)', marginBottom:4 }}>
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </div>
          {comments.map(c => <CommentItem key={c.id} comment={c} />)}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'30px 0', color:'var(--ink3)', fontSize:'.84rem' }}>
          No comments yet — be the first!
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}

export function ThreadRightPanel() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    supabase.from('posts')
      .select('id, vote_count, comment_count, communities:community_id(name, slug, icon, description, member_count)')
      .eq('id', id).single()
      .then(({ data }) => { if (data) setPost(data) })
  }, [id])

  if (!post?.communities) return null
  const c = post.communities

  return (
    <div className="widget">
      <div className="widget-head">About k/{c.name}</div>
      <div className="widget-body">
        <p style={{ fontSize:'.82rem', color:'var(--ink2)', lineHeight:1.6, marginBottom:12 }}>
          {c.description || 'A community for discussion.'}
        </p>
        <div style={{ display:'flex', gap:16, marginBottom:12 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700, color:'var(--ink)' }}>{post.vote_count}</div>
            <div style={{ fontSize:'.65rem', color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1 }}>Upvotes</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700, color:'var(--ink)' }}>{post.comment_count}</div>
            <div style={{ fontSize:'.65rem', color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1 }}>Comments</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700, color:'var(--ink)' }}>{c.member_count?.toLocaleString()}</div>
            <div style={{ fontSize:'.65rem', color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1 }}>Members</div>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          style={{ width:'100%', justifyContent:'center' }}
          onClick={() => navigate(`/k/${c.slug}`)}
        >
          View k/{c.name}
        </button>
      </div>
    </div>
  )
}
