"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// ใช้ import path นี้ชัวร์กว่าใน Next.js environment
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CodeBlock({ language, children }: { language: string; children: string }) {
  const { resolvedTheme } = useTheme(); // เปลี่ยนจาก theme เป็น resolvedTheme เพื่อแก้ค่า 'system'
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

  // เลือก Style: ถ้ายังไม่ mount หรือเป็น Dark ให้ใช้ vscDarkPlus (สีสวยเหมือน VS Code)
  // ต้องเช็ค mounted เพื่อป้องกัน hydration mismatch ในวินาทีแรก (แม้จะใช้ dynamic loading ก็ตาม กันเหนียวไว้)
  const isDark = !mounted || resolvedTheme === "dark";
  const syntaxStyle = isDark ? vscDarkPlus : vs;

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-border/50">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 backdrop-blur-sm border-b border-border/50">
        <span className="text-xs font-mono text-muted-foreground lowercase">{language || "text"}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background/80" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>

      {/* Code Area */}
      <div className="relative">
        <SyntaxHighlighter
          language={language || "text"}
          style={syntaxStyle}
          PreTag="div" // ใช้ div แทน pre เพื่อเลี่ยงปัญหา prose ของ tailwind
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            fontSize: "0.875rem",
            lineHeight: "1.7",
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono)", // ใช้ Font Mono ของโปรเจกต์
            },
          }}
          showLineNumbers={true} // เปิดเลขบรรทัดดูว่าทำงานไหม
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: isDark ? "#666" : "#999",
            textAlign: "right",
          }}>
          {children.trim()}
        </SyntaxHighlighter>
      </div>

      {/* Background color layer (จัดการสีพื้นหลังแยกเองเพื่อความสวยงาม) */}
      <div className={`absolute inset-0 -z-10 ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`} />
    </div>
  );
}
