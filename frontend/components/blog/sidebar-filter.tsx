import { cn } from "@/lib/utils";
import { Home, StickyNote, FileText, Code, Server, Layers, Terminal, Wrench } from "lucide-react";

interface FilterItem {
  id: string;
  label: string;
  count: number;
  icon?: React.ReactNode;
}

interface SidebarFilterProps {
  title?: string;
  items: FilterItem[];
  selected: string;
  onSelect: (id: string) => void;
  showCounts?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  All: <Home className="h-4 w-4" />,
  Programming: <Code className="h-4 w-4" />,
  Frontend: <Layers className="h-4 w-4" />,
  Backend: <Server className="h-4 w-4" />,
  DevOps: <Terminal className="h-4 w-4" />,
  Tools: <Wrench className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
  blog: <FileText className="h-4 w-4" />,
};

export function SidebarFilter({ items, selected, onSelect, showCounts = true }: SidebarFilterProps) {
  return (
    <div className="bg-card rounded-2xl shadow-card p-2">
      <nav className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
              selected === item.id ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}>
            <span className="flex items-center gap-3">
              <span className="text-muted-foreground">{categoryIcons[item.id] || categoryIcons[item.label] || <FileText className="h-4 w-4" />}</span>
              <span>{item.label}</span>
            </span>
            {showCounts && (
              <span
                className={cn(
                  "text-xs tabular-nums px-2 py-0.5 rounded-full",
                  selected === item.id ? "bg-background text-foreground" : "bg-muted text-muted-foreground"
                )}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
