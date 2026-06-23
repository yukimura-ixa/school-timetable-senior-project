/**
 * MOE / สพฐ. learning areas, keyed by the leading character of a subject code
 * (e.g. ท = ภาษาไทย, ค = คณิตศาสตร์). Used to label, colour, and order program
 * subjects by learning area. Keep the basket display order and the persisted
 * SortOrder in sync by sorting both through `compareByMoeArea`.
 */

export const MOE_RANK: Record<string, number> = {
  ท: 1, ค: 2, ว: 3, ส: 4, พ: 5, ศ: 6, ง: 7, อ: 8, จ: 8, ญ: 8, ฝ: 8, ก: 9,
};

export const MOE_AREA: Record<string, string> = {
  ท: "ภาษาไทย",
  ค: "คณิตศาสตร์",
  ว: "วิทยาศาสตร์และเทคโนโลยี",
  ส: "สังคมศึกษาฯ",
  พ: "สุขศึกษาและพลศึกษา",
  ศ: "ศิลปะ",
  ง: "การงานอาชีพ",
  อ: "ภาษาต่างประเทศ",
  จ: "ภาษาต่างประเทศ",
  ก: "กิจกรรมพัฒนาผู้เรียน",
};

export const MOE_COLOR: Record<string, string> = {
  ท: "#D8345B", ค: "#E07A2B", ว: "#1E9E55", ส: "#7C4DDB",
  พ: "#0E9AA7", ศ: "#C23AA0", ง: "#B07A2C", อ: "#2563EB",
  จ: "#2563EB", ก: "#64748B",
};

const FALLBACK = { name: "", color: "#64748B", rank: 50 } as const;

export function moeArea(code: string) {
  const k = code.charAt(0);
  return {
    name: MOE_AREA[k] ?? FALLBACK.name,
    color: MOE_COLOR[k] ?? FALLBACK.color,
    rank: MOE_RANK[k] ?? FALLBACK.rank,
  };
}

/** Order two subject codes by MOE learning-area rank, then by code. */
export function compareByMoeArea(a: string, b: string): number {
  const ra = MOE_RANK[a.charAt(0)] ?? FALLBACK.rank;
  const rb = MOE_RANK[b.charAt(0)] ?? FALLBACK.rank;
  return ra - rb || a.localeCompare(b, "th");
}
