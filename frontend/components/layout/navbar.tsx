"use client";

import Link from "next/link";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";

export function Navbar() {
  const navLinks = [
    { name: "หน้าแรก", href: "/" },
    { name: "บทความ", href: "/blog" },
    { name: "เกี่ยวกับเรา", href: "/about" },
    { name: "ติดต่อ", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* --- 1. Logo (อยู่ซ้ายสุดเสมอ) --- */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-blue-600">My</span>Logo
        </Link>

        {/* --- 2. Desktop Menu (จอคอม) --- */}
        {/* hidden = ซ่อนก่อน, md:flex = พอเป็นจอ md ให้แสดงแบบ flex */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {item.name}
            </Link>
          ))}
        </nav>

        {/* --- 3. Mobile Menu (มือถือ) --- */}
        {/* md:hidden = พอเป็นจอ md (คอม) ให้ซ่อนตัวนี้ซะ */}
        <div className="md:hidden">
          <Sheet>
            {/* ปุ่ม Hamburger */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            {/* เนื้อหาที่จะเลื่อนออกมา (Sidebar) */}
            <SheetContent side="right">
              {" "}
              {/* side="left" ถ้าอยากให้ออกทางซ้าย */}
              <SheetTitle className="mb-4 text-left text-lg font-bold">เมนูหลัก</SheetTitle>
              <div className="flex flex-col gap-4">
                {navLinks.map((item) => (
                  // ใช้ SheetClose ครอบ เพื่อให้กดลิ้งค์แล้วเมนูปิดเอง
                  <SheetClose key={item.href} asChild>
                    <Link href={item.href} className="text-lg font-medium hover:text-blue-600">
                      {item.name}
                    </Link>
                  </SheetClose>
                ))}

                <div className="mt-4 border-t pt-4">
                  <Button className="w-full">Login</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
