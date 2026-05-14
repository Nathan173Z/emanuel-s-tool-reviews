import { Link } from "@tanstack/react-router";
import { Star, Play } from "lucide-react";
import { getYouTubeThumb } from "@/lib/youtube";
import { CATEGORIES } from "@/lib/categories";

interface Review {
  slug: string;
  titulo: string;
  url_youtube: string;
  categoria: string;
  nota: number;
  custo_beneficio?: boolean;
}

export function ReviewCard({ review, badge }: { review: Review; badge?: boolean }) {
  const thumb = getYouTubeThumb(review.url_youtube);
  const cat = CATEGORIES.find((c) => c.id === review.categoria);

  return (
    <Link
      to="/review/$slug"
      params={{ slug: review.slug }}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {thumb && (
          <img
            src={thumb}
            alt={review.titulo}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className="rounded-full bg-primary/90 p-3 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            <Play className="size-5 fill-primary-foreground text-primary-foreground" />
          </div>
        </div>
        {(badge || review.custo_beneficio) && (
          <div className="absolute left-2 top-2 rounded-md bg-success px-2 py-1 text-xs font-bold text-white shadow">
            ⭐ Bom & Barato
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{cat?.emoji} {cat?.label ?? review.categoria}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {review.nota.toFixed(1)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {review.titulo}
        </h3>
      </div>
    </Link>
  );
}

export function ReviewCardCompact({ review }: { review: Review }) {
  const thumb = getYouTubeThumb(review.url_youtube);
  const cat = CATEGORIES.find((c) => c.id === review.categoria);
  return (
    <Link
      to="/review/$slug"
      params={{ slug: review.slug }}
      className="group flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30"
    >
      <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-muted sm:w-40">
        {thumb && <img src={thumb} alt={review.titulo} className="h-full w-full object-cover" loading="lazy" />}
      </div>
      <div className="flex min-w-0 flex-col justify-between py-0.5">
        <div>
          <div className="text-xs text-muted-foreground">{cat?.emoji} {cat?.label ?? review.categoria}</div>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
            {review.titulo}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-foreground">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {review.nota.toFixed(1)}
        </div>
      </div>
    </Link>
  );
}
