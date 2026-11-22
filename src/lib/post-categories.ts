/** Shared post category labels and the ultra-subtle feed badge treatment. */
export const POST_CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  question: "Question",
  hiring: "Hiring",
  showdev: "ShowDev",
};

export const POST_CATEGORY_BADGE_CLASS =
  "inline-flex rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400";

export function categoryLabel(category: string | null | undefined) {
  if (!category) return null;
  return POST_CATEGORY_LABELS[category] ?? "General";
}
