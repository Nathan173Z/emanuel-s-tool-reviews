import { useState } from "react";
import { z } from "zod";
import { subscribeNewsletterEmail } from "@/integrations/firebase/database";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const schema = z.object({ email: z.string().trim().email("Email inválido").max(255) });

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const result = await subscribeNewsletterEmail(parsed.data.email);
      setLoading(false);
      if (result === "duplicate") {
        toast.success("Você já está inscrito!");
        return;
      }
      toast.success("Inscrição confirmada! Fique de olho no seu e-mail.");
      setEmail("");
    } catch {
      setLoading(false);
      toast.error("Não foi possível inscrever. Tente novamente.");
    }
  }

  return (
    <section
      id="newsletter"
      className="rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-10 sm:py-16"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Receba alertas de promoções e novos reviews
        </h2>
        <p className="mt-3 text-sm text-primary-foreground/80 sm:text-base">
          Sem spam. Apenas as melhores ofertas e os reviews mais recentes.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="h-11 w-full rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-4 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
          />
          <Button
            type="submit"
            disabled={loading}
            variant="secondary"
            className="h-11 w-full shrink-0 px-6 font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
          >
            {loading ? "Enviando..." : "Inscrever"}
          </Button>
        </form>
      </div>
    </section>
  );
}
