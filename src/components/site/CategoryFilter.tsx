import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface Props {
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}

export function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/40"
            )}
          >
            <span>{c.emoji}</span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
