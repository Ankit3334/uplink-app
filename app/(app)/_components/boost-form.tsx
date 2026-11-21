import { Zap } from "lucide-react";
import { toggleBoost } from "@/app/actions/posts";

export function BoostForm({
  postId,
  count,
}: {
  postId: string;
  count: number;
}) {
  return (
    <form action={toggleBoost}>
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        className="group flex items-center gap-2 border border-neon-cyan/30 bg-transparent px-3 py-2 text-xs uppercase tracking-[0.15em] text-[#a0a0a0] transition-colors hover:border-[#00f3ff] hover:text-[#00f3ff] hover:shadow-[0_0_10px_rgba(0,243,255,0.2)]"
      >
        <Zap
          size={16}
          className="transition-colors group-hover:text-[#00f3ff] group-hover:drop-shadow-[0_0_6px_rgba(0,243,255,0.8)]"
        />
        <span>Boost</span>
        <span className="text-[#00f3ff]">[{count}]</span>
      </button>
    </form>
  );
}
