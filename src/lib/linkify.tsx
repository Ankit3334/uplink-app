import type { ReactNode } from "react";

const URL_REGEX = /(https?:\/\/[^\s<]+)/g;

export function renderTextWithLinks(text: string): ReactNode[] {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      // reset regex lastIndex because of global flag
      URL_REGEX.lastIndex = 0;
      const href = part.replace(/[),.;!?]+$/g, "");
      const trailing = part.slice(href.length);
      return (
        <span key={i}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline underline-offset-2 transition-colors duration-200 ease-out hover:text-cyan-300"
          >
            {href}
          </a>
          {trailing}
        </span>
      );
    }
    URL_REGEX.lastIndex = 0;
    return <span key={i}>{part}</span>;
  });
}
