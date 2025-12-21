import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// import { CodeBlock } from "./code-block";
import dynamic from "next/dynamic";
import { CodeSkeleton } from "./code-skeleton";

const CodeBlock = dynamic(() => import("./code-block").then((mod) => mod.CodeBlock), {
  ssr: false,
  loading: () => <CodeSkeleton />,
});

interface MarkdownRendererProps {
  content: string;
}

/* function CodeBlock({ language, children }: { language: string; children: string }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const syntaxStyle = mounted && theme === "dark" ? oneDark : oneLight;

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
        style={syntaxStyle}
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
          color: mounted && theme === "dark" ? "#666" : "#999",
        }}>
        {children.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\sก-๙]/g, "")
              .replace(/\s+/g, "-");
            return (
              <h1 id={id} className="scroll-mt-24 text-4xl font-bold mb-4 mt-8 text-foreground">
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
              <h2 id={id} className="scroll-mt-24 text-3xl font-bold mb-3 mt-6 text-foreground">
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
              <h3 id={id} className="scroll-mt-24 text-2xl font-semibold mb-2 mt-5 text-foreground">
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
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {children}
            </a>
          ),
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={src} alt={alt} className="rounded-xl shadow-md w-full my-6" loading="lazy" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent pl-6 py-2 my-4 text-muted-foreground bg-muted/30 rounded-r-lg">{children}</blockquote>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-base leading-7">{children}</li>,
          p: ({ children }) => <p className="text-base leading-7">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
