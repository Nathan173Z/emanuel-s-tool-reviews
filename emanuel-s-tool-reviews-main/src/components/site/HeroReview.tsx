import { Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";
import { getYouTubeThumb } from "@/lib/youtube";
import { Button } from "@/components/ui/button";

interface Props {
  review: {
    slug: string;
    titulo: string;
    veredito: string;
    url_youtube: string;
    nota: number;
    categoria: string;
  };
}

export function HeroReview({ review }: Props) {
  const thumb = getYouTubeThumb(review.url_youtube);
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid gap-0 lg:grid-cols-2">
        <Link
          to="/review/$slug"
          params={{ slug: review.slug }}
          className="group relative block aspect-video w-full overflow-hidden bg-muted lg:aspect-auto"
        >
          {thumb && (
            <img
              src={thumb}
              alt={review.titulo}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent">
            <div className="rounded-full bg-primary p-5 shadow-2xl transition-transform group-hover:scale-110">
              <Play className="size-7 fill-primary-foreground text-primary-foreground" />
            </div>
          </div>
        </Link>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Review em destaque
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {review.nota.toFixed(1)}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            {review.titulo}
          </h1>
          {review.veredito && (
            <p className="text-base text-muted-foreground">{review.veredito}</p>
          )}
          <div className="pt-2">
            <Button asChild size="lg" className="gap-2 font-semibold">
              <Link to="/review/$slug" params={{ slug: review.slug }}>
                <Play className="size-4 fill-current" />
                Assistir Review Completo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
