"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, LogOut, Settings, ShoppingBag, UserCircle, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "ภาพรวม", href: "/dashboard", icon: LayoutDashboard },
  { name: "สินค้า", href: "/dashboard/products", icon: ShoppingBag },
  { name: "ลูกค้า", href: "/dashboard/customers", icon: Users },
  { name: "ตั้งค่า", href: "/dashboard/settings", icon: Settings },
];
export function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white dark:bg-zinc-950">
      {/* 1. ส่วนหัว (Logo) */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">D</div>
          <span className="text-blue-600">Dash</span>Board
        </Link>
      </div>

      {/* 2. รายการเมนู (Scroll ได้ถ้าเมนูเยอะ) */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all mb-1",
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold shadow-sm" // Active Style
                    : "text-muted-foreground hover:text-primary hover:bg-muted" // Inactive Style
                )}>
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. ส่วนท้าย (User Profile & Logout) */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 mb-2">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">Admin User</p>
            <p className="truncate text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
