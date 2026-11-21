"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Terminal, X, Loader2 } from "lucide-react";
import { uploadStory, type UploadStoryState } from "@/app/actions/stories";

export type StoryItem = {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  expires_at: string;
  created_at: string;
};

export type StoryUserGroup = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  stories: StoryItem[];
};

const initialUploadState: UploadStoryState = {};

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-[#161616] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#22d3ee] transition-colors hover:border-zinc-600 hover:bg-[#1b1b1b] focus-visible:border-[#22d3ee] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span className="text-zinc-200">Uploading...</span>
        </>
      ) : (
        "UPLOAD BROADCAST"
      )}
    </button>
  );
}

function StoryUploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(uploadStory, initialUploadState);
  const handledSuccess = useRef<number | null>(null);

  useEffect(() => {
    if (open && state?.success && handledSuccess.current !== state.success) {
      handledSuccess.current = state.success;
      onClose();
    }
  }, [state?.success, open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-4 sm:items-center">
      <div className="w-full max-w-md border border-zinc-800 bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Broadcast // Story Upload
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-300">
              Ephemeral Signal (24h)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-zinc-800 bg-[#111111] p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <StoryUploadFormInner formAction={formAction} state={state} />
      </div>
    </div>
  );
}

function StoryUploadFormInner({
  formAction,
  state,
}: {
  formAction: (payload: FormData) => void;
  state: UploadStoryState;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <form action={formAction} className="space-y-4 p-4">
      <label
        htmlFor="story-media"
        className="flex min-h-52 w-full cursor-pointer flex-col items-center justify-center border border-dashed border-zinc-700 bg-[#111111] p-4 text-center transition-colors hover:border-zinc-600 hover:bg-[#151515]"
      >
        {previewUrl ? (
          <>
            {previewType === "video" ? (
              <video
                src={previewUrl}
                className="max-h-64 w-full border border-zinc-800 bg-black object-contain"
                muted
                playsInline
                autoPlay
                loop
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Story preview"
                className="max-h-64 w-full border border-zinc-800 object-contain"
              />
            )}
            <span className="mt-3 block w-full truncate font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-300">
              Loaded: {fileName}
            </span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
              Click to replace
            </span>
          </>
        ) : (
          <div className="py-8">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">
              Select Image or Video
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
              Target bucket: story-media
            </p>
          </div>
        )}
      </label>
      <input
        id="story-media"
        name="media"
        type="file"
        accept="image/*,video/*"
        required
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) return;
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          setFileName(file.name);
          setPreviewType(file.type.startsWith("video/") ? "video" : "image");
        }}
      />

      {state?.error ? (
        <div
          role="alert"
          className="border border-zinc-700 bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-300"
        >
          {state.error}
        </div>
      ) : null}

      <UploadButton />
    </form>
  );
}

function StorySlide({
  group,
  storyIndex,
  onPrev,
  onNext,
  onClose,
}: {
  group: StoryUserGroup;
  storyIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const story = group.stories[storyIndex];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 5000;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration) {
        window.clearInterval(id);
      }
    }, 50);
    const timeout = window.setTimeout(() => {
      onNext();
    }, duration);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(timeout);
    };
  }, [onNext, story.id]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-[#050505]">
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <div className="flex gap-1 px-3 pt-3">
          {group.stories.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 bg-zinc-800">
              <div
                className="h-full bg-[#22d3ee]"
                style={{
                  width:
                    i < storyIndex
                      ? "100%"
                      : i === storyIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden border border-zinc-800 bg-[#111111] text-zinc-400">
              {group.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={group.avatarUrl}
                  alt={`${group.username} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Terminal size={14} strokeWidth={1.8} />
              )}
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-200">
              @{group.username}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-zinc-800 bg-[#111111] p-2 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
            aria-label="Close story"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative flex-1">
          {story.media_type === "video" ? (
            <video
              key={story.id}
              src={story.media_url}
              className="h-full w-full object-contain bg-black"
              autoPlay
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={story.id}
              src={story.media_url}
              alt="Story"
              className="h-full w-full object-contain bg-black"
            />
          )}

          <button
            type="button"
            aria-label="Previous"
            className="absolute inset-y-0 left-0 w-1/3"
            onClick={onPrev}
          />
          <button
            type="button"
            aria-label="Next"
            className="absolute inset-y-0 right-0 w-1/3"
            onClick={onNext}
          />
        </div>
      </div>
    </div>
  );
}

function StoryViewer({
  groups,
  initialGroupIndex,
  onClose,
}: {
  groups: StoryUserGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);

  const group = groups[groupIndex];
  if (!group) return null;

  const goNext = () => {
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
      return;
    }
    if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
      return;
    }
    onClose();
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      return;
    }
    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((i) => i - 1);
      setStoryIndex(Math.max(0, (prevGroup?.stories.length ?? 1) - 1));
    }
  };

  return (
    <StorySlide
      key={`${group.userId}-${storyIndex}`}
      group={group}
      storyIndex={storyIndex}
      onPrev={goPrev}
      onNext={goNext}
      onClose={onClose}
    />
  );
}

export function StoriesBar({
  currentUser,
  groups,
}: {
  currentUser: { id: string; username: string; avatarUrl: string | null };
  groups: StoryUserGroup[];
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const groupsWithStories = useMemo(
    () => groups.filter((g) => g.stories.length > 0),
    [groups],
  );

  return (
    <>
      <div className="border border-zinc-800 bg-[#0a0a0a] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Broadcasts // Stories
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
            24h Signal
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex w-[72px] flex-shrink-0 flex-col items-center gap-2 text-left"
          >
            <div className="relative flex h-14 w-14 items-center justify-center border border-zinc-700 bg-[#111111] text-zinc-300">
              {currentUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatarUrl}
                  alt="Your avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Terminal size={20} strokeWidth={1.6} />
              )}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center border border-[#050505] bg-[#22d3ee] text-[#050505]">
                <Plus size={12} strokeWidth={2.4} />
              </span>
            </div>
            <span className="w-full truncate text-center font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400">
              You
            </span>
          </button>

          {groupsWithStories.map((group, idx) => (
            <button
              key={group.userId}
              type="button"
              onClick={() => setViewerIndex(idx)}
              className="flex w-[72px] flex-shrink-0 flex-col items-center gap-2"
            >
              <div className="border-2 border-[#22d3ee] p-[2px]">
                <div className="flex h-12 w-12 items-center justify-center border border-zinc-800 bg-[#111111] text-zinc-300">
                  {group.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={group.avatarUrl}
                      alt={`${group.username} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Terminal size={18} strokeWidth={1.6} />
                  )}
                </div>
              </div>
              <span className="w-full truncate text-center font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-300">
                @{group.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      <StoryUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {viewerIndex !== null ? (
        <StoryViewer
          groups={groupsWithStories}
          initialGroupIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </>
  );
}
