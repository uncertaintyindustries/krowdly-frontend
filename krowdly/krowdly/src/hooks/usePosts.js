import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const PAGE_SIZE = 15

export function usePosts({ communityId = null, sort = 'new' }) {
  const { user } = useAuth()
  const [posts,      setPosts]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [loadingMore,setLoadingMore] = useState(false)
  const [hasMore,    setHasMore]    = useState(true)
  const [userVotes,  setUserVotes]  = useState(new Set())
  const pageRef    = useRef(0)
  const sortRef    = useRef(sort)
  const communityRef = useRef(communityId)

  // Fetch user's existing votes for optimistic UI
  useEffect(() => {
    if (!user) return
    supabase
      .from('votes')
      .select('post_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setUserVotes(new Set(data.map(v => v.post_id)))
      })
  }, [user])

  const buildQuery = useCallback((from, to) => {
    let q = supabase
      .from('posts')
      .select(`
        id, title, content, vote_count, comment_count, created_at,
        profiles:user_id ( id, username, avatar_url ),
        communities:community_id ( id, name, slug, icon )
      `)
      .range(from, to)

    if (communityId) q = q.eq('community_id', communityId)
    if (sort === 'top') q = q.order('vote_count', { ascending: false }).order('created_at', { ascending: false })
    else                q = q.order('created_at', { ascending: false })

    return q
  }, [communityId, sort])

  const fetchPage = useCallback(async (page, replace = false) => {
    const from = page * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1
    const { data, error } = await buildQuery(from, to)
    if (error) { console.error(error); return }
    const incoming = data ?? []
    if (replace) setPosts(incoming)
    else         setPosts(prev => {
      const ids = new Set(prev.map(p => p.id))
      return [...prev, ...incoming.filter(p => !ids.has(p.id))]
    })
    setHasMore(incoming.length === PAGE_SIZE)
  }, [buildQuery])

  // Reset and reload when sort/community changes
  useEffect(() => {
    if (sort !== sortRef.current || communityId !== communityRef.current) {
      sortRef.current      = sort
      communityRef.current = communityId
      pageRef.current      = 0
      setHasMore(true)
    }
    setPosts([])
    pageRef.current = 0
    setLoading(true)
    fetchPage(0, true).finally(() => setLoading(false))
  }, [sort, communityId, fetchPage])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    pageRef.current++
    await fetchPage(pageRef.current)
    setLoadingMore(false)
  }, [loadingMore, hasMore, fetchPage])

  // Toggle vote with optimistic UI
  const toggleVote = useCallback(async (postId) => {
    if (!user) return false
    const hasVoted = userVotes.has(postId)

    // Optimistic update
    setUserVotes(prev => {
      const next = new Set(prev)
      hasVoted ? next.delete(postId) : next.add(postId)
      return next
    })
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, vote_count: p.vote_count + (hasVoted ? -1 : 1) }
        : p
    ))

    // Supabase mutation
    if (hasVoted) {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
      if (error) {
        // Rollback
        setUserVotes(prev => { const n = new Set(prev); n.add(postId); return n })
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, vote_count: p.vote_count + 1 } : p))
      }
    } else {
      const { error } = await supabase
        .from('votes')
        .insert({ user_id: user.id, post_id: postId })
      if (error) {
        // Rollback
        setUserVotes(prev => { const n = new Set(prev); n.delete(postId); return n })
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, vote_count: p.vote_count - 1 } : p))
      }
    }

    return true
  }, [user, userVotes])

  return { posts, loading, loadingMore, hasMore, loadMore, toggleVote, userVotes, refetch: () => {
    setPosts([]); pageRef.current = 0; setLoading(true)
    fetchPage(0, true).finally(() => setLoading(false))
  }}
}
