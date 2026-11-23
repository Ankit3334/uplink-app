"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Terminal } from "lucide-react";
import { searchUsers, type UserSearchResult } from "@/app/actions/search";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    let cancelled = false;
    const t = window.setTimeout(async () => {
      setLoading(true);
      const data = await searchUsers(q);
      if (cancelled) return;
      setResults(data);
      setOpen(true);
      setLoading(false);
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query]);

  function onQueryChange(next: string) {
    setQuery(next);
    if (!next.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center border border-zinc-800 bg-zinc-900 px-3 py-2.5 focus-within:border-cyan-400">
        <Search size={16} className="mr-2 flex-shrink-0 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || query.trim()) setOpen(true);
          }}
          placeholder="SEARCH NODES // USERNAME OR DISPLAY NAME"
          className="w-full bg-transparent font-mono text-xs uppercase tracking-[0.08em] text-zinc-100 outline-none placeholder:text-zinc-500"
        />
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 border border-zinc-800 bg-zinc-950">
          {loading ? (
            <div className="px-3 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              Scanning nodes...
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              No matching nodes
            </div>
          ) : (
            <ul>
              {results.map((u, idx) => (
                <li key={u.id} className={idx > 0 ? "border-t border-zinc-800" : ""}>
                  <Link
                    href={`/u/${u.username}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-zinc-900"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-400">
                      {u.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatar_url}
                          alt={`${u.username} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Terminal size={14} strokeWidth={1.8} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[11px] uppercase tracking-[0.1em] text-zinc-100">
                        @{u.username}
                      </p>
                      <p className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-500">
                        {u.display_name ?? u.username}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
