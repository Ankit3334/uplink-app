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

/** Smart feed tabs. `all` is the only value that skips the category filter. */
export const FEED_TABS = [
  { value: "all", label: "All" },
  { value: "hiring", label: "Hiring" },
  { value: "showdev", label: "ShowDev" },
  { value: "question", label: "Questions" },
] as const;

export type FeedTabValue = (typeof FEED_TABS)[number]["value"];

export function feedTabForCategory(
  category: string | null | undefined,
): FeedTabValue {
  if (
    category === "hiring" ||
    category === "showdev" ||
    category === "question"
  ) {
    return category;
  }
  return "all";
}
