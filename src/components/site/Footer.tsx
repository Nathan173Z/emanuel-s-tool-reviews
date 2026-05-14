import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Reviews honestos de ferramentas. Comprovado, testado, recomendado.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Conteúdo</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-foreground">Todos os reviews</a></li>
              <li><a href="/#custo-beneficio" className="hover:text-foreground">Custo-benefício</a></li>
              <li><a href="#newsletter" className="hover:text-foreground">Newsletter</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Termos de uso</a></li>
              <li><a href="#" className="hover:text-foreground">Política de privacidade</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Contato</h4>
            <p className="text-sm text-muted-foreground">contato@emanuelsolucoes.com</p>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Aviso de afiliados:</strong>{" "}
          Como participante dos programas Amazon Associates, Mercado Livre e Shopee,
          recebemos uma comissão por compras qualificadas realizadas através dos
          links em nosso site. Isso não afeta o preço pago pelo consumidor e nos
          ajuda a manter conteúdo gratuito e independente.
          <div className="mt-3">© {new Date().getFullYear()} Emanuel Soluções. Todos os direitos reservados.</div>
        </div>
      </div>
    </footer>
  );
}
