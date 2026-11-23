"use client";

import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { deletePost } from "@/app/actions/posts";
import { FadeIn } from "@/src/components/fade-in";

export type GridPost = {
  id: string;
  image_url: string | null;
  caption: string | null;
  body?: string | null;
};

function DeleteGridButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label="Delete transmission"
      title="Delete transmission"
      disabled={pending}
      className="flex h-7 w-7 items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100 focus-visible:border-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={13} strokeWidth={1.8} className="animate-spin" />
      ) : (
        <Trash2 size={13} strokeWidth={1.8} />
      )}
    </button>
  );
}

export function PostGrid({
  posts,
  canDelete = false,
  deleteRedirectTo,
}: {
  posts: GridPost[];
  canDelete?: boolean;
  deleteRedirectTo?: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="u-panel u-empty py-10">
        <p className="u-label">{"// NO TRANSMISSIONS ON RECORD"}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.map((post, index) => (
        <FadeIn key={post.id} delay={index * 0.03}>
          <div className="relative aspect-square border border-zinc-800 bg-zinc-900">
            <Link href={`/post/${post.id}`} className="block h-full w-full transition-opacity duration-200 ease-out hover:opacity-90">
              {post.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.image_url}
                  alt={post.caption ? post.caption : "Transmission"}
                  className="h-full w-full rounded-none object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-950 p-2">
                  <p className="line-clamp-4 text-center text-[10px] leading-relaxed text-zinc-300">
                    {post.body || post.caption || "TEXT"}
                  </p>
                </div>
              )}
            </Link>
            {canDelete ? (
              <form
                action={deletePost}
                className="absolute right-1.5 top-1.5 z-10"
              >
                <input type="hidden" name="postId" value={post.id} />
                {deleteRedirectTo ? (
                  <input
                    type="hidden"
                    name="redirectTo"
                    value={deleteRedirectTo}
                  />
                ) : null}
                <DeleteGridButton />
              </form>
            ) : null}
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
