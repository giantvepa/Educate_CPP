import type { ReactNode } from "react";

/**
 * Разбор инлайн-разметки текста:
 *   **жирный**, `код`, «цитата»
 */
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|«[^»]+»)/g;

export function inline(text: string): ReactNode[] {
  const parts = text.split(TOKEN);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-paper">
          {p.slice(2, -2)}
        </strong>
      );
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code
          key={i}
          className="font-mono text-[0.86em] px-[0.35em] py-[0.1em] rounded-[5px] bg-ink-800 border border-ink-700 text-teal-300 whitespace-nowrap"
        >
          {p.slice(1, -1)}
        </code>
      );
    if (p.startsWith("«") && p.endsWith("»"))
      return (
        <em key={i} className="not-italic text-gold-300">
          {p}
        </em>
      );
    return <span key={i}>{p}</span>;
  });
}
