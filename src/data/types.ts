export type Lang = "cpp" | "sql" | "cmake" | "bash" | "json" | "html";

export type Block =
  | { t: "p"; x: string }
  | { t: "h2"; x: string }
  | { t: "h3"; x: string }
  | { t: "code"; lang: Lang; title?: string; x: string }
  | { t: "ul"; items: string[] }
  | { t: "note"; kind: "tip" | "warn" | "task" | "guru"; title: string; x: string }
  | { t: "key"; items: string[] }
  | { t: "figure"; kind: "layers" | "web" | "flow"; caption: string };

export interface Chapter {
  id: string;
  num: number;
  title: string;
  lead: string;
  minutes: number;
  blocks: Block[];
}

export interface Part {
  id: string;
  level: string;
  levelSub: string;
  title: string;
  desc: string;
  accent: "gold" | "teal" | "coral" | "blue";
  chapters: Chapter[];
}
