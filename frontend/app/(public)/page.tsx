"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

import { categories, type Post } from "@/data/posts";
import { PostCard } from "@/components/blog/post-card";
import { SidebarFilter } from "@/components/blog/sidebar-filter";
import { SearchBar } from "@/components/blog/search-bar";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { PostCardSkeletonList } from "@/components/blog/post-card-skeleton";
import { InfiniteScrollLoader } from "@/components/blog/infinite-scroll-loader";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { PullToRefreshIndicator } from "@/components/blog/pull-to-refresh-indicator";
import { PostLayout } from "@/components/layout/post-layout";
import { toast } from "sonner";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/posts");
      const result = await response.json();

      if (result.success && result.data) {
        setPosts(result.data);
      } else {
        toast.error("ไม่สามารถโหลดบทความได้", {
          description: result.message || "กรุณาลองใหม่อีกครั้ง",
        });
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      });
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Count posts per category
  const categoryItems = useMemo(() => {
    return categories.map((cat) => ({
      id: cat,
      label: cat === "All" ? "all" : cat.toLowerCase(),
      count: cat === "All" ? posts.length : posts.filter((a) => a.category === cat).length,
    }));
  }, [posts]);

  // Filter posts
  const filteredArticles = useMemo(() => {
    return posts.filter((article) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      if (selectedCategory !== "All" && article.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [posts, searchQuery, selectedCategory]);

  // Infinite scroll
  const { displayedItems, hasMore, isLoadingMore, loaderRef } = useInfiniteScroll<Post>({
    items: filteredArticles,
    itemsPerPage: 3,
  });

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    await fetchPosts();
  }, [fetchPosts]);

  const { containerRef, pullDistance, isRefreshing, progress, shouldRefresh } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  return (
    <>
      <div ref={containerRef}>
        {/* Pull to Refresh Indicator - Mobile only */}
        <div className="lg:hidden">
          <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} progress={progress} shouldRefresh={shouldRefresh} />
        </div>

        {/* Mobile: Category filter horizontal scroll */}
        <div className="lg:hidden mb-6 px-4 overflow-x-auto scrollbar-thin">
          <div className="flex gap-2 pb-2">
            {categoryItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedCategory(item.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === item.id ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}>
                {item.label} ({item.count})
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Category Filter */}
              <SidebarFilter items={categoryItems} selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 ">
            {/* Search */}
            <div className="mb-6 sm:mb-8">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search posts..." />
            </div>

            {/* Post Content */}
            {isLoading ? (
              <PostCardSkeletonList count={4} />
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-foreground mb-2">No posts found</h3>
                <p className="text-muted-foreground text-sm">Try a different search or category</p>
              </div>
            ) : (
              <>
                {searchQuery ? (
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    {filteredArticles.length} results for &quot;{searchQuery}&quot;
                  </h2>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6 xl:max-w-2xl ">
                  {displayedItems.map((post, index) => (
                    <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${(index % 3) * 100}ms` }}>
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Loader */}
                <InfiniteScrollLoader ref={loaderRef} isLoading={isLoadingMore} hasMore={hasMore} />
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
