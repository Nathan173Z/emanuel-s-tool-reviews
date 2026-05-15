import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "../firebase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

/** Login OAuth via Firebase (substitui o fluxo Lovable + Supabase). */
export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple" | "microsoft" | "lovable",
      _opts?: SignInOptions,
    ) => {
      if (provider !== "google") {
        return { error: new Error("Apenas Google está disponível neste projeto.") };
      }
      try {
        await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
        return { redirected: false as const };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
    },
  },
};
