"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  Save,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Loader2,
  Upload,
  X,
  Clock,
  Check,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { articles, categories, allTags } from "@/data/posts";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";
import { ContentLayout } from "@/components/admin-panel/content-layout";

const ArticleEditor: React.FC = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  const article = id ? articles.find((a) => a.id === id) : undefined;
  const isEditing = !!article;
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const warnedHostRef = useRef<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Form state
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");
  const [category, setCategory] = useState(article?.category || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(article?.tags || []);
  const [featured, setFeatured] = useState(article?.featured || false);
  const [status, setStatus] = useState<"draft" | "published">(article ? "published" : "draft");

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!title.trim() || !isDirty) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLastSaved(new Date());
    setIsDirty(false);
    setIsSaving(false);
  }, [title, isDirty]);

  useEffect(() => {
    if (isDirty && title.trim()) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(autoSave, 3000);
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isDirty, title, autoSave]);

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\sก-๙]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsDirty(true);
    if (!isEditing || !slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    setIsDirty(true);
  };

  const insertMarkdown = (syntax: string, wrap?: string) => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText: string;
    let cursorOffset: number;

    if (wrap) {
      newText = content.substring(0, start) + wrap + selectedText + wrap + content.substring(end);
      cursorOffset = start + wrap.length + selectedText.length;
    } else {
      newText = content.substring(0, start) + syntax + content.substring(end);
      cursorOffset = start + syntax.length;
    }

    setContent(newText);
    setIsDirty(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorOffset, cursorOffset);
    }, 0);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ");
      return;
    }

    // Simulate upload - in real app, upload to server
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      setCoverImage(imageUrl);
      setIsDirty(true);
      toast.success("อัปโหลดรูปภาพสำเร็จ");
    };
    reader.readAsDataURL(file);
  };

  const toolbarButtons = [
    { icon: Heading1, label: "H1", action: () => insertMarkdown("# ") },
    { icon: Heading2, label: "H2", action: () => insertMarkdown("## ") },
    { icon: Heading3, label: "H3", action: () => insertMarkdown("### ") },
    { icon: Bold, label: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertMarkdown("*", "*") },
    { icon: List, label: "Bullet List", action: () => insertMarkdown("- ") },
    { icon: ListOrdered, label: "Numbered List", action: () => insertMarkdown("1. ") },
    { icon: LinkIcon, label: "Link", action: () => insertMarkdown("[text](url)") },
    { icon: ImageIcon, label: "Image", action: () => insertMarkdown("![alt](url)") },
    { icon: Code, label: "Code", action: () => insertMarkdown("```\n", "\n```") },
    { icon: Quote, label: "Quote", action: () => insertMarkdown("> ") },
  ];

  const handleSave = async (publishStatus: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("กรุณากรอกชื่อบทความ");
      return;
    }

    if (!content.trim()) {
      toast.error("กรุณากรอกเนื้อหาบทความ");
      return;
    }

    setIsSaving(true);
    setStatus(publishStatus);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success(publishStatus === "published" ? "เผยแพร่บทความสำเร็จ" : "บันทึกฉบับร่างสำเร็จ", {
      description: publishStatus === "published" ? "บทความของคุณถูกเผยแพร่แล้ว" : "บทความถูกบันทึกเป็นฉบับร่าง",
    });

    setIsSaving(false);
    setIsDirty(false);
    setLastSaved(new Date());

    if (publishStatus === "published") {
      router.push("/admin/articles");
    }
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <ContentLayout title="New Post">
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin/articles")} className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">{isEditing ? "แก้ไขบทความ" : "สร้างบทความใหม่"}</h1>
                  <Badge variant={status === "draft" ? "secondary" : "default"} className="shrink-0">
                    {status === "draft" ? "ฉบับร่าง" : "เผยแพร่แล้ว"}
                  </Badge>
                </div>
                {/* Auto-save status */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      <span>บันทึกล่าสุด {lastSaved.toLocaleTimeString("th-TH")}</span>
                    </>
                  ) : isDirty ? (
                    <>
                      <Clock className="w-3 h-3" />
                      <span>มีการเปลี่ยนแปลงที่ยังไม่บันทึก</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons - responsive */}
          <div className="flex items-center gap-2 sm:self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="flex-1 sm:flex-none cursor-pointer">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              <span className="hidden sm:inline">บันทึกฉบับร่าง</span>
              <span className="sm:hidden">บันทึก</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="flex-1 sm:flex-none bg-linear-to-r cursor-pointer">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              เผยแพร่
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Title & Slug */}
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  ชื่อบทความ *
                </Label>
                <Input
                  id="title"
                  placeholder="เช่น เริ่มต้นเขียน Golang สำหรับมือใหม่"
                  value={title}
                  onChange={handleTitleChange}
                  className="text-base sm:text-lg font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">/article/</span>
                  <Input
                    id="slug"
                    placeholder="getting-started-with-golang"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsDirty(true);
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">คำโปรย (Excerpt)</Label>
                <Textarea
                  id="excerpt"
                  placeholder="สรุปสั้นๆ เกี่ยวกับบทความนี้..."
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    setIsDirty(true);
                  }}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Content Editor */}
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
                  <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{wordCount} คำ</span>
                    <span>{charCount} ตัวอักษร</span>
                  </div>
                </div>

                <TabsContent value="write" className="m-0">
                  {/* Toolbar */}
                  <div className="flex items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 border-b border-border overflow-x-auto bg-muted/30">
                    {toolbarButtons.map((btn, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="icon"
                        onClick={btn.action}
                        className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 hover:bg-accent/20 hover:text-accent"
                        title={btn.label}>
                        <btn.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    ))}
                  </div>

                  {/* Editor */}
                  <Textarea
                    id="content-editor"
                    placeholder="เขียนเนื้อหาบทความด้วย Markdown..."
                    value={content}
                    onChange={handleContentChange}
                    className="min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-xs sm:text-sm p-3 sm:p-4"
                  />

                  {/* Mobile word count */}
                  <div className="sm:hidden flex items-center gap-3 text-xs text-muted-foreground p-2 border-t border-border bg-muted/30">
                    <span>{wordCount} คำ</span>
                    <span>{charCount} ตัวอักษร</span>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="m-0">
                  <div className="p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] max-h-[600px] overflow-y-auto prose prose-sm sm:prose max-w-none">
                    {content ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                        <p className="italic">ยังไม่มีเนื้อหา...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Cover Image with Drag & Drop */}
            <div
              className={cn(
                "bg-card rounded-xl border-2 border-dashed p-4 sm:p-6 space-y-3 transition-all",
                isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}>
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent" />
                รูปปก
              </Label>
              <div className="space-y-3">
                {coverImage ? (
                  <div className="relative group w-full h-32 sm:h-40">
                    <Image src={coverImage} alt="Cover preview" fill className="object-cover rounded-lg" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setCoverImage("");
                        setIsDirty(true);
                      }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center h-32 sm:h-40 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">ลากไฟล์มาวาง หรือคลิกเพื่ออัปโหลด</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
                <Input
                  placeholder="หรือใส่ URL ของรูปภาพ"
                  value={coverImage}
                  onChange={(e) => {
                    const url = e.target.value;
                    setCoverImage(url);
                    setIsDirty(true);

                    if (!url || url.startsWith("data:") || url.startsWith("blob:")) {
                      warnedHostRef.current = null;
                      return;
                    }

                    let hostname: string | null = null;
                    try {
                      hostname = new URL(url).hostname;
                    } catch {
                      hostname = null;
                    }

                    if (hostname && warnedHostRef.current !== hostname) {
                      warnedHostRef.current = hostname;
                      toast("Image host not configured in next.config.js — preview will use a standard <img>");
                    }
                  }}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  หมวดหมู่
                </Label>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v);
                    setIsDirty(true);
                  }}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c !== "All")
                      .map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>แท็ก ({selectedTags.length} เลือกแล้ว)</Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-32 overflow-y-auto p-1">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all",
                        selectedTags.includes(tag)
                          ? "bg-accent text-accent-foreground scale-105 shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-105"
                      )}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4 shadow-sm">
              <Label>ตั้งค่าบทความ</Label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground text-sm">บทความแนะนำ</p>
                  <p className="text-xs text-muted-foreground">แสดงในส่วน Featured</p>
                </div>
                <Switch
                  checked={featured}
                  onCheckedChange={(v) => {
                    setFeatured(v);
                    setIsDirty(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default ArticleEditor;
