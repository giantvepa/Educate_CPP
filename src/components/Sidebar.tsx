import { useMemo, useState } from "react";
import { parts } from "../data/book";

const ACCENT = [
  { dot: "bg-gold-400", text: "text-gold-400", ring: "group-hover:bg-gold-400/15" },
  { dot: "bg-teal-300", text: "text-teal-300", ring: "group-hover:bg-teal-400/15" },
  { dot: "bg-coral-400", text: "text-coral-400", ring: "group-hover:bg-coral-400/15" },
  { dot: "bg-code-fn", text: "text-code-fn", ring: "group-hover:bg-code-fn/15" },
];

export function Sidebar({
  currentId,
  readSet,
  onOpen,
  onCloseMobile,
}: {
  currentId: string;
  readSet: Set<string>;
  onOpen: (id: string) => void;
  onCloseMobile?: () => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      parts.map((p, pi) => ({
        part: p,
        pi,
        chapters: p.chapters.filter(
          (c) =>
            !q ||
            c.title.toLowerCase().includes(q) ||
            c.lead.toLowerCase().includes(q) ||
            String(c.num).includes(q)
        ),
      })),
    [q]
  );

  return (
    <aside className="h-full flex flex-col bg-ink-900/70 border-r border-ink-800">
      <div className="p-4 border-b border-ink-800">
        <label className="relative block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти главу…"
            className="w-full bg-ink-850 border border-ink-700 focus:border-gold-500/60 outline-none rounded-lg pl-9 pr-3 py-2.5 text-sm text-paper placeholder:text-ink-500 font-mono transition-colors"
          />
        </label>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {filtered.map(({ part, pi, chapters }) =>
          chapters.length === 0 ? null : (
            <div key={part.id} className="mb-5">
              <div className="flex items-center gap-2 px-2 mb-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${ACCENT[pi].dot}`} />
                <span className={`font-display text-[11px] font-bold tracking-[0.14em] uppercase ${ACCENT[pi].text}`}>
                  {part.level} · {part.title}
                </span>
              </div>
              <ul className="space-y-0.5">
                {chapters.map((c) => {
                  const active = c.id === currentId;
                  const read = readSet.has(c.id);
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          onOpen(c.id);
                          onCloseMobile?.();
                        }}
                        className={`group w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150 cursor-pointer ${
                          active
                            ? "bg-ink-800 text-paper shadow-[inset_2px_0_0_0_#eda32f]"
                            : `text-ink-300 hover:text-paper ${ACCENT[pi].ring}`
                        }`}
                      >
                        <span
                          className={`w-6 h-6 shrink-0 grid place-items-center rounded-md border font-mono text-[10.5px] transition-colors ${
                            read
                              ? "border-teal-400/60 text-teal-300 bg-teal-400/10"
                              : active
                              ? "border-gold-500/60 text-gold-300"
                              : "border-ink-700 text-ink-500"
                          }`}
                        >
                          {read ? (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          ) : (
                            c.num
                          )}
                        </span>
                        <span className={`text-[13px] leading-snug ${active ? "font-semibold" : ""}`}>
                          {c.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )
        )}
        {filtered.every((f) => f.chapters.length === 0) && (
          <p className="px-3 py-6 text-sm text-ink-400 font-mono">Ничего не нашлось по «{query}»</p>
        )}
      </nav>

      <div className="p-4 border-t border-ink-800 font-mono text-[11px] text-ink-500 leading-relaxed">
        Прочитано {readSet.size} из {parts.reduce((s, p) => s + p.chapters.length, 0)} глав.
        Прогресс хранится в вашем браузере.
      </div>
    </aside>
  );
}
