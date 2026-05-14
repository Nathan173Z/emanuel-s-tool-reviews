import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Mail } from "lucide-react";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/", search: { q } as never });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <form onSubmit={submit} className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-md mx-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar ferramenta..."
              className="pl-9 bg-secondary border-transparent focus-visible:bg-card"
            />
          </div>
        </form>
        <nav className="ml-auto flex items-center gap-2 text-sm">
          <Link
            to="/"
            className="hidden rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground sm:inline-block"
          >
            Reviews
          </Link>
          <Button asChild size="sm" variant="default" className="gap-1.5">
            <a href="#newsletter">
              <Mail className="size-4" />
              <span className="hidden sm:inline">Newsletter</span>
            </a>
          </Button>
        </nav>
      </div>
      <form onSubmit={submit} className="border-t border-border px-4 py-2 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar ferramenta..."
            className="pl-9 bg-secondary border-transparent"
          />
        </div>
      </form>
    </header>
  );
}
