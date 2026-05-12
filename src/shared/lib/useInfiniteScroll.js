import { useEffect, useRef } from 'react';

function useInfiniteScroll(onLoadMore, hasMore, loading) {
    const sentinelRef = useRef(null);
    const onLoadMoreRef = useRef(onLoadMore);
    const loadingRef = useRef(loading);
    const hasMoreRef = useRef(hasMore);

    useEffect(() => { onLoadMoreRef.current = onLoadMore; }, [onLoadMore]);
    useEffect(() => { loadingRef.current = loading; }, [loading]);
    useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
                    onLoadMoreRef.current();
                }
            },
            { rootMargin: '0px 0px 200px 0px', threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return sentinelRef;
}

export default useInfiniteScroll;