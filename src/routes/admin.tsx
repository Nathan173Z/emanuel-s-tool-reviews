import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { LogOut, Plus, Trash2, ExternalLink } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  createReviewDoc,
  deleteReviewDoc,
  fetchAllReviewsAdmin,
  isFirebaseAdmin,
  type ReviewDoc,
  type ReviewListItem,
} from "@/integrations/firebase/database";
import { getFirebaseAuth } from "@/integrations/firebase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { slugify, getYouTubeId } from "@/lib/youtube";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setChecking(true);
      if (u) {
        setUser(u);
        try {
          setIsAdmin(await isFirebaseAdmin(u.uid));
        } catch {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(null);
      }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Verificando acesso...</div>;
  }
  if (!user) return <LoginScreen />;
  if (!isAdmin) return <NoAccessScreen email={user.email ?? ""} uid={user.uid} />;
  return <AdminDashboard email={user.email ?? ""} />;
}

/* ---------------- LOGIN ---------------- */

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z.object({
      email: z.string().trim().email("Email inválido"),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    }).safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const auth = getFirebaseAuth();
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
        toast.success("Bem-vindo!");
      } else {
        await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
        toast.success("Conta criada!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao autenticar");
    }
    setLoading(false);
  }

  async function google() {
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar com Google");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Logo />
          <h1 className="mt-4 text-xl font-bold">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Entre para gerenciar seus reviews" : "Crie sua conta de administrador"}
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={google}>
          Entrar com Google
        </Button>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Sem conta?" : "Já tem conta?"}{" "}
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-semibold text-primary hover:underline">
            {mode === "signin" ? "Criar conta" : "Entrar"}
          </button>
        </p>
        <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground">
          ← Voltar para o site
        </Link>
      </div>
    </div>
  );
}

function NoAccessScreen({ email, uid }: { email: string; uid: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo />
      <h1 className="text-2xl font-bold">Sem permissão de admin</h1>
      <p className="max-w-md text-muted-foreground">
        Sua conta <strong>{email}</strong> não tem permissão. No Firebase Console → Firestore, crie o documento{" "}
        <code className="rounded bg-muted px-1 break-all">admins/{uid}</code> (objeto vazio <code className="rounded bg-muted px-1">{"{}"}</code>) para liberar acesso.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => signOut(getFirebaseAuth())}>Sair</Button>
        <Button asChild><Link to="/">Voltar à home</Link></Button>
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */

function AdminDashboard({ email }: { email: string }) {
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);

  async function load() {
    try {
      setReviews(await fetchAllReviewsAdmin());
    } catch {
      toast.error("Erro ao carregar reviews");
      setReviews([]);
    }
  }

  useEffect(() => { load(); }, []);

  async function deleteReview(id: string) {
    if (!confirm("Remover este review permanentemente?")) return;
    try {
      await deleteReviewDoc(id);
      toast.success("Review removido");
      load();
    } catch {
      toast.error("Erro ao remover");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:inline">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut(getFirebaseAuth())}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <ReviewForm onCreated={load} />
          <aside>
            <h2 className="mb-3 text-lg font-bold">Reviews ({reviews.length})</h2>
            <div className="space-y-2">
              {reviews.length === 0 && <p className="text-sm text-muted-foreground">Nenhum review ainda.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-sm font-semibold">{r.titulo}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className={`rounded-full px-2 py-0.5 font-medium ${r.publicado ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                          {r.publicado ? "Publicado" : "Rascunho"}
                        </span>
                        {r.destaque && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Destaque</span>}
                        {r.custo_beneficio && <span className="rounded-full bg-success/15 px-2 py-0.5 text-success">Bom & Barato</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button asChild size="icon" variant="ghost" className="size-7">
                        <a href={`/review/${r.slug}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => deleteReview(r.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ---------------- FORM ---------------- */

interface FormState {
  titulo: string; url_youtube: string; categoria: string; nota: string; veredito: string;
  pros: string; contras: string;
  amazon_url: string; amazon_preco: string;
  ml_url: string; ml_preco: string;
  shopee_url: string; shopee_preco: string;
  destaque: boolean; custo_beneficio: boolean;
}

const EMPTY: FormState = {
  titulo: "", url_youtube: "", categoria: "eletricas", nota: "0", veredito: "", pros: "", contras: "",
  amazon_url: "", amazon_preco: "", ml_url: "", ml_preco: "", shopee_url: "", shopee_preco: "",
  destaque: false, custo_beneficio: false,
};

function ReviewForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(publicado: boolean) {
    const schema = z.object({
      titulo: z.string().trim().min(3, "Título obrigatório").max(200),
      url_youtube: z.string().url("URL do YouTube inválida"),
      categoria: z.string(),
      nota: z.coerce.number().min(0).max(5),
      veredito: z.string().max(300).optional(),
    });
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!getYouTubeId(form.url_youtube)) { toast.error("URL do YouTube inválida"); return; }

    setSaving(true);
    const slug = `${slugify(form.titulo)}-${Date.now().toString(36).slice(-4)}`;
    const payload: Omit<ReviewDoc, "id" | "created_at" | "updated_at"> = {
      titulo: form.titulo.trim(),
      slug,
      url_youtube: form.url_youtube.trim(),
      categoria: form.categoria,
      nota: parsed.data.nota,
      veredito: form.veredito.trim(),
      pros: form.pros.split("\n").map((s) => s.trim()).filter(Boolean),
      contras: form.contras.split("\n").map((s) => s.trim()).filter(Boolean),
      links_afiliado: {
        amazon: { url: form.amazon_url.trim(), preco: form.amazon_preco.trim() },
        mercadoLivre: { url: form.ml_url.trim(), preco: form.ml_preco.trim() },
        shopee: { url: form.shopee_url.trim(), preco: form.shopee_preco.trim() },
      },
      destaque: form.destaque,
      custo_beneficio: form.custo_beneficio,
      publicado,
    };
    try {
      await createReviewDoc(payload);
      toast.success(publicado ? "Review publicado!" : "Rascunho salvo!");
      setForm(EMPTY);
      onCreated();
    } catch (err: unknown) {
      toast.error("Erro ao salvar: " + (err instanceof Error ? err.message : "desconhecido"));
    }
    setSaving(false);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(true); }} className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div className="mb-6 flex items-center gap-2">
        <Plus className="size-5 text-primary" />
        <h2 className="text-xl font-bold">Novo Review</h2>
      </div>

      <Section title="1. Informações Básicas">
        <Field label="Título do Review">
          <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Furadeira Bosch GSB 13 RE" required />
        </Field>
        <Field label="Link do YouTube">
          <Input value={form.url_youtube} onChange={(e) => set("url_youtube", e.target.value)} placeholder="https://youtube.com/watch?v=..." required />
        </Field>
        <Field label="Categoria">
          <Select value={form.categoria} onValueChange={(v) => set("categoria", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c.id !== "todas").map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.emoji} {c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section title="2. Avaliação Técnica">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nota Geral (0–5)">
            <Input type="number" step="0.1" min="0" max="5" value={form.nota} onChange={(e) => set("nota", e.target.value)} />
          </Field>
          <Field label="Veredito Principal">
            <Input value={form.veredito} onChange={(e) => set("veredito", e.target.value)} placeholder="Ex: Excelente custo-benefício" />
          </Field>
        </div>
        <Field label="Pontos Positivos (um por linha)">
          <Textarea rows={4} value={form.pros} onChange={(e) => set("pros", e.target.value)} placeholder="Motor potente&#10;Bateria dura muito" />
        </Field>
        <Field label="Pontos Negativos (um por linha)">
          <Textarea rows={4} value={form.contras} onChange={(e) => set("contras", e.target.value)} placeholder="Pesada&#10;Carregador lento" />
        </Field>
      </Section>

      <Section title="3. Links de Afiliado">
        <p className="-mt-1 mb-3 text-xs text-muted-foreground">Preencha pelo menos um. Os botões aparecerão na página do review.</p>
        <AffiliateBlock label="Amazon" color="amazon" url={form.amazon_url} preco={form.amazon_preco} onUrl={(v) => set("amazon_url", v)} onPreco={(v) => set("amazon_preco", v)} />
        <AffiliateBlock label="Mercado Livre" color="mercadolivre" url={form.ml_url} preco={form.ml_preco} onUrl={(v) => set("ml_url", v)} onPreco={(v) => set("ml_preco", v)} />
        <AffiliateBlock label="Shopee" color="shopee" url={form.shopee_url} preco={form.shopee_preco} onUrl={(v) => set("shopee_url", v)} onPreco={(v) => set("shopee_preco", v)} />
      </Section>

      <Section title="4. Configurações">
        <div className="space-y-3">
          <ToggleRow label="Destacar na Home (Hero)" checked={form.destaque} onChange={(v) => set("destaque", v)} />
          <ToggleRow label="Marcar como “Bom & Barato”" checked={form.custo_beneficio} onChange={(v) => set("custo_beneficio", v)} />
        </div>
      </Section>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={saving} onClick={() => save(false)}>Salvar rascunho</Button>
        <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Publicar review"}</Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mb-6 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <legend className="-mt-1 mb-4 text-sm font-bold uppercase tracking-wide text-primary">{title}</legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm font-medium">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function AffiliateBlock({ label, color, url, preco, onUrl, onPreco }: {
  label: string; color: "amazon" | "mercadolivre" | "shopee";
  url: string; preco: string; onUrl: (v: string) => void; onPreco: (v: string) => void;
}) {
  const dot = { amazon: "bg-amazon", mercadolivre: "bg-mercadolivre", shopee: "bg-shopee" }[color];
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className={`size-2.5 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <Input placeholder="URL do produto" value={url} onChange={(e) => onUrl(e.target.value)} />
        <Input placeholder="R$ 0,00 (opcional)" value={preco} onChange={(e) => onPreco(e.target.value)} />
      </div>
    </div>
  );
}
