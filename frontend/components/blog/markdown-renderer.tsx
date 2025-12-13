import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ language, children }: { language: string; children: string }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <div className="absolute top-3 right-3 z-10">
        <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 backdrop-blur hover:bg-background/80" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      {language && <div className="absolute top-3 left-4 text-xs font-mono text-muted-foreground/70">{language}</div>}
      <SyntaxHighlighter
        language={language || "text"}
        style={theme === "dark" ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: "0.75rem",
          padding: "2.5rem 1.5rem 1.5rem",
          fontSize: "0.875rem",
        }}
        showLineNumbers={children.split("\n").length > 3}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "1em",
          color: theme === "dark" ? "#666" : "#999",
        }}>
        {children.trim()}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\sก-๙]/g, "")
              .replace(/\s+/g, "-");
            return (
              <h1 id={id} className="scroll-mt-24">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\sก-๙]/g, "")
              .replace(/\s+/g, "-");
            return (
              <h2 id={id} className="scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\sก-๙]/g, "")
              .replace(/\s+/g, "-");
            return (
              <h3 id={id} className="scroll-mt-24">
                {children}
              </h3>
            );
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !className;

            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return <CodeBlock language={match?.[1] || ""}>{String(children)}</CodeBlock>;
          },
          pre({ children }) {
            return <>{children}</>;
          },
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blog-link hover:text-blog-link-hover">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <Image src={(src as string) || ""} alt={alt || ""} width={0} height={0} sizes="100vw" className="rounded-xl shadow-md w-full h-auto" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent pl-6 text-blog-text-secondary not-italic">{children}</blockquote>
          ),
        }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
