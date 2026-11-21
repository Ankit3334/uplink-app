import { type ClassValue, clsx } from "clsx";
import Link from "next/link";
import { createElement, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TOKEN_REGEX = /(https?:\/\/[^\s<]+|@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g;

export function parseRichText(text: string): ReactNode[] {
  const parts = text.split(TOKEN_REGEX);
  return parts.map((part, i) => {
    if (!part) return createElement("span", { key: i });

    if (/^https?:\/\/[^\s<]+$/.test(part)) {
      const href = part.replace(/[),.;!?]+$/g, "");
      const trailing = part.slice(href.length);
      return createElement(
        "span",
        { key: i },
        createElement(
          "a",
          {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            className:
              "text-cyan-400 underline underline-offset-2 transition-colors duration-200 ease-out hover:text-cyan-300",
          },
          href,
        ),
        trailing,
      );
    }

    if (/^@[a-zA-Z0-9_]+$/.test(part)) {
      const username = part.slice(1);
      return createElement(
        Link,
        {
          key: i,
          href: `/u/${username}`,
          className:
            "text-cyan-400 transition-colors duration-200 ease-out hover:underline",
        },
        part,
      );
    }

    if (/^#[a-zA-Z0-9_]+$/.test(part)) {
      return createElement(
        "span",
        { key: i, className: "text-cyan-400" },
        part,
      );
    }

    return createElement("span", { key: i }, part);
  });
}

// Back-compat alias
export function renderTextWithLinks(text: string): ReactNode[] {
  return parseRichText(text);
}
