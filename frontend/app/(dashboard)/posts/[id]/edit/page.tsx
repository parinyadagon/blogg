"use client";

import { ArticleEditor } from "@/components/blog/article-editor";
import { use } from "react";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = use(params);

  return <ArticleEditor postId={postId} />;
}
