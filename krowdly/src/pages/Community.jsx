import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PostFeed from '../components/PostFeed'
import { CommunityWidget } from '../components/Widgets'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../components/Toast'

export default function CommunityPage() {
  const { slug }    = useParams()
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const toast       = useToast()

  const [community, setCommunity] = useState(null)
  const [isMember,  setIsMember]  = useState(false)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/404'); return }
        setCommunity(data)
        setLoading(false)
      })
  }, [slug, navigate])

  useEffect(() => {
    if (!user || !community) { setIsMember(false); return }
    supabase
      .from('community_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('community_id', community.id)
      .maybeSingle()
      .then(({ data }) => setIsMember(!!data))
  }, [user, community])

  const toggleJoin = async () => {
    if (!user) { toast('Sign in to join communities', 'error'); return }
    if (isMember) {
      await supabase
        .from('community_members')
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', community.id)
      await supabase
        .from('communities')
        .update({ member_count: Math.max((community.member_count || 1) - 1, 0) })
        .eq('id', community.id)
      setCommunity(c => ({ ...c, member_count: Math.max((c.member_count || 1) - 1, 0) }))
      setIsMember(false)
      toast('Left community')
    } else {
      await supabase
        .from('community_members')
        .insert({ user_id: user.id, community_id: community.id })
      await supabase
        .from('communities')
        .update({ member_count: (community.member_count || 0) + 1 })
        .eq('id', community.id)
      setCommunity(c => ({ ...c, member_count: (c.member_count || 0) + 1 }))
      setIsMember(true)
      toast(`Joined k/${community.name}! 🎉`)
    }
  }

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: 120, borderRadius: 'var(--r3)', marginBottom: 16 }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ marginBottom: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 11, width: 80 }} />
            <div className="skeleton" style={{ height: 18, width: '80%' }} />
            <div className="skeleton" style={{ height: 11, width: '55%' }} />
          </div>
        </div>
      ))}
    </div>
  )

  if (!community) return null

  return (
    <div>
      {/* Community header */}
      <div className="community-header">
        <div
          className="community-header-banner"
          style={{ background: `linear-gradient(135deg, #1a2744 0%, #0d1830 100%)` }}
        />
        <div className="community-header-body">
          <div>
            <div className="community-icon-large">{community.icon}</div>
          </div>
          <div className="community-header-info">
            <div className="community-name">k/{community.name}</div>
            <div className="community-desc">{community.description}</div>
            <div style={{ marginTop: 6, fontSize: '.74rem', color: 'var(--ink3)' }}>
              {community.member_count?.toLocaleString() ?? 0} members
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              className={`btn ${isMember ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              onClick={toggleJoin}
            >
              {isMember ? '✓ Joined' : '+ Join'}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/submit', { state: { communityId: community.id, communitySlug: slug } })}
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <PostFeed communityId={community.id} />
    </div>
  )
}

export function CommunityRightPanel() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [community, setCommunity] = useState(null)
  const [isMember,  setIsMember]  = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!slug) return
    supabase.from('communities').select('*').eq('slug', slug).single()
      .then(({ data }) => { if (data) setCommunity(data) })
  }, [slug])

  useEffect(() => {
    if (!user || !community) return
    supabase.from('community_members').select('id')
      .eq('user_id', user.id).eq('community_id', community.id).maybeSingle()
      .then(({ data }) => setIsMember(!!data))
  }, [user, community])

  const toggleJoin = async () => {
    if (!user || !community) return
    if (isMember) {
      await supabase.from('community_members').delete()
        .eq('user_id', user.id).eq('community_id', community.id)
      setIsMember(false)
      toast('Left community')
    } else {
      await supabase.from('community_members')
        .insert({ user_id: user.id, community_id: community.id })
      setIsMember(true)
      toast(`Joined k/${community.name}! 🎉`)
    }
  }

  return <CommunityWidget community={community} isMember={isMember} onJoin={toggleJoin} />
}
