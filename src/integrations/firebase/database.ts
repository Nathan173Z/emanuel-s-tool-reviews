import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { getFirebaseDb } from "./client";

export type AffiliateLink = { url: string; preco?: string };
export type LinksAfiliado = {
  amazon: AffiliateLink;
  mercadoLivre: AffiliateLink;
  shopee: AffiliateLink;
};

export interface ReviewDoc {
  id: string;
  titulo: string;
  slug: string;
  url_youtube: string;
  categoria: string;
  nota: number;
  veredito: string;
  pros: string[];
  contras: string[];
  links_afiliado: LinksAfiliado;
  destaque: boolean;
  custo_beneficio: boolean;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewListItem {
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  publicado: boolean;
  destaque: boolean;
  custo_beneficio: boolean;
  nota: number;
}

function reviewsCol() {
  return collection(getFirebaseDb(), "reviews");
}

/** Reviews publicados para a home (lista). */
export async function fetchPublishedReviewsForHome(): Promise<
  Pick<
    ReviewDoc,
    | "id"
    | "slug"
    | "titulo"
    | "url_youtube"
    | "categoria"
    | "nota"
    | "veredito"
    | "destaque"
    | "custo_beneficio"
    | "created_at"
  >[]
> {
  const q = query(reviewsCol(), where("publicado", "==", true), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const x = d.data() as Omit<ReviewDoc, "id">;
    return { id: d.id, ...x };
  });
}

/** Um review publicado por slug (suporta doc id == slug e docs antigos com id aleatório). */
export async function fetchPublishedReviewBySlug(slug: string): Promise<ReviewDoc | null> {
  // 1) Tenta direto pelo ID do documento (nova estrutura)
  const direct = await getDoc(doc(getFirebaseDb(), "reviews", slug));
  if (direct.exists()) {
    const data = direct.data() as Omit<ReviewDoc, "id">;
    if (data.publicado) return { id: direct.id, ...data };
  }
  // 2) Fallback: docs antigos com ID aleatório, busca pelo campo slug
  const q = query(
    reviewsCol(),
    where("slug", "==", slug),
    where("publicado", "==", true),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data() as Omit<ReviewDoc, "id">;
  return { id: d.id, ...data };
}

/** Painel admin: todos os reviews. Requer utilizador autenticado com regras Firestore adequadas. */
export async function fetchAllReviewsAdmin(): Promise<ReviewListItem[]> {
  const q = query(reviewsCol(), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const x = d.data() as Omit<ReviewListItem, "id">;
    return { id: d.id, ...x };
  });
}

export async function createReviewDoc(
  payload: Omit<ReviewDoc, "id" | "created_at" | "updated_at">,
): Promise<void> {
  const slug = payload.slug?.trim();
  if (!slug) throw new Error("Slug é obrigatório para criar o review.");

  const ref = doc(getFirebaseDb(), "reviews", slug);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    throw new Error(`Já existe um review com o slug "${slug}".`);
  }

  const now = new Date().toISOString();
  await setDoc(ref, {
    ...payload,
    id: slug,
    slug,
    created_at: now,
    updated_at: now,
  });
}

export async function fetchReviewByIdOrSlug(idOrSlug: string): Promise<ReviewDoc | null> {
  // 1) tenta como ID do documento (nova estrutura: doc id == slug)
  const direct = await getDoc(doc(getFirebaseDb(), "reviews", idOrSlug));
  if (direct.exists()) {
    const data = direct.data() as Omit<ReviewDoc, "id">;
    return { id: direct.id, ...data };
  }
  // 2) fallback: documentos antigos com ID aleatório, busca por campo slug
  const q = query(reviewsCol(), where("slug", "==", idOrSlug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data() as Omit<ReviewDoc, "id">;
  return { id: d.id, ...data };
}

export async function deleteReviewDoc(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), "reviews", id));
}

/** Documento `admins/{uid}` deve existir na Firestore (criar manualmente no Firebase Console). */
export async function isFirebaseAdmin(uid: string): Promise<boolean> {
  const s = await getDoc(doc(getFirebaseDb(), "admins", uid));
  return s.exists();
}

const EMAIL_KEY = /^[a-z0-9@._-]+$/i;
function newsletterDocId(email: string): string {
  const e = email.trim().toLowerCase();
  if (!EMAIL_KEY.test(e) || e.length > 254) return `h_${hashCode(e)}`;
  return e.replace(/@/g, "_at_").replace(/\./g, "_");
}

function hashCode(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export async function subscribeNewsletterEmail(email: string): Promise<"ok" | "duplicate"> {
  const normalized = email.trim().toLowerCase();
  const id = newsletterDocId(normalized);
  const ref = doc(getFirebaseDb(), "newsletter_subscribers", id);
  const existing = await getDoc(ref);
  if (existing.exists()) return "duplicate";
  await setDoc(ref, { email: normalized, created_at: new Date().toISOString() });
  return "ok";
}
