import { useState, useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions<T> {
  items: T[];
  itemsPerPage?: number;
  threshold?: number;
}

export function useInfiniteScroll<T>({ items, itemsPerPage = 4, threshold = 100 }: UseInfiniteScrollOptions<T>) {
  // Lazily initialize displayed items to avoid calling setState synchronously in an effect
  const [displayedItems, setDisplayedItems] = useState<T[]>(() => items.slice(0, itemsPerPage));
  const [hasMore, setHasMore] = useState(() => items.length > itemsPerPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // When `items` or `itemsPerPage` change after mount, update state using an effect but avoid synchronous setState during render
  useEffect(() => {
    // Use a microtask so we don't synchronously set state during render and cause cascading updates
    const id = setTimeout(() => {
      setDisplayedItems(items.slice(0, itemsPerPage));
      setHasMore(items.length > itemsPerPage);
    }, 0);

    return () => clearTimeout(id);
  }, [items, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate network delay for smooth UX
    setTimeout(() => {
      const currentLength = displayedItems.length;
      const nextItems = items.slice(currentLength, currentLength + itemsPerPage);

      if (nextItems.length > 0) {
        setDisplayedItems((prev) => [...prev, ...nextItems]);
        setHasMore(currentLength + nextItems.length < items.length);
      } else {
        setHasMore(false);
      }

      setIsLoadingMore(false);
    }, 500);
  }, [displayedItems.length, hasMore, isLoadingMore, items, itemsPerPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0, rootMargin: `${threshold}px` }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoadingMore, loadMore, threshold]);

  return {
    displayedItems,
    hasMore,
    isLoadingMore,
    loaderRef,
    loadMore,
  };
}
