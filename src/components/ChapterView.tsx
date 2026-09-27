import { useEffect, useRef, useState } from "react";
import type { Block, Chapter } from "../data/types";
import { neighbors, partOf } from "../data/book";
import { inline } from "../lib/inline";
import { CodeBlock } from "./CodeBlock";
import { Figure } from "./Figures";
import { Reveal } from "./Reveal";

const NOTE_STYLE = {
  tip: { border: "border-gold-500/40", bg: "bg-gold-500/[0.06]", label: "text-gold-400", tag: "Приём" },
  warn: { border: "border-coral-500/40", bg: "bg-coral-500/[0.06]", label: "text-coral-400", tag: "Осторожно" },
  task: { border: "border-teal-400/40", bg: "bg-teal-400/[0.06]", label: "text-teal-300", tag: "Задача" },
  guru: { border: "border-code-fn/40", bg: "bg-code-fn/[0.06]", label: "text-code-fn", tag: "Мысль гуру" },
} as const;

function NoteIcon({ kind }: { kind: keyof typeof NOTE_STYLE }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "tip")
    return (
      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" width="18" height="18" {...common}>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.8.6 1.5 1.6 1.5 2.6h4c0-1 .7-2 1.5-2.6A6 6 0 0 0 12 3Z" />
      </svg>
    );
  if (kind === "warn")
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" {...common}>
        <path d="M12 3 2.5 20h19L12 3Z" />
        <path d="M12 10v4M12 17.5h.01" />
      </svg>
    );
  if (kind === "task")
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" {...common}>
        <path d="m14 3 7 7-9.5 9.5a2.1 2.1 0 0 1-3 0L4 15a2.1 2.1 0 0 1 0-3L14 3Z" />
        <path d="m11.5 5.5 7 7M3 21h6" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2.5 2.6 3.9 5.6 3.9 9S14.5 18.4 12 21M12 3c-2.5 2.6-3.9 5.6-3.9 9s1.4 6.4 3.9 9M3.5 9.5h17M3.5 14.5h17" />
    </svg>
  );
}

function BlockView({ b, index }: { b: Block; index: number }) {
  switch (b.t) {
    case "p":
      return (
        <Reveal as="div">
          <p className="text-[16px] leading-[1.8] text-ink-200 my-5">{inline(b.x)}</p>
        </Reveal>
      );
    case "h2":
      return (
        <Reveal as="div">
          <h2 className="group flex items-baseline gap-3 font-display font-bold text-[22px] sm:text-2xl text-paper mt-12 mb-4">
            <span className="font-mono text-sm text-gold-500/70 select-none group-hover:text-gold-400 transition-colors">
              §{index}
            </span>
            {inline(b.x)}
          </h2>
        </Reveal>
      );
    case "h3":
      return (
        <Reveal as="div">
          <h3 className="font-display font-bold text-lg text-paper mt-8 mb-3">{inline(b.x)}</h3>
        </Reveal>
      );
    case "code":
      return (
        <Reveal as="div">
          <CodeBlock lang={b.lang} title={b.title} code={b.x} />
        </Reveal>
      );
    case "ul":
      return (
        <Reveal as="div">
          <ul className="my-5 space-y-2.5">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed text-ink-200">
                <svg className="shrink-0 mt-[7px] text-gold-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                <span>{inline(it)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      );
    case "note": {
      const s = NOTE_STYLE[b.kind];
      return (
        <Reveal as="div">
          <aside className={`my-7 rounded-xl border ${s.border} ${s.bg} p-5 sm:p-6`}>
            <div className={`flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase ${s.label}`}>
              <NoteIcon kind={b.kind} />
              {s.tag}
              {b.kind === "task" && <span className="text-ink-500 normal-case tracking-normal">· к концу главы</span>}
            </div>
            {b.title && b.kind !== "task" && (
              <h4 className="font-display font-bold text-paper mt-2.5">{b.title}</h4>
            )}
            <p className="text-[15px] leading-relaxed text-ink-200 mt-2">{inline(b.x)}</p>
          </aside>
        </Reveal>
      );
    }
    case "key":
      return (
        <Reveal as="div">
          <div className="my-10 rounded-xl border border-gold-500/35 bg-gradient-to-br from-gold-500/[0.08] to-transparent p-6 sm:p-7">
            <div className="flex items-center gap-2.5 font-display font-bold text-gold-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 21h8M12 17v4M12 3a6 6 0 0 1 6 6c0 2.2-1.2 3.9-2.5 5-.8.7-1.5 1.2-1.5 2h-4c0-.8-.7-1.3-1.5-2C7.2 12.9 6 11.2 6 9a6 6 0 0 1 6-6Z" />
              </svg>
              Ключевые мысли главы
            </div>
            <ol className="mt-4 space-y-2.5">
              {b.items.map((it, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-paper">
                  <span className="font-mono text-gold-400 shrink-0">{i + 1}.</span>
                  <span>{inline(it)}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      );
    case "figure":
      return <Figure kind={b.kind} caption={b.caption} />;
  }
}

export function ChapterView({
  chapter,
  readSet,
  onMarkRead,
  onOpen,
}: {
  chapter: Chapter;
  readSet: Set<string>;
  onMarkRead: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const part = partOf(chapter.id);
  const { prev, next } = neighbors(chapter.id);
  const isRead = readSet.has(chapter.id);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [reached, setReached] = useState(false);

  useEffect(() => {
    setReached(false);
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setReached(true)),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [chapter.id]);

  useEffect(() => {
    if (reached && !isRead) onMarkRead(chapter.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reached]);

  const partIdx = ["I", "II", "III", "IV"][["p1", "p2", "p3", "p4"].indexOf(part.id)];

  return (
    <article key={chapter.id} className="chapter-in max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-24">
      {/* шапка главы */}
      <header className="border-b border-ink-800 pb-8 mb-2 relative">
        {isRead && (
          <div className="stamp-in absolute -top-2 right-0 sm:right-4 font-display font-black text-[11px] tracking-[0.2em] text-teal-300 border-2 border-teal-400/70 rounded-md px-3 py-1.5 rotate-[-8deg] bg-ink-900/80 select-none">
            ПРОЧИТАНО
          </div>
        )}
        <div className="font-mono text-xs tracking-[0.22em] uppercase text-ink-400">
          Часть {partIdx} · {part.level} <span className="text-ink-600">/</span>{" "}
          <span className="text-gold-400">{part.title}</span>
        </div>
        <h1 className="font-display font-black text-[clamp(1.7rem,4vw,2.7rem)] leading-tight text-paper mt-4">
          <span className="text-ink-500 mr-3">{String(chapter.num).padStart(2, "0")}</span>
          {chapter.title}
        </h1>
        <p className="text-[17px] leading-relaxed text-ink-300 mt-4 max-w-2xl">{chapter.lead}</p>
        <div className="flex flex-wrap items-center gap-4 mt-6 font-mono text-[11px] text-ink-400">
          <span className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            {chapter.minutes} мин чтения
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
            </svg>
            {chapter.blocks.filter((b) => b.t === "code").length} листингов
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            практика в конце
          </span>
        </div>
      </header>

      {/* тело */}
      <div className="chapter-prose">
        {(() => {
          let h = 0;
          return chapter.blocks.map((b, i) => (
            <BlockView key={i} b={b} index={b.t === "h2" ? ++h : h} />
          ));
        })()}
      </div>

      {/* финал главы */}
      <div ref={endRef} className="mt-6">
        <div className="flex flex-wrap items-center gap-4 justify-between rounded-xl border border-ink-700 bg-ink-900/80 p-5 sm:p-6">
          <button
            onClick={() => onMarkRead(chapter.id)}
            disabled={isRead}
            className={`flex items-center gap-2.5 font-display font-bold text-sm px-5 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
              isRead
                ? "bg-teal-400/10 text-teal-300 border border-teal-400/50"
                : "bg-gold-500 text-ink-950 hover:bg-gold-400 hover:-translate-y-0.5 shadow-[0_8px_30px_-8px_rgba(237,163,47,0.5)]"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {isRead ? "Глава прочитана" : "Отметить прочитанной"}
          </button>
          <div className="flex gap-3">
            {prev ? (
              <button
                onClick={() => onOpen(prev.id)}
                className="group flex items-center gap-2 font-mono text-xs text-ink-300 hover:text-paper border border-ink-700 hover:border-ink-500 rounded-lg px-4 py-3 transition-colors cursor-pointer"
              >
                <svg className="transition-transform group-hover:-translate-x-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M11 18l-6-6 6-6" />
                </svg>
                <span className="text-left">
                  <span className="block text-[10px] text-ink-500">гл. {prev.num}</span>
                  {prev.title}
                </span>
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <button
                onClick={() => onOpen(next.id)}
                className="group flex items-center gap-2 font-mono text-xs bg-ink-800 text-paper hover:bg-ink-700 border border-ink-600 rounded-lg px-4 py-3 transition-colors cursor-pointer"
              >
                <span className="text-left">
                  <span className="block text-[10px] text-ink-500">следующая · гл. {next.num}</span>
                  {next.title}
                </span>
                <svg className="transition-transform group-hover:translate-x-0.5 text-gold-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {!next && (
          <div className="mt-8 rounded-xl border border-gold-500/40 bg-gold-500/[0.07] p-7 text-center">
            <div className="font-display font-black text-2xl text-gold-300">Книга прочитана. Гуру — это вы.</div>
            <p className="text-ink-300 mt-2 text-sm">
              Теперь соберите свою «Аттестацию» без подсказок — это лучший экзамен.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
