// @lovable.dev/vite-tanstack-config already includes:
//   tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//   componentTagger (dev-only), VITE_* env injection, @ alias, dedupe, error loggers,
//   and sandbox detection. Do NOT duplicate them.
//
// Deploy:
//   - Lovable/Cloudflare (default): plugin `cloudflare` em build + Wrangler.
//   - Vercel: detectamos `process.env.VERCEL=1` no build, desativamos o Cloudflare
//     e carregamos o `nitro/vite` (preset Vercel) via import dinâmico — assim o
//     pacote `nitro` nunca entra no sandbox/preview do Lovable.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  cloudflare: isVercel ? false : undefined,
  plugins: isVercel ? [import("nitro/vite").then((m) => m.nitro())] : [],
  tanstackStart: {
    server: { entry: "server" },
  },
});
