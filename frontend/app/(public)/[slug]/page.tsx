"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";

import { type Post } from "@/data/posts";
import { Clock, Calendar, ArrowLeft, Heart, PanelLeftClose, PanelRightClose, Loader2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { RelatedPosts } from "@/components/blog/relate-posts";
import { toast } from "sonner";

const PostPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [tocOnRight, setTocOnRight] = useState(false);

  // Hash-based scroll restoration
  useEffect(() => {
    if (!post) return; // Wait for post to be loaded

    const handleHashScroll = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));

      if (hash) {
        // Wait for content to render
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            const offset = 250;
            const elementTop = element.getBoundingClientRect().top + window.scrollY;
            const scrollPosition = Math.max(0, elementTop - offset);
            window.scrollTo({ top: scrollPosition, behavior: "smooth" });
          }
        }, 500);
      } else {
        // No hash, scroll to top
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };

    // Handle initial load and hash changes
    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);

    return () => {
      window.removeEventListener("hashchange", handleHashScroll);
    };
  }, [post]);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${slug}`);
        const result = await response.json();

        if (result.success && result.data) {
          setPost(result.data);

          // Fetch related posts (you might want to add a separate API endpoint for this)
          const relatedResponse = await fetch(`/api/posts`);
          const relatedResult = await relatedResponse.json();

          if (relatedResult.success && relatedResult.data) {
            const related = relatedResult.data.filter(
              (p: Post) =>
                p.id !== result.data.id && (p.category === result.data.category || p.tags.some((tag: string) => result.data.tags.includes(tag)))
            );
            setRelatedPosts(related.slice(0, 3));
          }
        } else {
          setNotFoundError(true);
          toast.error("ไม่พบบทความ");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("เกิดข้อผิดพลาด", {
          description: "ไม่สามารถโหลดบทความได้",
        });
        setNotFoundError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Show not found
  if (notFoundError) {
    notFound();
  }

  // Show loading state
  if (isLoading || !post) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">กำลังโหลดบทความ...</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Back Link & Layout Toggle */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to posts</span>
          <span className="sm:hidden">Back</span>
        </Link>

        {/* Layout Toggle */}
        <div className="hidden lg:flex items-center gap-2">
          <PanelLeftClose className={`h-4 w-4 transition-colors ${!tocOnRight ? "text-accent" : "text-muted-foreground"}`} />
          <Switch checked={tocOnRight} onCheckedChange={setTocOnRight} aria-label="Toggle layout" />
          <PanelRightClose className={`h-4 w-4 transition-colors ${tocOnRight ? "text-accent" : "text-muted-foreground"}`} />
        </div>
      </div>

      <div className={`flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 ${tocOnRight ? "" : "lg:flex-row-reverse"}`}>
        {/* Sidebar - Author & TOC */}
        <aside className={`lg:w-56 shrink-0 ${tocOnRight ? "order-2" : "order-2 lg:order-1"}`}>
          <div className="lg:sticky lg:top-20 space-y-4 sm:space-y-6">
            {/* Author */}
            {/* <div className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-card">
              <img src={post.author.avatar} alt={post.author.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-background" />
              <div>
                <div className="font-medium text-foreground text-sm">{post.author.name}</div>
                <div className="text-xs text-muted-foreground">Author</div>
              </div>
            </div> */}

            {/* Table of Contents */}
            <TableOfContents content={post.content} />
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 min-w-0 ${tocOnRight ? "order-1" : "order-1 lg:order-2"}`}>
          {/* Hero Image */}
          {post.coverImage && (
            <div className="relative aspect-video sm:aspect-2/1 rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 bg-muted">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Article Meta */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              <span>{post.readingTime} min read</span>
            </div>
            <span className="text-muted-foreground/30">•</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight mb-3 sm:mb-4">{post.title}</h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
              {post.category}
            </span>
            {/* {post.tags.map((tag) => (
              <span key={tag} className="px-2.5 sm:px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                {tag}
              </span>
            ))} */}
          </div>

          {/* Content */}
          <article className="bg-card rounded-xl sm:rounded-2xl shadow-card p-4 sm:p-6 md:p-8">
            <MarkdownRenderer content={post.content} />

            {/* Footer Actions */}
            <div className="mt-10 pt-6 border-t border-border flex items-center justify-between flex-wrap gap-4">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Like</span>
              </button>
              {/* <ShareButtons url={currentUrl} title={post.title} /> */}
            </div>
          </article>

          {/* Related Posts */}
          <RelatedPosts posts={relatedPosts} />
        </main>
      </div>
    </div>
  );
};

export default PostPage;
