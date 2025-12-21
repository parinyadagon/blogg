"use client";

export function CodeSkeleton() {
  return (
    <div className="relative my-6 rounded-xl border bg-muted/30 dark:bg-zinc-900/50 backdrop-blur overflow-hidden">
      {/* 1. ส่วน Header (Mac Terminal Style) */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/20" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
          <div className="h-3 w-3 rounded-full bg-green-500/20" />
        </div>
        {/* Fake filename */}
        <div className="ml-4 h-2 w-20 rounded-full bg-muted-foreground/20" />
      </div>

      {/* 2. ส่วน Body (Pulsing Lines) */}
      <div className="p-6 space-y-3 animate-pulse">
        {/* จำลองบรรทัด Code ยาวสั้นไม่เท่ากัน */}
        <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
        <div className="h-4 w-1/2 rounded bg-muted-foreground/20" />
        <div className="h-4 w-5/6 rounded bg-muted-foreground/20" />
        <div className="h-4 w-full rounded bg-transparent" /> {/* เว้นบรรทัด */}
        <div className="h-4 w-2/3 rounded bg-muted-foreground/20" />
        <div className="h-4 w-4/5 rounded bg-muted-foreground/20" />
        <div className="h-4 w-1/3 rounded bg-muted-foreground/20" />
      </div>

      {/* 3. ปุ่ม Copy ปลอม (เพื่อ layout ที่ไม่กระตุก) */}
      <div className="absolute top-3 right-3 h-8 w-8 rounded bg-muted-foreground/10" />
    </div>
  );
}
