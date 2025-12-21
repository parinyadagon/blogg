"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";

// import { ShareButtons } from "@/components/blog/ShareButtons";

import { posts } from "@/data/posts";
import { Clock, Calendar, ArrowLeft, Heart, PanelLeftClose, PanelRightClose } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { RelatedPosts } from "@/components/blog/relate-posts";

const PostPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const post = posts.find((a) => a.slug === slug);
  const [tocOnRight, setTocOnRight] = useState(false);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const relatedPosts = posts.filter((a) => a.id !== post.id && (a.category === post.category || a.tags.some((tag) => post.tags.includes(tag))));

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

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
            <div className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-card">
              <img src={post.author.avatar} alt={post.author.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-background" />
              <div>
                <div className="font-medium text-foreground text-sm">{post.author.name}</div>
                <div className="text-xs text-muted-foreground">Author</div>
              </div>
            </div>

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
            {post.tags.map((tag) => (
              <span key={tag} className="px-2.5 sm:px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
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
