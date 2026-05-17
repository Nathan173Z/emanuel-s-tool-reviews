## Contexto

Este projeto foi gerado pelo template do Lovable para **Cloudflare Workers** (Wrangler + plugin `cloudflare` do Vite). A Vercel não reconhece esse output, por isso o build resulta em `404 NOT_FOUND`. Para publicar na Vercel sem quebrar o preview do Lovable, vou ativar o adaptador **Nitro (preset Vercel)** apenas quando a build rodar lá.

## Mudanças

### 1. `vite.config.ts`
- Detectar a Vercel via `process.env.VERCEL`.
- Quando estiver na Vercel: desativar o plugin `cloudflare` e adicionar o `nitro/vite` (via import dinâmico, para não carregar o pacote no sandbox do Lovable).
- Fora da Vercel: comportamento atual (Cloudflare em build, sandbox em dev) — preview do Lovable continua funcionando normalmente.

### 2. Reinstalar dependência `nitro`
- Adicionar como devDependency. Carregamento é dinâmico, então não impacta o preview.

### 3. `vercel.json` (novo)
- Definir `installCommand: "bun install"` e `buildCommand: "bun run build"`.
- Garantir `NITRO_PRESET=vercel` no environment de build (o nitro detecta automaticamente, mas deixar explícito evita ambiguidade).

## Passos do usuário na Vercel

1. Import do repositório Git na Vercel.
2. Framework Preset: **Other** (deixar o `vercel.json` mandar).
3. Variáveis de ambiente: copiar as `VITE_SUPABASE_*` (e qualquer outra que use) do `.env` para *Project Settings → Environment Variables*.
4. Deploy. As rotas SSR e server functions do TanStack Start passam a ser servidas pelas Vercel Functions.

## Observações

- O preview/publish do Lovable continua funcionando em paralelo — as duas saídas (Cloudflare/Lovable e Vercel) coexistem.
- Se preferir simplicidade, publicar pelo Lovable (botão Publish) é o caminho nativo deste stack e já entrega URL pública + domínio customizado sem essa configuração extra.

Confirma para eu aplicar?