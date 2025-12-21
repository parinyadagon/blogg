"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, ArrowLeft, Image as ImageIcon, Loader2, Upload, X, Clock, Check, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { categories, allTags } from "@/data/posts";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ContentEditor } from "@/components/blog/content-editor";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostFormValues } from "@/lib/schemas";

interface PostEditorProps {
  postId?: string;
}

export const PostEditor: React.FC<PostEditorProps> = ({ postId }) => {
  const router = useRouter();
  const isEditing = !!postId;

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const warnedHostRef = useRef<string | null>(null);

  const [isLoading, setIsLoading] = useState(!!postId);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image: "",
      category_ids: [],
      tags: [],
      featured: false,
      is_published: false,
    },
  });

  // Watch only cover image (content tracked via onChange)
  const coverImage = watch("image");

  // Fetch post data when editing
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const post = result.data;
          setStatus(post.is_published ? "published" : "draft");

          // Reset form with fetched data
          reset({
            title: post.title || "",
            slug: post.slug || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            image: post.image || "",
            category_ids: post.category_ids || [],
            tags: post.tags || [],
            featured: post.featured || false,
            is_published: post.is_published || false,
          });
        } else {
          toast.error("ไม่สามารถโหลดข้อมูลบทความได้");
          //   router.push("/dashboard/posts");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        // router.push("/dashboard/posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, reset, router]);

  // Watch form changes for side effects (auto-save, slug generation)
  useEffect(() => {
    // Auto-generate slug from title
    const generateSlug = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^\w\sก-๙]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    const subscription = watch((formValues, { name }) => {
      // Auto-generate slug when title changes
      if (name === "title" && formValues.title) {
        const currentSlug = getValues("slug");
        if (!isEditing || !currentSlug) {
          setValue("slug", generateSlug(formValues.title));
        }
      }

      // Auto-save on any change
      if (isDirty && formValues.title?.trim()) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(async () => {
          setIsSaving(true);
          await new Promise((resolve) => setTimeout(resolve, 500));
          setLastSaved(new Date());
          setIsSaving(false);
        }, 3000);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [watch, setValue, getValues, isDirty, isEditing]);

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
      setValue("image", imageUrl, { shouldDirty: true });
      toast.success("อัปโหลดรูปภาพสำเร็จ");
    };
    reader.readAsDataURL(file);
  };

  // Create new post
  const createPost = async (data: PostFormValues) => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "ไม่สามารถสร้างบทความได้");
    }

    return response.json();
  };

  // Update existing post
  const updatePost = async (data: PostFormValues) => {
    if (!postId) {
      throw new Error("Post ID is required for update");
    }

    const response = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "ไม่สามารถอัปเดตบทความได้");
    }

    return response.json();
  };

  const onSubmit = async (data: PostFormValues, publishStatus: "draft" | "published") => {
    try {
      setIsSaving(true);
      setStatus(publishStatus);

      // Prepare data with publish status
      const submitData = {
        ...data,
        publish: publishStatus === "published",
      };

      // Call appropriate API function
      const result = isEditing ? await updatePost(submitData) : await createPost(submitData);

      if (result.success) {
        toast.success(publishStatus === "published" ? "เผยแพร่บทความสำเร็จ" : "บันทึกฉบับร่างสำเร็จ", {
          description: publishStatus === "published" ? "บทความของคุณถูกเผยแพร่แล้ว" : "บทความถูกบันทึกเป็นฉบับร่าง",
        });
        setLastSaved(new Date());

        // Redirect to posts list after successful create
        if (!isEditing) {
          setTimeout(() => {
            router.push("/posts");
          }, 1500);
        }
      } else {
        toast.error("เกิดข้อผิดพลาด", {
          description: result.message || "ไม่สามารถบันทึกบทความได้",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("เกิดข้อผิดพลาด", {
        description: error instanceof Error ? error.message : "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = (publishStatus: "draft" | "published") => {
    handleSubmit((data) => onSubmit(data, publishStatus))();
  };

  // Show loading state when fetching post data
  if (isLoading) {
    return (
      <ContentLayout title={isEditing ? "Edit Post" : "New Post"}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={isEditing ? "Edit Post" : "New Post"}>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/posts")} className="shrink-0">
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
              onClick={() => handleSaveClick("draft")}
              disabled={isSaving}
              className="flex-1 sm:flex-none cursor-pointer">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              <span className="hidden sm:inline">บันทึกฉบับร่าง</span>
              <span className="sm:hidden">บันทึก</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleSaveClick("published")}
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
                  {...register("title")}
                  className={cn("text-base sm:text-lg font-medium", errors.title && "border-red-500")}
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">/article/</span>
                  <Input
                    id="slug"
                    placeholder="getting-started-with-golang"
                    {...register("slug")}
                    className={cn("text-sm", errors.slug && "border-red-500")}
                  />
                </div>
                {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">คำโปรย (Excerpt)</Label>
                <Textarea
                  id="excerpt"
                  placeholder="สรุปสั้นๆ เกี่ยวกับบทความนี้..."
                  {...register("excerpt")}
                  rows={2}
                  className={cn("text-sm", errors.excerpt && "border-red-500")}
                />
                {errors.excerpt && <p className="text-sm text-red-500 mt-1">{errors.excerpt.message}</p>}
              </div>
            </div>

            {/* Content Editor */}
            <ContentEditor
              initialValue={getValues("content")}
              error={errors.content?.message}
              onChange={(value: string) => setValue("content", value, { shouldDirty: true })}
            />
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
                      onClick={() => setValue("image", "", { shouldDirty: true })}>
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
                  {...register("image", {
                    onChange: (e) => {
                      const url = e.target.value;

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
                    },
                  })}
                  className={cn("text-sm", errors.image && "border-red-500")}
                />
                {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image.message}</p>}
              </div>
            </div>

            {/* Category & Tags */}
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  หมวดหมู่
                </Label>
                <Controller
                  name="category_ids"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value?.[0] || ""} onValueChange={(v) => field.onChange([v])}>
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
                  )}
                />
              </div>

              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>แท็ก ({field.value?.length || 0} เลือกแล้ว)</Label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-32 overflow-y-auto p-1">
                      {allTags.map((tag) => {
                        const isSelected = field.value?.includes(tag) || false;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const current = field.value || [];
                              const updated = isSelected ? current.filter((t) => t !== tag) : [...current, tag];
                              field.onChange(updated);
                            }}
                            className={cn(
                              "px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all",
                              isSelected
                                ? "bg-accent text-accent-foreground scale-105 shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-105"
                            )}>
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Settings */}
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4 shadow-sm">
              <Label>ตั้งค่าบทความ</Label>
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-foreground text-sm">บทความแนะนำ</p>
                      <p className="text-xs text-muted-foreground">แสดงในส่วน Featured</p>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};
