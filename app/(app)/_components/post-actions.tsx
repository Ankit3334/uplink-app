"use client";

import { useEffect, useState, useTransition, useActionState } from "react";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Pencil, Send, X } from "lucide-react";
import {
  toggleBookmark,
  toggleBoostPost,
  editPost,
  type EditPostState,
} from "@/app/actions/posts";
import { BottomSheet } from "@/src/components/bottom-sheet";
import { triggerHaptic } from "@/src/lib/utils";

const initialEditState: EditPostState = {};

export function PostActions({
  postId,
  initialBoosted,
  initialBoostCount,
  threadCount,
  initialBookmarked,
  shareUrl,
  compact = false,
  isOwner = false,
  initialBody = "",
  canEdit = false,
}: {
  postId: string;
  initialBoosted: boolean;
  initialBoostCount: number;
  threadCount: number;
  initialBookmarked: boolean;
  shareUrl: string;
  compact?: boolean;
  isOwner?: boolean;
  initialBody?: string;
  canEdit?: boolean;
}) {
  const [boosted, setBoosted] = useState(initialBoosted);
  const [boostCount, setBoostCount] = useState(initialBoostCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [ackEditSuccess, setAckEditSuccess] = useState(false);
  const [editState, editAction, editPending] = useActionState(
    editPost,
    initialEditState,
  );

  // Close the sheet once the save action succeeds (render-time state adjust).
  const editSucceeded = Boolean(editState?.success) && !ackEditSuccess;
  if (editSucceeded) {
    setAckEditSuccess(true);
    setEditing(false);
  }
  const isEditing = editing && !editSucceeded;

  useEffect(() => {
    function onBoosted(e: Event) {
      const detail = (
        e as CustomEvent<{
          postId: string;
          boosted: boolean;
          boostCount: number;
        }>
      ).detail;
      if (detail?.postId !== postId) return;
      setBoosted(detail.boosted);
      setBoostCount(detail.boostCount);
    }
    window.addEventListener("post:boosted", onBoosted as EventListener);
    return () =>
      window.removeEventListener("post:boosted", onBoosted as EventListener);
  }, [postId]);

  const onBoost = () => {
    triggerHaptic();
    const next = !boosted;
    setBoosted(next);
    setBoostCount((c) => c + (next ? 1 : -1));
    startTransition(async () => {
      const res = await toggleBoostPost(postId);
      if (!res.error) {
        setBoosted(res.boosted);
        setBoostCount(res.boostCount);
      } else {
        setBoosted(!next);
        setBoostCount((c) => c + (next ? -1 : 1));
      }
    });
  };

  const onBookmark = () => {
    triggerHaptic();
    const next = !bookmarked;
    setBookmarked(next);
    startTransition(async () => {
      const res = await toggleBookmark(postId);
      if (!res.error) {
        setBookmarked(res.bookmarked);
      } else {
        setBookmarked(!next);
      }
    });
  };

  const onShare = async () => {
    triggerHaptic();
    const absoluteUrl =
      typeof window !== "undefined"
        ? new URL(shareUrl, window.location.origin).toString()
        : shareUrl;
    try {
      if (navigator.share) {
        await navigator.share({ url: absoluteUrl });
        return;
      }
    } catch {
      // fall through to copy
    }
    try {
      await navigator.clipboard.writeText(absoluteUrl);
    } catch {
      // no-op
    }
  };

  const openEditor = () => {
    triggerHaptic();
    setEditing((v) => !v);
  };

  const iconClass = "transition-all duration-200 ease-out hover:text-zinc-100";

  return (
    <div className={compact ? "px-3 py-2" : "px-4 py-2.5"}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBoost}
            aria-label={boosted ? "Remove boost" : "Boost"}
            disabled={isPending}
            className={`${iconClass} ${boosted ? "text-[#22d3ee]" : "text-zinc-300"}`}
          >
            <Heart
              size={24}
              strokeWidth={1.8}
              fill={boosted ? "currentColor" : "none"}
            />
          </button>
          <Link
            href={`/post/${postId}`}
            aria-label="Thread"
            className={`${iconClass} text-zinc-300`}
          >
            <MessageCircle size={24} strokeWidth={1.8} />
          </Link>
          <button
            type="button"
            onClick={onShare}
            aria-label="Share"
            className={`${iconClass} text-zinc-300`}
          >
            <Send size={24} strokeWidth={1.8} />
          </button>
          {isOwner && canEdit ? (
            <button
              type="button"
              onClick={openEditor}
              aria-label="Edit post"
              className={`${iconClass} ${isEditing ? "text-[#22d3ee]" : "text-zinc-300"}`}
            >
              <Pencil size={24} strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          disabled={isPending}
          className={`${iconClass} ${bookmarked ? "text-[#22d3ee]" : "text-zinc-300"}`}
        >
          <Bookmark
            size={24}
            strokeWidth={1.8}
            fill={bookmarked ? "currentColor" : "none"}
          />
        </button>
        <span className="sr-only">{boostCount} boosts</span>
        <span className="sr-only">{threadCount} threads</span>
      </div>

      <BottomSheet
        open={isEditing}
        onClose={() => setEditing(false)}
        title="Edit transmission"
      >
        <form action={editAction} className="space-y-3 p-4">
          <input type="hidden" name="postId" value={postId} />
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
              &gt; Transmission body
            </span>
            <textarea
              name="body"
              defaultValue={initialBody}
              rows={5}
              className="w-full resize-y border border-zinc-800 bg-[#111111] px-3 py-2 text-sm leading-relaxed text-zinc-100 outline-none transition-all duration-200 ease-out placeholder:text-zinc-600 focus:border-[#22d3ee]"
              placeholder="Update post text..."
            />
          </label>
          {editState?.error ? (
            <p className="font-mono text-[11px] text-red-400">
              {editState.error}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border border-zinc-800 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <span className="inline-flex items-center gap-1.5">
                <X size={12} /> Cancel
              </span>
            </button>
            <button
              type="submit"
              onClick={triggerHaptic}
              disabled={editPending}
              className="border border-zinc-700 bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#22d3ee] transition-all duration-200 ease-out hover:border-zinc-600 disabled:opacity-50"
            >
              {editPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}

export function PostActionMeta({
  boostCount,
  username,
  caption,
  createdAt,
}: {
  boostCount: number;
  username: string;
  caption: string | null;
  createdAt: string;
}) {
  return (
    <div className="px-4 pb-3">
      <p className="font-mono text-xs text-zinc-300">
        {boostCount} {boostCount === 1 ? "boost" : "boosts"}
      </p>
      {caption ? (
        <p className="mt-1 text-sm leading-relaxed text-zinc-200">
          <span className="mr-2 font-semibold text-zinc-100">{username}</span>
          <span className="text-zinc-300">{caption}</span>
        </p>
      ) : null}
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500">
        {createdAt}
      </p>
    </div>
  );
}
