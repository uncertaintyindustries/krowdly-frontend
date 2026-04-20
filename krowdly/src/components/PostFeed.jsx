import { useState } from 'react'
import PostCard from './PostCard'
import { usePosts } from '../hooks/usePosts'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import AuthModal from './AuthModal'

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div className="skeleton" style={{ height: 11, width: 90 }} />
        <div className="skeleton" style={{ height: 18, width: '85%' }} />
        <div className="skeleton" style={{ height: 12, width: '60%' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="skeleton" style={{ height: 26, width: 80, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 26, width: 60, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  )
}

export default function PostFeed({ communityId = null, initialSort = 'new' }) {
  const [sort, setSort] = useState(initialSort)
  const [showAuth, setShowAuth] = useState(false)

  const { posts, loading, loadingMore, hasMore, loadMore, toggleVote, userVotes } =
    usePosts({ communityId, sort })

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loadingMore)

  return (
    <>
      {/* Sort bar */}
      <div className="sort-bar">
        <span style={{ fontSize: '.76rem', color: 'var(--ink3)', fontWeight: 600, marginRight: 4 }}>SORT</span>
        {[
          { key: 'new', label: 'New', icon: '✨' },
          { key: 'top', label: 'Top', icon: '🔥' },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            className={`sort-btn ${sort === key ? 'active' : ''}`}
            onClick={() => setSort(key)}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))
      ) : posts.length === 0 ? (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--r3)', padding: '40px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
          <div style={{ color: 'var(--ink2)', fontWeight: 600, marginBottom: 4 }}>No posts yet</div>
          <div style={{ color: 'var(--ink3)', fontSize: '.82rem' }}>Be the first to post!</div>
        </div>
      ) : (
        <>
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              voted={userVotes.has(post.id)}
              onVote={toggleVote}
              onAuthRequired={() => setShowAuth(true)}
              style={{ animationDelay: `${i * 30}ms` }}
            />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="sentinel" />

          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '14px 0' }}>
              <div className="spinner" />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--ink3)', fontSize: '.78rem' }}>
              ✦ You've reached the end ✦
            </div>
          )}
        </>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
