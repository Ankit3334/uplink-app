export type PollOptionData = {
  id: string;
  option_text: string;
  vote_count: number;
};

export type PollData = {
  id: string;
  ends_at: string | null;
  options: PollOptionData[];
  votedOptionId: string | null;
};

type PollOptionRow = {
  id: string;
  option_text: string;
  vote_count: number | null;
};

export type PollRow = {
  id: string;
  post_id: string;
  ends_at: string | null;
  poll_options: PollOptionRow[] | PollOptionRow | null;
};

/** Normalize Supabase's relation shape into the client poll payload. */
export function toPollData(
  row: PollRow,
  votedOptionId: string | null,
): PollData {
  const options = Array.isArray(row.poll_options)
    ? row.poll_options
    : row.poll_options
      ? [row.poll_options]
      : [];

  return {
    id: row.id,
    ends_at: row.ends_at ?? null,
    votedOptionId,
    options: options.map((option) => ({
      id: option.id,
      option_text: option.option_text,
      vote_count: option.vote_count ?? 0,
    })),
  };
}
