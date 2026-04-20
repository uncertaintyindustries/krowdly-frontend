import { useEffect, useRef } from 'react'

export function useInfiniteScroll(loadMore, enabled = true) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, enabled])

  return sentinelRef
}
