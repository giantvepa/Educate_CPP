import { useState } from "react";
import type { Lang } from "../data/types";
import { highlight } from "../lib/highlight";

const LANG_LABEL: Record<Lang, string> = {
  cpp: "C++",
  sql: "SQL",
  cmake: "CMake",
  bash: "bash",
  json: "JSON",
  html: "HTML",
};

const LANG_COLOR: Record<Lang, string> = {
  cpp: "text-gold-400 border-gold-500/40",
  sql: "text-teal-300 border-teal-400/40",
  cmake: "text-code-pre border-code-pre/40",
  bash: "text-ink-200 border-ink-600",
  json: "text-code-num border-code-num/40",
  html: "text-coral-400 border-coral-400/40",
};

export function CodeBlock({
  lang,
  title,
  code,
}: {
  lang: Lang;
  title?: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <figure className="group/code my-7 rounded-xl border border-ink-700 bg-ink-900/90 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 hover:border-ink-600 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] hover:-translate-y-0.5">
      <figcaption className="flex items-center gap-3 px-4 h-11 border-b border-ink-700/80 bg-ink-850">
        <span className="flex gap-1.5" aria-hidden>
          <i className="w-2.5 h-2.5 rounded-full bg-coral-500/70" />
          <i className="w-2.5 h-2.5 rounded-full bg-gold-500/70" />
          <i className="w-2.5 h-2.5 rounded-full bg-teal-400/70" />
        </span>
        <span
          className={`font-mono text-[11px] tracking-wider uppercase border rounded px-1.5 py-px ${LANG_COLOR[lang]}`}
        >
          {LANG_LABEL[lang]}
        </span>
        {title && (
          <span className="font-mono text-xs text-ink-300 truncate">{title}</span>
        )}
        <button
          onClick={copy}
          className={`ml-auto flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-md border transition-all duration-200 cursor-pointer ${
            copied
              ? "border-teal-400/60 text-teal-300 bg-teal-400/10"
              : "border-ink-600 text-ink-300 hover:text-paper hover:border-ink-400 hover:bg-ink-800"
          }`}
          aria-label="Скопировать код"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              скопировано
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              копировать
            </>
          )}
        </button>
      </figcaption>
      <pre className="p-4 overflow-x-auto text-[13px] leading-[1.7] font-mono">
        <code className="text-code-plain">{highlight(code, lang)}</code>
      </pre>
    </figure>
  );
}
