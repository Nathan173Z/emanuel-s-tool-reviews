// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
//
// Vercel: durante o build a Vercel define VERCEL=1. Aí desativamos o plugin Cloudflare e
// usamos Nitro (https://vercel.com/docs/frameworks/full-stack/tanstack-start) para gerar
// o output que as Functions reconhecem — evita 404 NOT_FOUND por handler inexistente.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  cloudflare: isVercel ? false : undefined,
  plugins: isVercel ? [nitro()] : [],
  tanstackStart: {
    server: { entry: "server" },
  },
});
