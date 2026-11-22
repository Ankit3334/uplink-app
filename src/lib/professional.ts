export type Experience = {
  id: string;
  title: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  is_current: boolean;
};

export type Education = {
  id: string;
  school: string;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
};

export type Skill = {
  id: string;
  name: string;
};

export function formatMonthYear(value: string | null) {
  if (!value) return "Present";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function experiencePeriod(experience: Experience) {
  const start = formatMonthYear(experience.start_date);
  const end = experience.is_current ? "Present" : formatMonthYear(experience.end_date);
  return start === "Present" ? end : `${start} — ${end}`;
}

export function headlineFor(experiences: Experience[], fallback: string | null) {
  const featured =
    experiences.find((item) => item.is_current) ?? experiences[0] ?? null;
  if (featured) return `${featured.title} at ${featured.company}`;
  return fallback?.trim() || "Tech Builder";
}
