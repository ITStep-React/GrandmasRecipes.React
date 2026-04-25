import { useEffect, useRef } from 'react';

/**
 * Хук для бесконечного скролла через IntersectionObserver.
 *
 * @param {Function} onLoadMore  — колбэк, вызывается когда sentinel попадает в viewport
 * @param {boolean}  hasMore     — есть ли ещё данные для загрузки
 * @param {boolean}  loading     — идёт ли прямо сейчас загрузка
 * @returns {React.RefObject}    — ref, который нужно повесить на sentinel-элемент
 *
 * Использование:
 *   const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);
 *   ...
 *   <div ref={sentinelRef} />
 */
function useInfiniteScroll(onLoadMore, hasMore, loading) {
    const sentinelRef = useRef(null);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    onLoadMore();
                }
            },
            // Начинаем грузить чуть раньше — за 200px до края экрана
            { rootMargin: '0px 0px 200px 0px', threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [onLoadMore, hasMore, loading]);

    return sentinelRef;
}

export default useInfiniteScroll;
