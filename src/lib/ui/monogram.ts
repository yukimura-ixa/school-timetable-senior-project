// Thai-aware monogram extraction for avatar bubbles.
// Strips honorific prefixes, returns first grapheme of remainder via
// Intl.Segmenter so combining vowels stay attached. Falls back to the
// first grapheme of the raw input when no prefix matches.

const PREFIXES = [
  "นางสาว",
  "เด็กชาย",
  "เด็กหญิง",
  "น.ส.",
  "ด.ช.",
  "ด.ญ.",
  "นาย",
  "นาง",
];

export function extractMonogram(name: string): string {
  if (!name) return "";
  let trimmed = name.trim();
  for (const p of PREFIXES) {
    if (trimmed.startsWith(p)) {
      trimmed = trimmed.slice(p.length).trim();
      break;
    }
  }
  // Bare first codepoint, NOT the grapheme cluster: Thai initials drop
  // combining vowel marks (e.g. นางสาวพิมพ์ → "พ", not "พิ").
  return trimmed[0] ?? "";
}

const PALETTE: Array<[string, string]> = [
  ["#3b82f6", "#1d4ed8"],
  ["#10b981", "#047857"],
  ["#f59e0b", "#b45309"],
  ["#8b5cf6", "#6d28d9"],
  ["#ec4899", "#9d174d"],
  ["#06b6d4", "#155e75"],
  ["#f97316", "#9a3412"],
  ["#14b8a6", "#115e59"],
];

export function monogramGradient(id: number | string): string {
  const n = typeof id === "number" ? id : hashString(id);
  const [from, to] = PALETTE[Math.abs(n) % PALETTE.length]!;
  return `linear-gradient(135deg, ${from}, ${to})`;
}

export function gradeMonogram(year: number): string {
  return `ม.${year}`;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
