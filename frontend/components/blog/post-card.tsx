import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Post } from "@/data/posts";
import { useEffect, useRef, useState } from "react";

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export function PostCard({ post, featured }: PostCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      ref={cardRef}
      href={`/${post.slug}`}
      className={`group block bg-card rounded-2xl border border-border/50 overflow-hidden 
        card-shine card-glow
        hover:border-accent/30 hover:-translate-y-1.5
        transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Cover Image with overlay */}
      {post.coverImage ? (
        <div className="relative h-36 sm:h-44 overflow-hidden bg-muted">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover image-zoom" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-card via-card/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Category badge on image */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
            <span className="text-[10px] sm:text-[11px] font-semibold text-accent-foreground bg-accent/90 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg">
              {post.category}
            </span>
          </div>
        </div>
      ) : (
        // Design for posts without cover image - show excerpt content
        <div className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-accent/5 to-muted/20">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-accent/5 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-accent/8 blur-2xl group-hover:scale-110 transition-transform duration-700" />

          {/* Content container */}
          <div className="relative p-5 sm:p-6">
            {/* Top: Category badge and date */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-accent-foreground bg-accent/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground/70 font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 opacity-60" />
                {formattedDate}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug line-clamp-2 mb-3 group-hover:text-accent transition-colors duration-300">
              {post.title}
            </h3>

            {/* Excerpt content */}
            <p className="text-sm sm:text-base text-muted-foreground/90 leading-relaxed line-clamp-3 group-hover:text-muted-foreground transition-colors duration-300">
              {post.excerpt}
            </p>
          </div>

          {/* Decorative accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 group-hover:via-accent/50 transition-all duration-500" />
        </div>
      )}

      {/* Content */}
      <div className={post.coverImage ? "p-4 sm:p-5" : "px-5 sm:px-6 pb-5 sm:pb-6 pt-3 sm:pt-4"}>
        {post.coverImage ? (
          <>
            {/* Meta info */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-sm">
                {post.category}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 opacity-70" />
                {formattedDate}
              </span>
            </div>

            {/* Title with animated underline */}
            <h3 className="relative text-base font-semibold text-foreground leading-snug line-clamp-2 mb-2.5 group-hover:text-accent transition-colors duration-300">
              {post.title}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent/50 group-hover:w-full transition-all duration-500 ease-out" />
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 group-hover:text-muted-foreground/80 transition-colors duration-300">
              {post.excerpt}
            </p>
          </>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 group-hover:border-accent/20 transition-colors duration-300">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 opacity-60" />
            <span>{post.readingTime} min read</span>
          </div>

          {/* Animated read more button */}
          <span className="flex items-center gap-1.5 text-xs font-medium text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
            Read more
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
