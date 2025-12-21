import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  // Extract headings from markdown content using useMemo instead of useEffect
  const headings = useMemo(() => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const matches: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s\u0E00-\u0E7F-]/g, "") // Keep alphanumeric, spaces, Thai characters, and hyphens
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

      matches.push({ id, text, level });
    }

    return matches;
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  // Update URL hash when scrolling (without triggering scroll)
  useEffect(() => {
    if (activeId) {
      // Only update if different from current hash
      const currentHash = decodeURIComponent(window.location.hash.slice(1));
      if (currentHash !== activeId) {
        window.history.replaceState(null, "", `#${activeId}`);
      }
    }
  }, [activeId]);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    // Update URL hash
    window.history.pushState(null, "", `#${id}`);

    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const scrollPosition = Math.max(0, elementTop - offset);
      window.scrollTo({ top: scrollPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-2 mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <List className="h-3.5 w-3.5" />
        Contents
      </div>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => handleClick(heading.id)}
            className={cn(
              "block w-full text-left text-sm py-1.5 transition-colors duration-200 rounded",
              heading.level === 3 ? "pl-3" : "pl-0",
              activeId === heading.id ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"
            )}>
            <span className="line-clamp-2">{heading.text}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
