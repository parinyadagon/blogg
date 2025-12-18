import { Post } from "@/data/posts";
import { PostCard } from "./post-card";

interface RelatedPostsProps {
  posts: Post[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-8">บทความที่เกี่ยวข้อง</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {posts.slice(0, 3).map((article) => (
          <PostCard key={article.id} post={article} />
        ))}
      </div>
    </section>
  );
}
