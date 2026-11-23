"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ReplyTarget = {
  /** Always the top-level thread id so nesting stays one level deep. */
  parentId: string;
  username: string;
};

type ReplyContextValue = {
  replyTarget: ReplyTarget | null;
  beginReply: (target: ReplyTarget) => void;
  clearReply: () => void;
};

const ReplyContext = createContext<ReplyContextValue | null>(null);

export function ReplyProvider({ children }: { children: ReactNode }) {
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);

  const beginReply = useCallback((target: ReplyTarget) => {
    setReplyTarget(target);
  }, []);

  const clearReply = useCallback(() => {
    setReplyTarget(null);
  }, []);

  const value = useMemo(
    () => ({ replyTarget, beginReply, clearReply }),
    [replyTarget, beginReply, clearReply],
  );

  return <ReplyContext.Provider value={value}>{children}</ReplyContext.Provider>;
}

export function useReply() {
  const context = useContext(ReplyContext);
  if (!context) {
    throw new Error("useReply must be used inside ReplyProvider");
  }
  return context;
}
