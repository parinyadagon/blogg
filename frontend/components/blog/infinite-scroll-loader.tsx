import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollLoaderProps {
  isLoading: boolean;
  hasMore: boolean;
}

export const InfiniteScrollLoader = forwardRef<HTMLDivElement, InfiniteScrollLoaderProps>(({ isLoading, hasMore }, ref) => {
  return (
    <div ref={ref} className="flex items-center justify-center py-8">
      {isLoading && (
        <div className="flex items-center gap-3 text-muted-foreground animate-fade-in">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">กำลังโหลดบทความเพิ่มเติม...</span>
        </div>
      )}
      {!hasMore && !isLoading && (
        <div className="text-center text-muted-foreground animate-fade-in">
          <p className="text-sm">แสดงบทความทั้งหมดแล้ว</p>
        </div>
      )}
    </div>
  );
});

InfiniteScrollLoader.displayName = "InfiniteScrollLoader";
