"use client";

import React, { useMemo, memo } from "react";

interface WordCountDisplayProps {
  content: string;
  className?: string;
}

const WordCountDisplayComponent: React.FC<WordCountDisplayProps> = ({ content, className }) => {
  const stats = useMemo(() => {
    const words = content.split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    return { words, chars };
  }, [content]);

  return (
    <div className={className}>
      <span>{stats.words} คำ</span>
      <span>{stats.chars} ตัวอักษร</span>
    </div>
  );
};

export const WordCountDisplay = memo(WordCountDisplayComponent);
