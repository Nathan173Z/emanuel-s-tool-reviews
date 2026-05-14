import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Star, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Newsletter } from "@/components/site/Newsletter";
import { getYouTubeEmbed } from "@/lib/youtube";
import { CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AffiliateLink { url: string; preco?: string }
interface Review {
  id: string;
  slug: string;
  titulo: string;
  url_youtube: string;
  categoria: string;
  nota: number;
  veredito: string;
  pros: string[];
  contras: string[];
  links_afiliado: { amazon: AffiliateLink; mercadoLivre: AffiliateLink; shopee: AffiliateLink };
}

export const Route = createFileRoute("/review/$slug")({
  component: ReviewPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Review não encontrado</h1>
        <p className="mt-3 text-muted-foreground">O conteúdo que você buscou não existe ou foi removido.</p>
        <Button asChild className="mt-6"><Link to="/">Voltar para a home</Link></Button>
      </main>
      <Footer />
    </div>
  ),
});

function ReviewPage() {
  const { slug } = Route.useParams();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*")
      .eq("slug", slug)
      .eq("publicado", true)
      .maybeSingle()
      .then(({ data }) => {
        setReview(data as Review | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 p-12 text-center text-muted-foreground">Carregando...</main>
        <Footer />
      </div>
    );
  }

  if (!review) throw notFound();

  const cat = CATEGORIES.find((c) => c.id === review.categoria);
  const embed = getYouTubeEmbed(review.url_youtube);
  const links = review.links_afiliado;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Voltar
        </Link>

        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-secondary px-3 py-1 font-medium">{cat?.emoji} {cat?.label ?? review.categoria}</span>
          <span className="inline-flex items-center gap-1 font-semibold">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {review.nota.toFixed(1)} / 5.0
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{review.titulo}</h1>

        {embed && (
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-black shadow-lg">
            <div className="aspect-video">
              <iframe
                src={embed}
                title={review.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        {review.veredito && (
          <div className="mt-8 rounded-xl border-l-4 border-primary bg-card p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-primary">Veredito</div>
            <p className="mt-1 text-lg font-medium">{review.veredito}</p>
          </div>
        )}

        <AffiliateButtons links={links} />

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <ProsCons items={review.pros} type="pros" />
          <ProsCons items={review.contras} type="contras" />
        </div>

        <div className="mt-16">
          <Newsletter />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProsCons({ items, type }: { items: string[]; type: "pros" | "contras" }) {
  const isPros = type === "pros";
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className={cn("mb-3 text-sm font-bold uppercase tracking-wide", isPros ? "text-success" : "text-destructive")}>
        {isPros ? "Pontos Positivos" : "Pontos Negativos"}
      </h3>
      <ul className="space-y-2">
        {items.map((p, i) => (
          <li key={i} className="flex gap-2 text-sm">
            {isPros ? (
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-destructive" />
            )}
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AffiliateButtons({ links }: { links: Review["links_afiliado"] }) {
  const platforms: { key: keyof Review["links_afiliado"]; name: string; cls: string }[] = [
    { key: "amazon", name: "Amazon", cls: "bg-amazon hover:bg-amazon/90 text-black" },
    { key: "mercadoLivre", name: "Mercado Livre", cls: "bg-mercadolivre hover:bg-mercadolivre/90 text-black" },
    { key: "shopee", name: "Shopee", cls: "bg-shopee hover:bg-shopee/90 text-white" },
  ];
  const available = platforms.filter((p) => links?.[p.key]?.url);
  if (available.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold">Onde comprar</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {available.map((p) => {
          const data = links[p.key];
          return (
            <a
              key={p.key}
              href={data.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-5 font-bold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg",
                p.cls
              )}
            >
              <span className="text-base">{p.name}</span>
              {data.preco && <span className="text-sm font-semibold opacity-90">{data.preco}</span>}
              <span className="mt-1 text-xs font-medium opacity-80">Ver oferta →</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
