"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useActionState,
} from "react";
import Link from "next/link";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  Send,
  X,
} from "lucide-react";
import {
  pinPost,
  toggleBookmark,
  toggleBoostPost,
  editPost,
  type EditPostState,
} from "@/app/actions/posts";
import { BottomSheet } from "@/src/components/bottom-sheet";
import { triggerHaptic } from "@/src/lib/utils";

const initialEditState: EditPostState = {};

const iconButtonClass =
  "flex items-center justify-center bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/40";

const inactiveIconClass = "text-zinc-400 hover:bg-zinc-800 hover:text-white";

const activeIconClass =
  "bg-cyan-400/10 border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-400";

export function PostActions({
  postId,
  initialBoosted,
  initialBoostCount,
  threadCount,
  initialBookmarked,
  shareUrl,
  isOwner = false,
  isPinned = false,
  initialBody = "",
  canEdit = false,
}: {
  postId: string;
  initialBoosted: boolean;
  initialBoostCount: number;
  threadCount: number;
  initialBookmarked: boolean;
  shareUrl: string;
  isOwner?: boolean;
  isPinned?: boolean;
  initialBody?: string;
  canEdit?: boolean;
}) {
  // Refs keep rapid taps accurate: each click flips the instant state from the
  // latest value instead of a stale render closure. The server call follows.
  const boostedRef = useRef(initialBoosted);
  const bookmarkedRef = useRef(initialBookmarked);
  const boostRequestRef = useRef(0);
  const bookmarkRequestRef = useRef(0);

  const [boosted, setBoosted] = useState(initialBoosted);
  const [boostCount, setBoostCount] = useState(initialBoostCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pinned, setPinned] = useState(isPinned);
  const [pinError, setPinError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [, startTransition] = useTransition();
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
      boostedRef.current = detail.boosted;
      setBoosted(detail.boosted);
      setBoostCount(detail.boostCount);
    }
    window.addEventListener("post:boosted", onBoosted as EventListener);
    return () =>
      window.removeEventListener("post:boosted", onBoosted as EventListener);
  }, [postId]);

  useEffect(() => {
    function onPinned(e: Event) {
      const detail = (
        e as CustomEvent<{
          postId: string;
          pinned: boolean;
          previousPinnedPostId?: string | null;
        }>
      ).detail;
      if (!detail) return;
      if (detail.postId === postId) {
        setPinned(detail.pinned);
      } else if (detail.previousPinnedPostId === postId) {
        setPinned(false);
      }
    }
    window.addEventListener("post:pinned", onPinned as EventListener);
    return () =>
      window.removeEventListener("post:pinned", onPinned as EventListener);
  }, [postId]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const onTogglePin = () => {
    triggerHaptic();
    setMenuOpen(false);
    setPinError(null);
    const next = !pinned;
    setPinned(next);

    startTransition(async () => {
      const result = await pinPost(postId);
      if (result.error) {
        setPinned(!next);
        setPinError(result.error);
        return;
      }
      setPinned(result.pinned);
      window.dispatchEvent(
        new CustomEvent("post:pinned", {
          detail: {
            postId,
            pinned: result.pinned,
            previousPinnedPostId: result.previousPinnedPostId,
          },
        }),
      );
    });
  };

  const onBoost = () => {
    triggerHaptic();
    const next = !boostedRef.current;
    boostedRef.current = next;
    setBoosted(next);
    setBoostCount((c) => c + (next ? 1 : -1));

    const requestId = ++boostRequestRef.current;
    startTransition(async () => {
      const res = await toggleBoostPost(postId);
      if (requestId !== boostRequestRef.current) return;
      if (!res.error) {
        boostedRef.current = res.boosted;
        setBoosted(res.boosted);
        setBoostCount(res.boostCount);
      } else {
        boostedRef.current = !next;
        setBoosted(!next);
        setBoostCount((c) => c + (next ? -1 : 1));
      }
    });
  };

  const onBookmark = () => {
    triggerHaptic();
    const next = !bookmarkedRef.current;
    bookmarkedRef.current = next;
    setBookmarked(next);

    const requestId = ++bookmarkRequestRef.current;
    startTransition(async () => {
      const res = await toggleBookmark(postId);
      if (requestId !== bookmarkRequestRef.current) return;
      if (!res.error) {
        bookmarkedRef.current = res.bookmarked;
        setBookmarked(res.bookmarked);
      } else {
        bookmarkedRef.current = !next;
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
    setMenuOpen(false);
    setEditing((v) => !v);
  };

  return (
    <div className="px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBoost}
          aria-label={
            boosted
              ? `Remove boost, ${boostCount} boosts`
              : `Boost, ${boostCount} boosts`
          }
          aria-pressed={boosted}
          className={`${iconButtonClass} ${boosted ? activeIconClass : inactiveIconClass}`}
        >
          <Heart
            size={16}
            className="h-4 w-4"
            strokeWidth={1.8}
            fill={boosted ? "currentColor" : "none"}
          />
        </button>

        <Link
          href={`/post/${postId}`}
          aria-label={`View ${threadCount} comments`}
          className={`${iconButtonClass} ${inactiveIconClass}`}
        >
          <MessageCircle size={16} className="h-4 w-4" strokeWidth={1.8} />
        </Link>

        <button
          type="button"
          onClick={onBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          aria-pressed={bookmarked}
          className={`${iconButtonClass} ${bookmarked ? activeIconClass : inactiveIconClass}`}
        >
          <Bookmark
            size={16}
            className="h-4 w-4"
            strokeWidth={1.8}
            fill={bookmarked ? "currentColor" : "none"}
          />
        </button>

        <button
          type="button"
          onClick={onShare}
          aria-label="Share"
          className={`${iconButtonClass} ${inactiveIconClass}`}
        >
          <Send size={16} className="h-4 w-4" strokeWidth={1.8} />
        </button>

        {isOwner && canEdit ? (
          <button
            type="button"
            onClick={openEditor}
            aria-label="Edit post"
            aria-pressed={isEditing}
            className={`${iconButtonClass} ${isEditing ? activeIconClass : inactiveIconClass}`}
          >
            <Pencil size={16} className="h-4 w-4" strokeWidth={1.8} />
          </button>
        ) : null}

        {isOwner ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setMenuOpen((open) => !open);
              }}
              aria-label="More post options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={`${iconButtonClass} ${menuOpen ? activeIconClass : inactiveIconClass}`}
            >
              <MoreHorizontal size={16} className="h-4 w-4" strokeWidth={1.8} />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute bottom-full right-0 z-30 mb-1 w-48 border border-zinc-800 bg-zinc-950 p-1 shadow-lg shadow-black/40"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={onTogglePin}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-cyan-400 focus-visible:bg-zinc-900 focus-visible:text-cyan-400 focus-visible:outline-none"
                >
                  <Pin
                    size={13}
                    strokeWidth={1.8}
                    className={pinned ? "text-cyan-400" : "text-zinc-500"}
                  />
                  {pinned ? "Unpin from profile" : "Pin to profile"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {pinError ? (
        <p role="alert" className="mt-2 px-4 text-[11px] text-red-300">
          {pinError}
        </p>
      ) : null}

      <BottomSheet
        open={isEditing}
        onClose={() => setEditing(false)}
        title="Edit transmission"
      >
        <form action={editAction} className="relative z-10 space-y-4 bg-zinc-950">
          <input type="hidden" name="postId" value={postId} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Post text
            </span>
            <textarea
              name="body"
              defaultValue={initialBody}
              rows={5}
              className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-[15px] leading-relaxed text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400"
              placeholder="Update your post..."
            />
          </label>
          {editState?.error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {editState.error}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <span className="inline-flex items-center gap-1.5">
                <X size={13} /> Cancel
              </span>
            </button>
            <button
              type="submit"
              onClick={triggerHaptic}
              disabled={editPending}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
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
      <p className="text-xs font-medium text-zinc-500">
        {boostCount} {boostCount === 1 ? "boost" : "boosts"}
      </p>
      {caption ? (
        <p className="mt-1 text-[15px] leading-relaxed text-zinc-200">
          <span className="mr-2 font-semibold text-white">{username}</span>
          <span className="text-zinc-300">{caption}</span>
        </p>
      ) : null}
      <p className="mt-1 text-xs text-zinc-500">{createdAt}</p>
    </div>
  );
}
