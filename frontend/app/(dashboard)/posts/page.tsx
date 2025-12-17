"use client";

import React, { useState } from "react";

import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { posts as initialPosts, categories } from "@/data/posts";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

const PostsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const filteredPosts = initialPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    toast.success("ลบบทความสำเร็จ");
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  return (
    <ContentLayout title="Posts">
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">บทความทั้งหมด</h1>
            <p className="text-muted-foreground text-sm mt-1">{filteredPosts.length} บทความ</p>
          </div>
          <Link href="/dashboard/posts/new">
            <Button className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" />
              สร้างบทความใหม่
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาบทความ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 rounded-xl border-border/50 bg-card/50 h-11"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200",
                  selectedCategory === category
                    ? "bg-accent/10 text-accent"
                    : "bg-card/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border/50"
                )}>
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List - Card style */}
        <div className="space-y-3">
          {filteredPosts.map((post, index) => (
            <div
              key={post.id}
              className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-3 sm:p-4 hover:border-border transition-all duration-300 group"
              style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <img src={post.coverImage} alt={post.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start sm:items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 sm:truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:underline underline-offset-2 transition-all duration-200 cursor-pointer">
                      {post.title}
                    </h3>
                    {post.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5 sm:mt-0" />}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:truncate mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">{post.category}</span>
                    <span className="text-muted-foreground hidden sm:inline">{format(new Date(post.publishedAt), "d MMM yyyy", { locale: th })}</span>
                    <span className="text-muted-foreground">{post.readingTime} นาที</span>
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                      เผยแพร่แล้ว
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href={`/post/${post.slug}`} className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        ดูบทความ
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href={`/dashboard/posts/${post.id}/edit`} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        แก้ไข
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-destructive focus:text-destructive rounded-lg">
                      <Trash2 className="w-4 h-4 mr-2" />
                      ลบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-12 text-center">
            <p className="text-muted-foreground">ไม่พบบทความที่ค้นหา</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบบทความ</AlertDialogTitle>
              <AlertDialogDescription>คุณแน่ใจหรือไม่ที่จะลบบทความนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                ลบบทความ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ContentLayout>
  );
};

export default PostsList;
