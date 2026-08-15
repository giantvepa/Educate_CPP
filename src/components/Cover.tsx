import { useEffect, useMemo, useState } from "react";
import { parts, totalChapters, totalMinutes, codeCount, chapters } from "../data/book";
import { Reveal } from "./Reveal";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- scramble-decode заголовка ---------- */
const GLYPHS = "{}[]()<>=+*/#&$@%!?;:01АТТЕСТАЦИЯQTC++";

function useScramble(text: string, start: boolean) {
  const [out, setOut] = useState(() => (reduced() ? text : ""));
  useEffect(() => {
    if (!start) return;
    if (reduced()) {
      setOut(text);
      return;
    }
    let frame = 0;
    const total = 34;
    const id = setInterval(() => {
      frame++;
      const fixed = Math.floor((frame / total) * text.length);
      let s = text.slice(0, fixed);
      for (let i = fixed; i < text.length; i++) {
        s += text[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (frame >= total) {
        setOut(text);
        clearInterval(id);
      }
    }, 42);
    return () => clearInterval(id);
  }, [text, start]);
  return out;
}

/* ---------- печатающееся окно кода ---------- */
const COVER_SNIPPET = `// attestation_service.cpp — глава 19
bool SessionService::grade(int emp, int score)
{
    if (score < 1 || score > 5)
        return false;              // правило одно для всех
    if (state_ != State::Active)
        return false;

    db_.transaction();             // всё или ничего
    ...
    db_.commit();
    emit resultsChanged();
    return true;
}`;

function TypingCode() {
  const [n, setN] = useState(() => (reduced() ? COVER_SNIPPET.length : 0));
  useEffect(() => {
    if (reduced()) return;
    const id = setInterval(() => {
      setN((v) => {
        if (v >= COVER_SNIPPET.length) {
          clearInterval(id);
          return v;
        }
        return v + 2;
      });
    }, 26);
    return () => clearInterval(id);
  }, []);
  const text = COVER_SNIPPET.slice(0, n);
  const lines = text.split("\n");
  return (
    <div className="font-mono text-[12.5px] leading-[1.75] text-code-plain min-h-[300px]">
      {lines.map((ln, i) => (
        <div key={i} className="flex">
          <span className="w-8 shrink-0 text-right pr-3 text-ink-600 select-none">{i + 1}</span>
          <span className="whitespace-pre">{ln}</span>
        </div>
      ))}
      {n < COVER_SNIPPET.length && <span className="caret ml-8" />}
    </div>
  );
}

/* ---------- иконки уровней ---------- */
function LevelIcon({ i, className = "" }: { i: number; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (i === 0)
    return (
      <svg viewBox="0 0 24 24" className={className} {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 8.5h18M6 6.2h.01M8.5 6.2h.01" />
        <path d="M8 13l-2 2 2 2M16 13l2 2-2 2M13 12.5l-2 5" />
      </svg>
    );
  if (i === 1)
    return (
      <svg viewBox="0 0 24 24" className={className} {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
    );
  if (i === 2)
    return (
      <svg viewBox="0 0 24 24" className={className} {...common}>
        <ellipse cx="12" cy="5.5" rx="8" ry="3" />
        <path d="M4 5.5v13c0 1.66 3.58 3 8 3s8-1.34 8-3v-13" />
        <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.9 5.6 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.6-3.9-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

const ACCENT_TEXT = ["text-gold-400", "text-teal-300", "text-coral-400", "text-code-fn"];
const ACCENT_BORDER = ["border-gold-500/50", "border-teal-400/50", "border-coral-400/50", "border-code-fn/50"];

export function Cover({
  onOpen,
  readSet,
}: {
  onOpen: (chapterId: string) => void;
  readSet: Set<string>;
}) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 120);
    return () => clearTimeout(t);
  }, []);

  const l1 = useScramble("C++: ОТ УЧЕНИКА", go);
  const l2 = useScramble("ДО ГУРУ", go);

  const done = readSet.size;
  const pct = Math.round((done / totalChapters) * 100);
  const nextChapter = useMemo(
    () => chapters.find((c) => !readSet.has(c.id)),
    [readSet]
  );

  const hours = Math.round(totalMinutes / 60);
  const stats: [string, string][] = [
    [String(totalChapters), "глав"],
    [String(codeCount), "листингов кода"],
    [String(parts.length), "ступени роста"],
    [`~${hours} ч`, "чтения и кода"],
  ];

  const features: { t: string; d: string }[] = [
    { t: "Один проект на всю книгу", d: "Система «Аттестация» растёт от QWidget до REST-сервиса: каждая глава добавляет этаж, а не выбрасывает предыдущий." },
    { t: "Код, который запускается", d: "Каждый листинг копируется одной кнопкой и собирается CMake-ом. Никаких «упражнений для самопроверки» из воздуха." },
    { t: "Задача в конце главы", d: "Теория оседает только в пальцах: маленькое, конкретное задание закрепляет приём до следующей главы." },
    { t: "От кнопки до архитектуры", d: "Сигналы и слоты, Model–View, транзакции, слои Dao/Service, конечные автоматы — путь, который проходят в боевых проектах." },
    { t: "Без воды", d: "Полстраницы теории — и сразу к коду. Каждая глава укладывается в 8–18 минут чтения." },
  ];

  return (
    <div className="relative">
      {/* ============ ТИТУЛ ============ */}
      <header className="relative min-h-screen flex flex-col">
        <nav className="flex items-center gap-4 px-6 sm:px-10 lg:px-16 h-16 border-b border-ink-800/80">
          <span className="flex items-center gap-2.5">
            <span className="w-8 h-8 grid place-items-center rounded-lg bg-gold-500 text-ink-950 font-mono font-bold text-sm shadow-[0_0_24px_rgba(237,163,47,0.35)]">
              ++
            </span>
            <span className="font-display text-[13px] tracking-[0.18em] text-paper-dim">
              C++·ГУРУ
            </span>
          </span>
          <span className="hidden sm:block h-4 w-px bg-ink-700" />
          <span className="hidden sm:block font-mono text-xs text-ink-400">
            интерактивная книга · сквозной проект «Аттестация»
          </span>
          <button
            onClick={() => onOpen(nextChapter?.id ?? "ch01")}
            className="ml-auto font-mono text-xs px-3.5 py-1.5 rounded-md border border-ink-600 text-ink-200 hover:text-ink-950 hover:bg-gold-400 hover:border-gold-400 transition-colors duration-200 cursor-pointer"
          >
            {done > 0 ? `продолжить · гл. ${nextChapter?.num ?? 1}` : "начать чтение"}
          </button>
        </nav>

        <div className="flex-1 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 px-6 sm:px-10 lg:px-16 py-12 lg:py-16 max-w-[1400px] w-full mx-auto">
          {/* левая колонка */}
          <div className="flex flex-col justify-center">
            <Reveal className="flex flex-wrap items-center gap-2.5 mb-7">
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-gold-400 border border-gold-500/40 rounded-full px-3 py-1 bg-gold-500/5">
                книга-практикум
              </span>
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-300 border border-ink-700 rounded-full px-3 py-1">
                Qt 6 · CMake · SQLite · REST
              </span>
            </Reveal>

            <h1 className="font-display font-black text-[clamp(2rem,5.4vw,4.3rem)] leading-[1.06] tracking-tight">
              <span className="block text-paper">{l1 || "\u00A0"}</span>
              <span className="block text-gold-400 drop-shadow-[0_0_36px_rgba(237,163,47,0.35)]">
                {l2 || "\u00A0"}
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink-200">
              Путь длиной в одну систему — <em className="not-italic text-gold-300">«Аттестацию
              сотрудников»</em>. Начнём с первого окна и кнопки, соберём гриды и деревья отделов,
              посадим данные в SQLite — и закончим REST-сервером на C++ с веб-интерфейсом.
              Понятным языком. Без воды. С кодом, который запускается.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpen(nextChapter?.id ?? "ch01")}
                className="group flex items-center gap-3 bg-gold-500 hover:bg-gold-400 text-ink-950 font-display font-bold text-sm tracking-wide px-7 py-4 rounded-lg transition-all duration-200 hover:-translate-y-0.5 shadow-[0_10px_40px_-10px_rgba(237,163,47,0.6)] cursor-pointer"
              >
                {done > 0 ? `Продолжить: глава ${nextChapter?.num}` : "Открыть главу 1"}
                <svg className="transition-transform duration-200 group-hover:translate-x-1" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <a
                href="#contents"
                className="font-mono text-sm text-ink-200 border-b border-dashed border-ink-600 hover:border-gold-400 hover:text-gold-300 transition-colors pb-0.5"
              >
                к оглавлению ↓
              </a>
            </div>

            {/* статистика */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink-800 rounded-xl overflow-hidden border border-ink-800 max-w-2xl">
              {stats.map(([v, l], i) => (
                <div key={l} className="bg-ink-900/90 px-5 py-4 hover:bg-ink-850 transition-colors">
                  <div className={`font-display font-bold text-2xl ${["text-gold-400", "text-teal-300", "text-coral-400", "text-code-fn"][i]}`}>
                    {v}
                  </div>
                  <div className="font-mono text-[11px] text-ink-400 mt-1 uppercase tracking-wider">{l}</div>
                </div>
              ))}
            </div>

            {done > 0 && (
              <div className="mt-8 max-w-2xl">
                <div className="flex justify-between font-mono text-xs text-ink-300 mb-2">
                  <span>ваш прогресс</span>
                  <span className="text-teal-300">{done} / {totalChapters} · {pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-300 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* правая колонка: окно кода + лестница */}
          <div className="flex flex-col gap-6 justify-center">
            <Reveal delay={150}>
              <div className="rounded-xl border border-ink-700 bg-ink-900/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
                <div className="flex items-center gap-2 px-4 h-10 border-b border-ink-700/80 bg-ink-850">
                  <i className="w-2.5 h-2.5 rounded-full bg-coral-500/80" />
                  <i className="w-2.5 h-2.5 rounded-full bg-gold-500/80" />
                  <i className="w-2.5 h-2.5 rounded-full bg-teal-400/80" />
                  <span className="ml-2 font-mono text-[11px] text-ink-400">attestation — main.cpp</span>
                  <span className="ml-auto font-mono text-[10px] text-teal-400/80 flex items-center gap-1.5">
                    <i className="w-1.5 h-1.5 rounded-full bg-teal-400 pulse-glow" />
                    собирается
                  </span>
                </div>
                <div className="p-4">
                  <TypingCode />
                </div>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {parts.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => onOpen(p.chapters[0].id)}
                    className={`group text-left rounded-lg border ${ACCENT_BORDER[i]} bg-ink-900/80 px-3 py-3 transition-all duration-200 hover:-translate-y-1 hover:bg-ink-850 cursor-pointer`}
                  >
                    <LevelIcon i={i} className={`w-5 h-5 ${ACCENT_TEXT[i]}`} />
                    <div className="mt-2 font-display text-[11px] font-bold tracking-wide text-paper">
                      {p.level}
                    </div>
                    <div className="font-mono text-[10px] text-ink-400 mt-0.5">{p.levelSub}</div>
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        <div className="flex justify-center pb-6">
          <svg className="w-5 h-8 text-ink-500 float-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#54719a" }}>
            <path d="M12 3v18M6 15l6 6 6-6" />
          </svg>
        </div>
      </header>

      {/* ============ ЧАСТИ КНИГИ ============ */}
      <section className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto py-20">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="font-mono text-xs tracking-[0.25em] uppercase text-teal-300 mb-3">// маршрут</div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-paper">
                Четыре ступени — одна система
              </h2>
            </div>
            <p className="max-w-md text-sm text-ink-300 leading-relaxed">
              Каждая часть надстраивает предыдущую. Кнопка из главы 3 в главе 13 уже пишет в базу,
              а в главе 17 — отправляет JSON на сервер.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          {parts.map((p, i) => {
            const doneInPart = p.chapters.filter((c) => readSet.has(c.id)).length;
            return (
              <Reveal key={p.id} delay={i * 90}>
                <article
                  className={`group relative rounded-xl border border-ink-700 bg-ink-900/85 p-6 sm:p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-ink-600 hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]`}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{
                      background:
                        i === 0 ? "linear-gradient(90deg,#eda32f,transparent 70%)"
                        : i === 1 ? "linear-gradient(90deg,#3fd8c2,transparent 70%)"
                        : i === 2 ? "linear-gradient(90deg,#f27059,transparent 70%)"
                        : "linear-gradient(90deg,#8ab8ff,transparent 70%)",
                    }}
                  />
                  <div className="flex items-start gap-4">
                    <span className={`mt-1 ${ACCENT_TEXT[i]}`}>
                      <LevelIcon i={i} className="w-7 h-7" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className={`font-display font-black text-xl ${ACCENT_TEXT[i]}`}>
                          {["I", "II", "III", "IV"][i]} · {p.level}
                        </span>
                        <span className="font-mono text-[11px] text-ink-400">{p.levelSub}</span>
                        {doneInPart > 0 && (
                          <span className="font-mono text-[10px] text-teal-300 border border-teal-400/40 rounded-full px-2 py-px">
                            {doneInPart}/{p.chapters.length} прочитано
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-lg text-paper mt-1">{p.title}</h3>
                      <p className="text-sm text-ink-300 leading-relaxed mt-2">{p.desc}</p>
                      <button
                        onClick={() => onOpen(p.chapters[0].id)}
                        className={`mt-4 inline-flex items-center gap-2 font-mono text-xs ${ACCENT_TEXT[i]} hover:gap-3 transition-all duration-200 cursor-pointer`}
                      >
                        читать часть
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ ОГЛАВЛЕНИЕ ============ */}
      <section id="contents" className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto py-16 scroll-mt-8">
        <Reveal>
          <div className="font-mono text-xs tracking-[0.25em] uppercase text-gold-400 mb-3">// оглавление</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-paper mb-10">
            20 глав, ни одной лишней
          </h2>
        </Reveal>
        <div className="grid lg:grid-cols-2 gap-x-10 gap-y-2">
          {chapters.map((c, i) => (
            <Reveal key={c.id} delay={(i % 8) * 40}>
              <button
                onClick={() => onOpen(c.id)}
                className="group w-full text-left flex items-baseline gap-4 py-3 border-b border-ink-800 hover:border-ink-600 transition-colors cursor-pointer"
              >
                <span className={`font-mono text-sm shrink-0 w-9 ${readSet.has(c.id) ? "text-teal-300" : "text-ink-500 group-hover:text-gold-400"} transition-colors`}>
                  {readSet.has(c.id) ? "✓" : String(c.num).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-paper group-hover:text-gold-300 transition-colors leading-snug">
                    {c.title}
                  </span>
                  <span className="block text-[13px] text-ink-400 truncate mt-0.5">{c.lead}</span>
                </span>
                <span className="ml-auto font-mono text-[11px] text-ink-500 shrink-0 pl-3">
                  {c.minutes} мин
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ КАК УСТРОЕНА ============ */}
      <section className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto py-20">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
          <div className="lg:sticky lg:top-24 self-start">
            <Reveal>
              <div className="font-mono text-xs tracking-[0.25em] uppercase text-coral-400 mb-3">// метод</div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-paper leading-tight">
                Почему так,
                <br />
                а не иначе
              </h2>
              <p className="mt-6 text-ink-300 leading-relaxed max-w-md">
                Книга написана как разговор старшего коллеги: минимум определений, максимум
                «смотри, что происходит». Прогресс сохраняется в браузере — можно закрыть на главе 7
                и вернуться через месяц.
              </p>
              <div className="mt-8 flex items-center gap-3 font-mono text-xs text-ink-400">
                <kbd>←</kbd>
                <kbd>→</kbd>
                <span>— листать главы в режиме чтения</span>
              </div>
            </Reveal>
          </div>
          <div className="space-y-4">
            {features.map((f, i) => (
              <Reveal key={f.t} delay={i * 70}>
                <div className="group flex gap-5 rounded-xl border border-ink-800 bg-ink-900/70 p-5 sm:p-6 hover:border-ink-600 hover:bg-ink-850 transition-all duration-300">
                  <span className="font-display font-black text-2xl text-ink-600 group-hover:text-gold-400 transition-colors w-10 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-paper">{f.t}</h3>
                    <p className="text-sm text-ink-300 leading-relaxed mt-1.5">{f.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ПОДВАЛ ============ */}
      <footer className="border-t border-ink-800 mt-10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10 flex flex-wrap items-center gap-6 justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 grid place-items-center rounded-md bg-gold-500 text-ink-950 font-mono font-bold text-xs">++</span>
            <span className="font-mono text-xs text-ink-400">
              «C++: от ученика до гуру» · написано и свёрстано как одна книга
            </span>
          </div>
          <button
            onClick={() => onOpen(nextChapter?.id ?? "ch01")}
            className="font-mono text-xs text-gold-400 hover:text-gold-300 border border-gold-500/40 hover:border-gold-400 rounded-md px-4 py-2 transition-colors cursor-pointer"
          >
            {done > 0 ? "вернуться к чтению →" : "начать с главы 1 →"}
          </button>
        </div>
      </footer>
    </div>
  );
}
