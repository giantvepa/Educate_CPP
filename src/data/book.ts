import type { Chapter, Part } from "./types";
import { part1 } from "./part1";
import { part2 } from "./part2";
import { part3 } from "./part3";
import { part4 } from "./part4";

export const parts: Part[] = [part1, part2, part3, part4];

export const chapters: Chapter[] = parts.flatMap((p) => p.chapters);

export const totalChapters = chapters.length;

export const totalMinutes = chapters.reduce((s, c) => s + c.minutes, 0);

export const codeCount = chapters.reduce(
  (s, c) => s + c.blocks.filter((b) => b.t === "code").length,
  0
);

export function chapterById(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}

export function partOf(chapterId: string): Part {
  return parts.find((p) => p.chapters.some((c) => c.id === chapterId)) ?? parts[0];
}

export function neighbors(chapterId: string): { prev?: Chapter; next?: Chapter } {
  const i = chapters.findIndex((c) => c.id === chapterId);
  return { prev: chapters[i - 1], next: chapters[i + 1] };
}
