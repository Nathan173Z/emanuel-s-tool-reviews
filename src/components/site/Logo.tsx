import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
      <img src={logo} alt="Emanuel Soluções" className="h-9 w-9 object-contain" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-foreground text-lg">EMANUEL</span>
        <span className="text-primary text-lg">SOLUÇÕES</span>
      </div>
    </Link>
  );
}
