import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fetchPublishedReviewsForHome } from "@/integrations/firebase/database";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HeroReview } from "@/components/site/HeroReview";
import { CategoryFilter } from "@/components/site/CategoryFilter";
import { ReviewCard, ReviewCardCompact } from "@/components/site/ReviewCard";
import { Newsletter } from "@/components/site/Newsletter";
import type { CategoryId } from "@/lib/categories";

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<CategoryId>("todas");

  useEffect(() => {
    fetchPublishedReviewsForHome()
      .then((data) => setReviews(data as Review[]))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (cat !== "todas" && r.categoria !== cat) return false;
      if (q && !r.titulo.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [reviews, cat, q]);

  const hero = reviews.find((r) => r.destaque) ?? reviews[0];
  const custoBeneficio = reviews.filter((r) => r.custo_beneficio).slice(0, 4);
  const latest = filtered.slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {loading ? (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Carregando...
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {hero && <HeroReview review={hero} />}

            <section className="mt-12">
              <h2 className="mb-4 text-lg font-semibold tracking-tight">Filtrar por categoria</h2>
              <CategoryFilter active={cat} onChange={setCat} />
            </section>

            {custoBeneficio.length > 0 && (
              <section id="custo-beneficio" className="mt-12">
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

            <section className="mt-14">
              <h2 className="mb-5 text-2xl font-bold tracking-tight">
                {q ? `Resultados para "${q}"` : "Últimos Reviews"}
              </h2>
              {latest.length === 0 ? (
                <p className="text-muted-foreground">Nenhum review encontrado.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {latest.map((r) => (
                    <ReviewCardCompact key={r.id} review={r} />
                  ))}
                </div>
              )}
            </section>

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
