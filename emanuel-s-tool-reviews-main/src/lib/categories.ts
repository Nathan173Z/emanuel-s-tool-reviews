export const CATEGORIES = [
  { id: "todas", label: "Todas", emoji: "✨" },
  { id: "eletricas", label: "Elétricas", emoji: "⚡" },
  { id: "bateria", label: "Bateria", emoji: "🔋" },
  { id: "manuais", label: "Manuais", emoji: "🔨" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
