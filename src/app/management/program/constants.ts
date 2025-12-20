// Program management constants - shared between server and client components

// Grade level metadata with enhanced colors
export const GRADE_LEVELS = [
  {
    year: 1,
    label: "มัธยมศึกษาปีที่ 1",
    shortLabel: "ม.1",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  },
  {
    year: 2,
    label: "มัธยมศึกษาปีที่ 2",
    shortLabel: "ม.2",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  {
    year: 3,
    label: "มัธยมศึกษาปีที่ 3",
    shortLabel: "ม.3",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  },
  {
    year: 4,
    label: "มัธยมศึกษาปีที่ 4",
    shortLabel: "ม.4",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  {
    year: 5,
    label: "มัธยมศึกษาปีที่ 5",
    shortLabel: "ม.5",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  },
  {
    year: 6,
    label: "มัธยมศึกษาปีที่ 6",
    shortLabel: "ม.6",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  },
] as const;

export type GradeLevel = (typeof GRADE_LEVELS)[number];
