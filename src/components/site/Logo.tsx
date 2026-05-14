import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-baseline gap-1.5 font-bold tracking-tight">
      <span className="text-foreground text-lg">EMANUEL</span>
      <span className="text-primary text-lg">SOLUÇÕES</span>
    </Link>
  );
}
