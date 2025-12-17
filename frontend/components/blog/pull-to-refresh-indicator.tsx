import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
  shouldRefresh: boolean;
}

export function PullToRefreshIndicator({ pullDistance, isRefreshing, progress, shouldRefresh }: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div className="flex items-center justify-center overflow-hidden transition-all duration-200 ease-out" style={{ height: pullDistance }}>
      <div
        className={cn(
          "flex items-center gap-2 text-muted-foreground transition-all duration-200",
          shouldRefresh && "text-primary",
          isRefreshing && "text-primary"
        )}>
        <RefreshCw
          className={cn("h-5 w-5 transition-transform duration-200", isRefreshing && "animate-spin")}
          style={{
            transform: isRefreshing ? undefined : `rotate(${progress * 180}deg)`,
          }}
        />
        <span className="text-sm font-medium">{isRefreshing ? "กำลังรีเฟรช..." : shouldRefresh ? "ปล่อยเพื่อรีเฟรช" : "ดึงลงเพื่อรีเฟรช"}</span>
      </div>
    </div>
  );
}
