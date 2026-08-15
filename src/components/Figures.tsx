import { Reveal } from "./Reveal";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Reveal as="figure" className="my-8">
      <div className="rounded-xl border border-ink-700 bg-ink-900/80 p-4 sm:p-6 overflow-x-auto">
        {children}
      </div>
    </Reveal>
  );
}

const mono = { fontFamily: "JetBrains Mono, monospace" } as const;

/* Эволюция проекта: окно → грид/дерево → база → веб */
function FlowFigure() {
  const stages = [
    { t: "QWidget", s: "окно и кнопки", c: "#f6bc4f" },
    { t: "View+Model", s: "грид и дерево", c: "#3fd8c2" },
    { t: "SQLite", s: "данные и SQL", c: "#f27059" },
    { t: "REST + Web", s: "сервер и браузер", c: "#8ab8ff" },
  ];
  return (
    <Frame>
      <svg viewBox="0 0 860 150" className="w-full min-w-[640px]" role="img" aria-label="Эволюция проекта от окна до веб-сервиса">
        {stages.map((st, i) => {
          const x = 20 + i * 210;
          return (
            <g key={st.t}>
              <rect x={x} y={30} width={176} height={84} rx={12} fill="#101b2c" stroke={st.c} strokeWidth="1.4" />
              <circle cx={x + 22} cy={52} r={5} fill={st.c} />
              <text x={x + 38} y={57} fill="#ece7da" fontSize="15" fontWeight="700" style={mono}>
                {i + 1}. {st.t}
              </text>
              <text x={x + 22} y={88} fill="#a9bcd6" fontSize="13" style={mono}>
                {st.s}
              </text>
              {i < stages.length - 1 && (
                <path
                  d={`M ${x + 176} 72 H ${x + 210}`}
                  stroke="#54719a"
                  strokeWidth="2"
                  className="dash-flow"
                  fill="none"
                />
              )}
            </g>
          );
        })}
        <text x={20} y={142} fill="#7d97ba" fontSize="12" style={mono}>
          главы 1–5 ···· 6–10 ···· 11–15 ···· 16–20 — один проект, четыре возраста
        </text>
      </svg>
    </Frame>
  );
}

/* Слои: UI → Service → Dao → SQLite */
function LayersFigure() {
  const layers = [
    { t: "UI · Qt Widgets / веб-страница", s: "показывает и слушает", c: "#f6bc4f", w: 760 },
    { t: "Service · AttestationService", s: "правила: оценки 1–5, статусы сессий", c: "#3fd8c2", w: 620 },
    { t: "Dao · EmployeeDao, SessionDao", s: "единственный, кто пишет SQL", c: "#f27059", w: 480 },
    { t: "SQLite · attestation.db", s: "файл базы с ограничениями", c: "#8ab8ff", w: 340 },
  ];
  return (
    <Frame>
      <svg viewBox="0 0 860 300" className="w-full min-w-[560px]" role="img" aria-label="Слои приложения: интерфейс, сервис, Dao, база">
        {layers.map((l, i) => {
          const y = 14 + i * 72;
          const x = (860 - l.w) / 2;
          return (
            <g key={l.t}>
              <rect x={x} y={y} width={l.w} height={52} rx={10} fill="#101b2c" stroke={l.c} strokeWidth="1.4" />
              <text x={x + 20} y={y + 23} fill="#ece7da" fontSize="14" fontWeight="700" style={mono}>
                {l.t}
              </text>
              <text x={x + 20} y={y + 41} fill="#7d97ba" fontSize="12" style={mono}>
                {l.s}
              </text>
              {i < layers.length - 1 && (
                <path
                  d={`M 430 ${y + 52} V ${y + 72}`}
                  stroke="#54719a"
                  strokeWidth="2"
                  className="dash-flow"
                  fill="none"
                />
              )}
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

/* Веб-топология: два клиента → API → SQLite */
function WebFigure() {
  return (
    <Frame>
      <svg viewBox="0 0 860 260" className="w-full min-w-[560px]" role="img" aria-label="Браузер и десктоп обращаются к REST API, а он — к SQLite">
        {/* clients */}
        <rect x={40} y={30} width={210} height={70} rx={12} fill="#101b2c" stroke="#8ab8ff" strokeWidth="1.4" />
        <text x={62} y={60} fill="#ece7da" fontSize="14" fontWeight="700" style={mono}>Браузер</text>
        <text x={62} y={82} fill="#7d97ba" fontSize="12" style={mono}>fetch → JSON</text>

        <rect x={40} y={150} width={210} height={70} rx={12} fill="#101b2c" stroke="#f6bc4f" strokeWidth="1.4" />
        <text x={62} y={180} fill="#ece7da" fontSize="14" fontWeight="700" style={mono}>Десктоп · Qt</text>
        <text x={62} y={202} fill="#7d97ba" fontSize="12" style={mono}>QNetworkAccessManager</text>

        {/* api */}
        <rect x={330} y={88} width={220} height={84} rx={12} fill="#152236" stroke="#3fd8c2" strokeWidth="1.6" />
        <text x={352} y={120} fill="#ece7da" fontSize="15" fontWeight="700" style={mono}>attestation-api</text>
        <text x={352} y={142} fill="#7d97ba" fontSize="12" style={mono}>C++ · cpp-httplib</text>
        <text x={352} y={160} fill="#7d97ba" fontSize="12" style={mono}>Service + Dao</text>

        {/* db */}
        <rect x={630} y={88} width={190} height={84} rx={12} fill="#101b2c" stroke="#f27059" strokeWidth="1.4" />
        <ellipse cx={725} cy={104} rx={70} ry={10} fill="none" stroke="#f27059" strokeWidth="1.2" />
        <text x={652} y={140} fill="#ece7da" fontSize="14" fontWeight="700" style={mono}>SQLite</text>
        <text x={652} y={160} fill="#7d97ba" fontSize="12" style={mono}>attestation.db</text>

        {/* arrows */}
        <path d="M 250 65 C 300 75, 305 105, 330 118" stroke="#8ab8ff" strokeWidth="1.8" className="dash-flow" fill="none" />
        <path d="M 250 185 C 300 175, 305 150, 330 142" stroke="#f6bc4f" strokeWidth="1.8" className="dash-flow" fill="none" />
        <path d="M 550 130 H 630" stroke="#3fd8c2" strokeWidth="1.8" className="dash-flow" fill="none" />
        <text x={330} y={240} fill="#7d97ba" fontSize="12" style={mono}>
          один сервис — два клиента; правила живут в Service, а не в клиентах
        </text>
      </svg>
    </Frame>
  );
}

export function Figure({ kind, caption }: { kind: "layers" | "web" | "flow"; caption: string }) {
  return (
    <div>
      {kind === "flow" && <FlowFigure />}
      {kind === "layers" && <LayersFigure />}
      {kind === "web" && <WebFigure />}
      <p className="-mt-5 mb-8 text-sm text-ink-300 pl-1">{caption}</p>
    </div>
  );
}
