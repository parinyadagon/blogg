"use client";

import React, { memo } from "react";
import { Sparkles } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview = memo<MarkdownPreviewProps>(({ content }) => {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Sparkles className="w-12 h-12 mb-4 opacity-30" />
        <p className="italic">ยังไม่มีเนื้อหา...</p>
      </div>
    );
  }

  return <MarkdownRenderer content={content} />;
});

MarkdownPreview.displayName = "MarkdownPreview";
