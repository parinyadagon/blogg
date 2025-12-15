import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

// Post schema matching backend validation rules
export const postSchema = z.object({
  title: z.string().min(3, "ชื่อบทความต้องมีอย่างน้อย 3 ตัวอักษร").max(200, "ชื่อบทความต้องไม่เกิน 200 ตัวอักษร"),
  slug: z.string().min(1, "Slug จำเป็นต้องระบุ"),
  content: z.string().min(50, "เนื้อหาบทความต้องมีอย่างน้อย 50 ตัวอักษร").max(100000, "เนื้อหาบทความต้องไม่เกิน 100,000 ตัวอักษร"),
  excerpt: z.string().max(300, "คำโปรยต้องไม่เกิน 300 ตัวอักษร").optional().or(z.literal("")),
  image: z.string().url("URL รูปภาพไม่ถูกต้อง").optional().or(z.literal("")),
  is_published: z.boolean(),
  category_ids: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

export type PostFormValues = z.infer<typeof postSchema>;
