"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye } from "lucide-react";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Code, Heading1, Heading2, Heading3, Quote, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WordCountDisplay } from "./word-count-display";
import { MarkdownPreview } from "./markdown-preview";

interface ContentEditorProps {
  initialValue: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const ContentEditorComponent: React.FC<ContentEditorProps> = ({ initialValue, error, onChange, onBlur }) => {
  const [localContent, setLocalContent] = useState(initialValue);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced sync with parent form (300ms delay)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (localContent !== initialValue) {
        onChange(localContent);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localContent, initialValue, onChange]);

  const handleLocalChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  }, []);

  const insertMarkdown = (syntax: string, wrap?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end);

    let newText: string;
    let cursorOffset: number;

    if (wrap) {
      newText = localContent.substring(0, start) + wrap + selectedText + wrap + localContent.substring(end);
      cursorOffset = start + wrap.length + selectedText.length;
    } else {
      newText = localContent.substring(0, start) + syntax + localContent.substring(end);
      cursorOffset = start + syntax.length;
    }

    setLocalContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorOffset, cursorOffset);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Heading1, label: "H1", syntax: "# ", wrap: undefined },
    { icon: Heading2, label: "H2", syntax: "## ", wrap: undefined },
    { icon: Heading3, label: "H3", syntax: "### ", wrap: undefined },
    { icon: Bold, label: "Bold", syntax: "**", wrap: "**" },
    { icon: Italic, label: "Italic", syntax: "*", wrap: "*" },
    { icon: List, label: "Bullet List", syntax: "- ", wrap: undefined },
    { icon: ListOrdered, label: "Numbered List", syntax: "1. ", wrap: undefined },
    { icon: LinkIcon, label: "Link", syntax: "[text](url)", wrap: undefined },
    { icon: ImageIcon, label: "Image", syntax: "![alt](url)", wrap: undefined },
    { icon: Code, label: "Code", syntax: "```\n", wrap: "\n```" },
    { icon: Quote, label: "Quote", syntax: "> ", wrap: undefined },
  ];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
        <div className="flex items-center justify-between border-b border-border px-2 sm:px-4">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger
              value="write"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-3 sm:px-4 py-2 sm:py-3 text-sm">
              เขียน
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-3 sm:px-4 py-2 sm:py-3 text-sm">
              <Eye className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">ตัวอย่าง</span>
              <span className="sm:hidden">Preview</span>
            </TabsTrigger>
          </TabsList>
          {/* Word count */}
          <WordCountDisplay content={localContent} className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground" />
        </div>

        <TabsContent value="write" className="m-0">
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 border-b border-border overflow-x-auto bg-muted/30">
            {toolbarButtons.map((btn, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => insertMarkdown(btn.syntax, btn.wrap)}
                className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 hover:bg-accent/20 hover:text-accent"
                title={btn.label}>
                <btn.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            ))}
          </div>

          {/* Editor */}
          <Textarea
            ref={textareaRef}
            id="content-editor"
            placeholder="เขียนเนื้อหาบทความด้วย Markdown..."
            value={localContent}
            onChange={handleLocalChange}
            onBlur={onBlur}
            className={cn(
              "min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-xs sm:text-sm p-3 sm:p-4",
              error && "border-red-500"
            )}
          />
          {error && <p className="text-sm text-red-500 mt-1 px-3 pb-2">{error}</p>}

          {/* Mobile word count */}
          <WordCountDisplay
            content={localContent}
            className="sm:hidden flex items-center gap-3 text-xs text-muted-foreground p-2 border-t border-border bg-muted/30"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div className="p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] max-h-[600px] overflow-y-auto prose prose-sm sm:prose max-w-none">
            <MarkdownPreview content={localContent} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const ContentEditor = memo(ContentEditorComponent);
