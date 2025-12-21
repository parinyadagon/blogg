import { Github, Twitter, Rss } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background w-full">
      <div className="container flex h-14 items-center justify-between max-w-5xl mx-auto px-4">
        {/* Logo & Copyright */}
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <span className="text-xs font-bold">T</span>
          </div>
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} TechBlog</span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
        </nav>

        {/* Social */}
        <div className="flex items-center gap-2">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Github className="h-4 w-4" />
          </a>
          <a href="/rss" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Rss className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
