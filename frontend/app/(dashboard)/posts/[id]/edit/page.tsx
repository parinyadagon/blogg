"use client";

import { PostEditor } from "@/components/blog/post-editor";
import { use } from "react";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = use(params);

  return <PostEditor postId={postId} />;
}
