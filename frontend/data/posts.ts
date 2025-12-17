export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  featured?: boolean;
}

export const posts: Post[] = [
  {
    id: "1",
    slug: "getting-started-with-golang",
    title: "เริ่มต้นเขียน Golang สำหรับมือใหม่ - คู่มือฉบับสมบูรณ์",
    excerpt: "เรียนรู้พื้นฐาน Golang ตั้งแต่การติดตั้ง ไวยากรณ์พื้นฐาน ไปจนถึงการสร้างโปรเจกต์แรก พร้อมตัวอย่างโค้ดที่เข้าใจง่าย",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    author: {
      name: "สมชาย เทคโนโลยี",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    category: "Programming",
    tags: ["Golang", "Backend", "Tutorial"],
    publishedAt: "2024-01-15",
    readingTime: 8,
    featured: true,
    content: `
# เริ่มต้นเขียน Golang สำหรับมือใหม่

Go หรือ Golang เป็นภาษาโปรแกรมที่พัฒนาโดย Google ในปี 2007 และเปิดตัวสู่สาธารณะในปี 2009 ภาษานี้ถูกออกแบบมาเพื่อความเรียบง่าย ประสิทธิภาพสูง และรองรับการทำงานแบบ concurrent

## ทำไมต้องเลือก Golang?

มีหลายเหตุผลที่ทำให้ Golang เป็นที่นิยม:

- **ความเร็ว**: Compile เร็ว รันได้เร็ว
- **ง่ายต่อการเรียนรู้**: Syntax เรียบง่าย ไม่ซับซ้อน
- **Concurrency**: รองรับ goroutines และ channels
- **Static Typing**: ช่วยจับ bug ได้ตั้งแต่ compile time

## การติดตั้ง Golang

สำหรับ macOS สามารถติดตั้งผ่าน Homebrew:

\`\`\`bash
brew install go
\`\`\`

สำหรับ Windows สามารถดาวน์โหลดจาก [golang.org](https://golang.org)

## Hello World ใน Go

มาเริ่มต้นด้วยโปรแกรมแรกกันเลย:

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("สวัสดี Golang!")
}
\`\`\`

## ตัวแปรและ Type

Go เป็นภาษา statically typed หมายความว่าตัวแปรต้องมี type ที่ชัดเจน:

\`\`\`go
// ประกาศแบบระบุ type
var name string = "สมชาย"
var age int = 25

// ประกาศแบบ short declaration
city := "กรุงเทพ"
score := 95.5
\`\`\`

## Function

การสร้าง function ใน Go:

\`\`\`go
func add(a int, b int) int {
    return a + b
}

// Multiple return values
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    return a / b, nil
}
\`\`\`

## Struct

Struct คือการรวมกลุ่มข้อมูลเข้าด้วยกัน:

\`\`\`go
type Person struct {
    Name    string
    Age     int
    Email   string
}

func main() {
    p := Person{
        Name:  "สมหญิง",
        Age:   30,
        Email: "somying@example.com",
    }
    fmt.Printf("ชื่อ: %s, อายุ: %d\\n", p.Name, p.Age)
}
\`\`\`

## สรุป

Golang เป็นภาษาที่เหมาะสำหรับการพัฒนา Backend, CLI tools, และ microservices ด้วยความเรียบง่ายและประสิทธิภาพที่สูง ลองเริ่มต้นเขียนโปรเจกต์เล็กๆ แล้วค่อยๆ เพิ่มความซับซ้อนไปทีละน้อยครับ

> "Simplicity is the ultimate sophistication" - Leonardo da Vinci
`,
  },
  {
    id: "2",
    slug: "nextjs-14-server-components",
    title: "ทำความรู้จัก Server Components ใน Next.js 14",
    excerpt: "เจาะลึก React Server Components และวิธีใช้งานใน Next.js 14 พร้อม use cases จริงและ best practices",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    author: {
      name: "วิชัย เว็บดีฟ",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    category: "Frontend",
    tags: ["Next.js", "React", "Server Components"],
    publishedAt: "2024-01-10",
    readingTime: 12,
    featured: true,
    content: `
# ทำความรู้จัก Server Components ใน Next.js 14

React Server Components (RSC) เป็นหนึ่งในฟีเจอร์ที่สำคัญที่สุดใน Next.js 14 ที่เปลี่ยนวิธีการเขียน React แบบเดิมๆ

## Server Components vs Client Components

### Server Components (Default)
- รันบน server เท่านั้น
- ไม่สามารถใช้ hooks หรือ browser APIs
- สามารถ fetch data โดยตรง
- Bundle size เล็กลง

\`\`\`tsx
// app/posts/page.tsx - Server Component
async function PostsPage() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json());
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

### Client Components
- รันบน browser
- ใช้ได้กับ hooks และ interactivity
- ต้องเพิ่ม "use client" directive

\`\`\`tsx
"use client"

import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

## Best Practices

1. **เริ่มต้นด้วย Server Components**: ใช้ Client Components เฉพาะเมื่อจำเป็น
2. **Push Client Components ลง**: วาง interactivity ไว้ที่ component ย่อยสุด
3. **ใช้ Streaming**: ใช้ Suspense เพื่อ progressive rendering

## สรุป

Server Components ช่วยให้เราสร้าง apps ที่เร็วขึ้น มี bundle size เล็กลง และ DX ที่ดีขึ้น
`,
  },
  {
    id: "3",
    slug: "docker-for-developers",
    title: "Docker 101: พื้นฐานที่ Developer ทุกคนควรรู้",
    excerpt: "เรียนรู้ Docker ตั้งแต่ concept พื้นฐาน การสร้าง Dockerfile จนถึงการใช้ Docker Compose สำหรับ local development",
    coverImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=400&fit=crop",
    author: {
      name: "ประยุทธ์ ดีฟออปส์",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    category: "DevOps",
    tags: ["Docker", "DevOps", "Container"],
    publishedAt: "2024-01-08",
    readingTime: 10,
    content: `
# Docker 101: พื้นฐานที่ Developer ทุกคนควรรู้

Docker เป็นเครื่องมือที่ช่วยให้เราสร้าง package และ run applications ใน containers ซึ่งเป็น isolated environments ที่มีทุกอย่างที่ application ต้องการ

## Dockerfile พื้นฐาน

\`\`\`dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Docker Compose

\`\`\`yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

## คำสั่งที่ใช้บ่อย

\`\`\`bash
# Build image
docker build -t myapp .

# Run container
docker run -p 3000:3000 myapp

# Docker Compose
docker-compose up -d
docker-compose logs -f
docker-compose down
\`\`\`
`,
  },
  {
    id: "4",
    slug: "typescript-best-practices",
    title: "TypeScript Best Practices สำหรับปี 2024",
    excerpt: "รวม patterns และ best practices การเขียน TypeScript ที่จะช่วยให้โค้ดของคุณ clean และ maintainable มากขึ้น",
    coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
    author: {
      name: "สมชาย เทคโนโลยี",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    category: "Programming",
    tags: ["TypeScript", "JavaScript", "Best Practices"],
    publishedAt: "2024-01-05",
    readingTime: 15,
    content: `
# TypeScript Best Practices สำหรับปี 2024

TypeScript ช่วยให้เราเขียนโค้ดที่ปลอดภัยและ maintainable มากขึ้น แต่ต้องใช้อย่างถูกวิธี

## 1. ใช้ Type แทน Interface สำหรับ Union Types

\`\`\`typescript
// ✅ Good
type Status = 'pending' | 'approved' | 'rejected';

type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
\`\`\`

## 2. ใช้ \`as const\` สำหรับ Literal Types

\`\`\`typescript
// ✅ Good
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number]; // 'admin' | 'user' | 'guest'
\`\`\`

## 3. Zod สำหรับ Runtime Validation

\`\`\`typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().positive().optional(),
});

type User = z.infer<typeof UserSchema>;
\`\`\`

## 4. Generic Constraints

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
\`\`\`
`,
  },
  {
    id: "5",
    slug: "postgresql-performance-tuning",
    title: "เพิ่มประสิทธิภาพ PostgreSQL: Tips & Tricks",
    excerpt: "เทคนิคการ optimize PostgreSQL database ตั้งแต่ indexing, query optimization จนถึง connection pooling",
    coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop",
    author: {
      name: "ดาต้า แอนาลิสต์",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    category: "Database",
    tags: ["PostgreSQL", "Database", "Performance"],
    publishedAt: "2024-01-02",
    readingTime: 11,
    content: `
# เพิ่มประสิทธิภาพ PostgreSQL

## 1. Indexing Strategy

\`\`\`sql
-- B-tree index (default)
CREATE INDEX idx_users_email ON users(email);

-- Partial index
CREATE INDEX idx_active_users ON users(email) 
WHERE status = 'active';

-- Composite index
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);
\`\`\`

## 2. EXPLAIN ANALYZE

\`\`\`sql
EXPLAIN ANALYZE
SELECT * FROM orders 
WHERE user_id = 123 
AND created_at > '2024-01-01';
\`\`\`

## 3. Connection Pooling

ใช้ PgBouncer หรือ built-in connection pooling เพื่อจัดการ connections อย่างมีประสิทธิภาพ

## 4. Query Optimization

- ใช้ LIMIT เสมอเมื่อไม่ต้องการทุก rows
- หลีกเลี่ยง SELECT *
- ใช้ EXISTS แทน IN สำหรับ subqueries
`,
  },
  {
    id: "6",
    slug: "api-design-principles",
    title: "หลักการออกแบบ REST API ที่ดี",
    excerpt: "แนวทางการออกแบบ REST API ที่ consistent, scalable และง่ายต่อการใช้งานสำหรับ developers",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    author: {
      name: "วิชัย เว็บดีฟ",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    category: "Backend",
    tags: ["API", "REST", "Backend"],
    publishedAt: "2023-12-28",
    readingTime: 9,
    content: `
# หลักการออกแบบ REST API ที่ดี

## 1. ใช้ Nouns ไม่ใช่ Verbs

\`\`\`
✅ GET /users
✅ POST /users
✅ GET /users/123

❌ GET /getUsers
❌ POST /createUser
\`\`\`

## 2. HTTP Status Codes

\`\`\`
200 - OK
201 - Created
204 - No Content
400 - Bad Request
401 - Unauthorized
404 - Not Found
500 - Internal Server Error
\`\`\`

## 3. Pagination

\`\`\`json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 10,
    "total_pages": 10
  }
}
\`\`\`

## 4. Versioning

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`
`,
  },
];

export const categories = ["All", "Programming", "Frontend", "Backend", "DevOps", "Database"];

export const allTags = [
  "Golang",
  "Backend",
  "Tutorial",
  "Next.js",
  "React",
  "Server Components",
  "Docker",
  "DevOps",
  "Container",
  "TypeScript",
  "JavaScript",
  "Best Practices",
  "PostgreSQL",
  "Database",
  "Performance",
  "API",
  "REST",
];
