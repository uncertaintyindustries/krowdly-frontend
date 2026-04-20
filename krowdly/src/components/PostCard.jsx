import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../lib/AuthContext'

export default function PostCard({ post, onVote, voted, onAuthRequired }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleVote = e => {
    e.stopPropagation()
    if (!user) { onAuthRequired?.(); return }
    onVote(post.id)
  }

  const goToThread = () => navigate(`/post/${post.id}`)
  const goToComm   = e => { e.stopPropagation(); navigate(`/k/${post.communities?.slug}`) }

  const ago = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : ''

  return (
    <div className="post-card" onClick={goToThread} role="article">
      {/* Vote column */}
      <div className="post-vote-col" onClick={e => e.stopPropagation()}>
        <button className={`vote-btn ${voted ? 'voted' : ''}`} onClick={handleVote} title="Upvote">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={voted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <span className={`vote-count ${voted ? 'voted' : ''}`}>{post.vote_count ?? 0}</span>
      </div>

      {/* Body */}
      <div className="post-body">
        <div className="post-meta">
          <button className="community-badge" onClick={goToComm}>
            {post.communities?.icon} k/{post.communities?.name}
          </button>
          <span className="post-author">u/{post.profiles?.username ?? 'anon'}</span>
          <span className="post-time">{ago}</span>
        </div>

        <div className="post-title">{post.title}</div>

        {post.content && (
          <div className="post-preview">{post.content}</div>
        )}

        <div className="post-actions">
          <button className="post-action-btn" onClick={goToThread}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {post.comment_count ?? 0} Comments
          </button>
          <button
            className="post-action-btn"
            onClick={e => {
              e.stopPropagation()
              navigator.clipboard?.writeText(window.location.origin + '/post/' + post.id)
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
