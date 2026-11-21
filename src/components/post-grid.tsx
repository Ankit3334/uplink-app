import Link from "next/link";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/app/actions/posts";
import { FadeIn } from "@/src/components/fade-in";

export type GridPost = {
  id: string;
  image_url: string;
  caption: string | null;
};

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
      <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#666]">
          {"// NO TRANSMISSIONS ON RECORD"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.map((post, index) => (
        <FadeIn key={post.id} delay={index * 0.03}>
          <div className="relative aspect-square border border-neon-cyan/30 bg-[#050505]">
            <Link href={`/post/${post.id}`} className="block h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image_url}
                alt={post.caption ? post.caption : "Transmission"}
                className="h-full w-full rounded-none object-cover"
                loading="lazy"
              />
            </Link>
            {canDelete ? (
              <form
                action={deletePost}
                className="absolute right-1 top-1 z-10"
              >
                <input type="hidden" name="postId" value={post.id} />
                {deleteRedirectTo ? (
                  <input
                    type="hidden"
                    name="redirectTo"
                    value={deleteRedirectTo}
                  />
                ) : null}
                <button
                  type="submit"
                  aria-label="Delete transmission"
                  title="Delete transmission"
                  className="flex h-7 w-7 items-center justify-center border border-neon-magenta bg-[#050505]/90 text-[#ff00ff] transition-colors hover:bg-[#ff00ff]/20 hover:shadow-[0_0_8px_rgba(255,0,255,0.35)]"
                >
                  <Trash2 size={14} />
                </button>
              </form>
            ) : null}
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
