"use client";

import { useState, useTransition } from "react";
import { voteInPoll } from "@/app/actions/posts";
import type { PollData } from "@/src/lib/polls";
import { triggerHaptic } from "@/src/lib/utils";

export function PollCard({ poll }: { poll: PollData }) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    poll.votedOptionId,
  );
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      poll.options.map((option) => [option.id, option.vote_count]),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totalVotes = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const hasVoted = selectedOptionId !== null;

  const vote = (optionId: string) => {
    if (hasVoted || pending) return;

    const previousCounts = counts;
    triggerHaptic();
    setError(null);
    setSelectedOptionId(optionId);
    setCounts((current) => ({
      ...current,
      [optionId]: (current[optionId] ?? 0) + 1,
    }));

    startTransition(async () => {
      const result = await voteInPoll({ pollId: poll.id, optionId });

      if (!result.success) {
        setSelectedOptionId(null);
        setCounts(previousCounts);
        setError(result.error ?? "Vote failed. Try again.");
        return;
      }

      if (result.voteCounts) setCounts(result.voteCounts);
      if (result.optionId) setSelectedOptionId(result.optionId);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        Poll // {poll.options.length} options
      </p>

      {!hasVoted ? (
        <div>
          {poll.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => vote(option.id)}
              disabled={pending}
              className="w-full text-left bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 mb-2 hover:border-cyan-400/50 transition-colors focus-visible:border-cyan-400 focus-visible:outline-none last:mb-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="text-sm text-zinc-200">{option.option_text}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {poll.options.map((option) => {
            const count = counts[option.id] ?? 0;
            const percent =
              totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isMine = selectedOptionId === option.id;

            return (
              <div
                key={option.id}
                className={`rounded-lg border p-3 ${
                  isMine
                    ? "border-cyan-400/20 bg-cyan-400/10"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span
                    className={`min-w-0 truncate ${
                      isMine ? "font-medium text-cyan-300" : "text-zinc-300"
                    }`}
                  >
                    {option.option_text}
                  </span>
                  <span className="flex-shrink-0 font-mono text-[11px] text-zinc-400">
                    {percent}%
                    <span className="ml-1 text-zinc-600">({count})</span>
                  </span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded bg-zinc-800">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </p>
        </div>
      )}

      {error ? (
        <p role="status" className="mt-2 text-[11px] text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
