import { useCallback, useEffect, useState } from "react";
import { chapterById, chapters, neighbors, totalChapters } from "./data/book";
import { Cover } from "./components/Cover";
import { Sidebar } from "./components/Sidebar";
import { ChapterView } from "./components/ChapterView";

const LS_KEY = "cpp-guru-book-read-v1";

function loadRead(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

export default function App() {
  const [view, setView] = useState<"cover" | "read">("cover");
  const [currentId, setCurrentId] = useState("ch01");
  const [readSet, setReadSet] = useState<Set<string>>(loadRead);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...readSet]));
    } catch {
      /* ignore */
    }
  }, [readSet]);

  const openChapter = useCallback((id: string) => {
    setCurrentId(id);
    setView("read");
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const markRead = useCallback((id: string) => {
    setReadSet((s) => {
      if (s.has(id)) return s;
      const n = new Set(s);
      n.add(id);
      return n;
    });
  }, []);

  const chapter = chapterById(currentId) ?? chapters[0];
  const { prev, next } = neighbors(chapter.id);

  /* клавиатура: ← → листают главы в режиме чтения */
  useEffect(() => {
    if (view !== "read") return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "ArrowRight" && next) openChapter(next.id);
      if (e.key === "ArrowLeft" && prev) openChapter(prev.id);
      if (e.key === "Escape") setMobileNav(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, next, prev, openChapter]);

  const pct = Math.round((readSet.size / totalChapters) * 100);

  return (
    <div className="bg-blueprint min-h-screen text-paper">
      <div className="bg-grid-lines fixed inset-0 pointer-events-none" aria-hidden />
      <div className="noise-overlay" aria-hidden />

      {view === "cover" ? (
        <div className="relative z-10">
          <Cover onOpen={openChapter} readSet={readSet} />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* ---------- шапка читалки ---------- */}
          <header className="sticky top-0 z-40 bg-ink-950/90 backdrop-blur border-b border-ink-800">
            <div className="flex items-center gap-3 h-14 px-4 sm:px-6">
              <button
                onClick={() => setMobileNav((v) => !v)}
                className="lg:hidden p-2 -ml-1 rounded-md border border-ink-700 text-ink-300 hover:text-paper hover:border-ink-500 transition-colors cursor-pointer"
                aria-label="Оглавление"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h10" />
                </svg>
              </button>

              <button
                onClick={() => {
                  setView("cover");
                  window.scrollTo({ top: 0 });
                }}
                className="flex items-center gap-2.5 group cursor-pointer"
                title="К обложке"
              >
                <span className="w-7 h-7 grid place-items-center rounded-md bg-gold-500 text-ink-950 font-mono font-bold text-xs group-hover:bg-gold-400 transition-colors">
                  ++
                </span>
                <span className="hidden sm:block font-display text-xs font-bold tracking-[0.14em] text-paper-dim group-hover:text-paper transition-colors">
                  ОТ УЧЕНИКА ДО ГУРУ
                </span>
              </button>

              <span className="hidden md:block h-4 w-px bg-ink-700 mx-1" />
              <span className="hidden md:block font-mono text-xs text-ink-400 truncate">
                глава {chapter.num} · {chapter.title}
              </span>

              <div className="ml-auto flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-ink-400">
                  <span className="text-teal-300">{readSet.size}/{totalChapters}</span>
                  <div className="w-24 h-1.5 rounded-full bg-ink-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-gold-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span>{pct}%</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => prev && openChapter(prev.id)}
                    disabled={!prev}
                    className="p-2 rounded-md border border-ink-700 text-ink-300 enabled:hover:text-paper enabled:hover:border-ink-500 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="Предыдущая глава"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => next && openChapter(next.id)}
                    disabled={!next}
                    className="p-2 rounded-md border border-ink-700 text-ink-300 enabled:hover:text-paper enabled:hover:border-ink-500 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="Следующая глава"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="h-[3px] bg-ink-800">
              <div
                className="h-full bg-gradient-to-r from-gold-500 via-gold-400 to-teal-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </header>

          {/* ---------- тело ---------- */}
          <div className="flex-1 flex max-w-[1500px] w-full mx-auto">
            {/* сайдбар: десктоп */}
            <div className="hidden lg:block w-[320px] shrink-0">
              <div className="sticky top-[59px] h-[calc(100vh-59px)]">
                <Sidebar currentId={currentId} readSet={readSet} onOpen={openChapter} />
              </div>
            </div>

            {/* сайдбар: мобильный */}
            {mobileNav && (
              <div className="lg:hidden fixed inset-0 z-50">
                <button
                  className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
                  onClick={() => setMobileNav(false)}
                  aria-label="Закрыть оглавление"
                />
                <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] shadow-2xl">
                  <Sidebar
                    currentId={currentId}
                    readSet={readSet}
                    onOpen={openChapter}
                    onCloseMobile={() => setMobileNav(false)}
                  />
                </div>
              </div>
            )}

            <main className="flex-1 min-w-0">
              <ChapterView
                chapter={chapter}
                readSet={readSet}
                onMarkRead={markRead}
                onOpen={openChapter}
              />
            </main>
          </div>

          <footer className="border-t border-ink-800">
            <div className="max-w-[1500px] mx-auto px-6 py-6 flex flex-wrap gap-4 items-center justify-between font-mono text-[11px] text-ink-500">
              <span>«C++: от ученика до гуру» · сквозной проект «Аттестация»</span>
              <span>
                <kbd>←</kbd> <kbd>→</kbd> — листать главы · прогресс: {readSet.size}/{totalChapters}
              </span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
