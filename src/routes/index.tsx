import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { X } from "lucide-react";
import { fetchPublishedReviewsForHome } from "@/integrations/firebase/database";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HeroReview } from "@/components/site/HeroReview";
import { CategoryFilter } from "@/components/site/CategoryFilter";
import { ReviewCard, ReviewCardCompact } from "@/components/site/ReviewCard";
import { Newsletter } from "@/components/site/Newsletter";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategoryId } from "@/lib/categories";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: Index,
});

interface Review {
  id: string;
  slug: string;
  titulo: string;
  url_youtube: string;
  categoria: string;
  nota: number;
  veredito: string;
  destaque: boolean;
  custo_beneficio: boolean;
  created_at: string;
}

function Index() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cat, setCat] = useState<CategoryId>("todas");
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    fetchPublishedReviewsForHome()
      .then((data) => {
        setReviews(data as Review[]);
        setLoadError(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar reviews publicados:", error);
        setReviews([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const hasActiveFilter = cat !== "todas" || Boolean(q);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (cat !== "todas" && r.categoria !== cat) return false;
      if (q && !r.titulo.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [reviews, cat, q]);

  const hero = reviews.find((r) => r.destaque) ?? reviews[0];
  const custoBeneficio = filtered.filter((r) => r.custo_beneficio).slice(0, 4);
  const latest = filtered.slice(0, 8);

  const scrollToResults = () => {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCategoryChange = (id: CategoryId) => {
    setCat(id);
    if (id !== "todas" || q) scrollToResults();
  };

  useEffect(() => {
    if (q) scrollToResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const clearFilters = () => {
    setCat("todas");
    navigate({ to: "/", search: {} as never });
  };

  const activeLabel = q
    ? `"${q}"`
    : CATEGORIES.find((c) => c.id === cat)?.label ?? "";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {loading ? (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Carregando...
          </div>
        ) : loadError ? (
          <LoadErrorState />
        ) : reviews.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {hero && !hasActiveFilter && <HeroReview review={hero} />}

            <section className={hasActiveFilter ? "" : "mt-12"}>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">Filtrar por categoria</h2>
              <CategoryFilter active={cat} onChange={handleCategoryChange} />
            </section>

            <div ref={resultsRef} className="scroll-mt-24">
              {hasActiveFilter && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <p className="text-sm text-foreground">
                    Mostrando resultados para{" "}
                    <span className="font-semibold text-primary">{activeLabel}</span>
                    <span className="ml-2 text-muted-foreground">
                      ({filtered.length} {filtered.length === 1 ? "review" : "reviews"})
                    </span>
                  </p>
                  <Button size="sm" variant="ghost" onClick={clearFilters} className="gap-1.5">
                    <X className="size-4" />
                    Limpar filtro
                  </Button>
                </div>
              )}

              {custoBeneficio.length > 0 && (
                <section id="custo-beneficio" className="mt-10">
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Reis do Custo-Benefício</h2>
                      <p className="text-sm text-muted-foreground">
                        As ferramentas que entregam mais por menos.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {custoBeneficio.map((r) => (
                      <ReviewCard key={r.id} review={r} badge />
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-12">
                <h2 className="mb-5 text-2xl font-bold tracking-tight">
                  {hasActiveFilter ? "Resultados" : "Últimos Reviews"}
                </h2>
                {latest.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                    <p className="text-muted-foreground">
                      Nenhum review encontrado para o filtro atual.
                    </p>
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                      Limpar filtro
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {latest.map((r) => (
                      <ReviewCardCompact key={r.id} review={r} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="mt-16">
              <Newsletter />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function LoadErrorState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <h2 className="text-xl font-semibold">Não foi possível carregar os reviews</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Verifique as variáveis do Firebase na Vercel e as regras de leitura do Firestore.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <h2 className="text-xl font-semibold">Nenhum review publicado ainda</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Acesse{" "}
        <a href="/admin" className="text-primary underline">
          /admin
        </a>{" "}
        para criar seu primeiro review.
      </p>
    </div>
  );
}
