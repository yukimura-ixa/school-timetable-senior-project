/**
 * Thai Ministry of Education (MOE) Weekly Lesson Standards
 *
 * Based on Basic Education Core Curriculum B.E. 2551 (A.D. 2008)
 *
 * This configuration defines the minimum weekly lesson requirements for each grade level
 * in Thai secondary education (Matthayom 1-6).
 *
 * Standards Reference:
 * - Lower Secondary (M.1-M.3): 28-32 periods/week minimum
 * - Upper Secondary (M.4-M.6): 30-34 periods/week minimum
 *
 * Subject Categories:
 * - CORE: Required subjects for all students
 * - ELECTIVE: Additional subjects based on program track
 * - ACTIVITY: Non-academic activities (homeroom, club, etc.)
 */

export type YearKey = "M1" | "M2" | "M3" | "M4" | "M5" | "M6";
export type SubjectCategory = "CORE" | "ELECTIVE" | "ACTIVITY";

export interface SubjectWeeklyStandard {
  /** Subject code (e.g., TH101, MA101) */
  subjectCode: string;
  /** Thai subject name */
  subjectNameTh: string;
  /** English subject name (optional) */
  subjectNameEn?: string;
  /** Minimum weekly lessons required */
  minWeeklyLessons: number;
  /** Maximum weekly lessons allowed */
  maxWeeklyLessons: number;
  /** Subject category */
  category: SubjectCategory;
  /** Subject group/department */
  group: string;
}

export interface YearStandard {
  /** Grade year */
  year: YearKey;
  /** Thai description */
  description: string;
  /** Minimum total weekly lessons */
  minTotalLessons: number;
  /** Maximum total weekly lessons */
  maxTotalLessons: number;
  /** Required core subjects */
  coreSubjects: SubjectWeeklyStandard[];
  /** Recommended elective subjects */
  electiveSubjects: SubjectWeeklyStandard[];
  /** Required activities */
  activities: SubjectWeeklyStandard[];
}

/**
 * MOE Weekly Lesson Standards for Lower Secondary (M.1-M.3)
 *
 * Core Subjects (8 Learning Areas):
 * 1. Thai Language (4-5 periods)
 * 2. Mathematics (4-5 periods)
 * 3. Science (3-4 periods)
 * 4. Social Studies, Religion, and Culture (3-4 periods)
 * 5. Health and Physical Education (2-3 periods)
 * 6. Arts (2-3 periods)
 * 7. Career and Technology (2-3 periods)
 * 8. Foreign Languages (2-3 periods)
 */
const LOWER_SECONDARY_CORE: SubjectWeeklyStandard[] = [
  {
    subjectCode: "TH",
    subjectNameTh: "ภาษาไทย",
    subjectNameEn: "Thai Language",
    minWeeklyLessons: 4,
    maxWeeklyLessons: 5,
    category: "CORE",
    group: "ภาษาไทย",
  },
  {
    subjectCode: "MA",
    subjectNameTh: "คณิตศาสตร์",
    subjectNameEn: "Mathematics",
    minWeeklyLessons: 4,
    maxWeeklyLessons: 5,
    category: "CORE",
    group: "คณิตศาสตร์",
  },
  {
    subjectCode: "SC",
    subjectNameTh: "วิทยาศาสตร์",
    subjectNameEn: "Science",
    minWeeklyLessons: 3,
    maxWeeklyLessons: 4,
    category: "CORE",
    group: "วิทยาศาสตร์",
  },
  {
    subjectCode: "SS",
    subjectNameTh: "สังคมศึกษา ศาสนา และวัฒนธรรม",
    subjectNameEn: "Social Studies, Religion, and Culture",
    minWeeklyLessons: 3,
    maxWeeklyLessons: 4,
    category: "CORE",
    group: "สังคมศึกษา",
  },
  {
    subjectCode: "PE",
    subjectNameTh: "สุขศึกษาและพลศึกษา",
    subjectNameEn: "Health and Physical Education",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "CORE",
    group: "พลศึกษา",
  },
  {
    subjectCode: "AR",
    subjectNameTh: "ศิลปะ",
    subjectNameEn: "Arts",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "CORE",
    group: "ศิลปะ",
  },
  {
    subjectCode: "CT",
    subjectNameTh: "การงานอาชีพและเทคโนโลยี",
    subjectNameEn: "Career and Technology",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "CORE",
    group: "การงานอาชีพ",
  },
  {
    subjectCode: "EN",
    subjectNameTh: "ภาษาอังกฤษ",
    subjectNameEn: "English",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "CORE",
    group: "ภาษาอังกฤษ",
  },
];

/**
 * MOE Weekly Lesson Standards for Upper Secondary (M.4-M.6)
 *
 * Core Subjects (reduced) + Track-specific electives:
 * - Science-Math Track: Additional Science, Math, Computer
 * - Arts-Language Track: Additional Social Studies, Languages, Arts
 * - General Track: Balanced additional subjects
 */
const UPPER_SECONDARY_CORE: SubjectWeeklyStandard[] = [
  {
    subjectCode: "TH",
    subjectNameTh: "ภาษาไทย",
    subjectNameEn: "Thai Language",
    minWeeklyLessons: 3,
    maxWeeklyLessons: 4,
    category: "CORE",
    group: "ภาษาไทย",
  },
  {
    subjectCode: "MA",
    subjectNameTh: "คณิตศาสตร์",
    subjectNameEn: "Mathematics",
    minWeeklyLessons: 3,
    maxWeeklyLessons: 4,
    category: "CORE",
    group: "คณิตศาสตร์",
  },
  {
    subjectCode: "SC",
    subjectNameTh: "วิทยาศาสตร์",
    subjectNameEn: "Science",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "CORE",
    group: "วิทยาศาสตร์",
  },
  {
    subjectCode: "SS",
    subjectNameTh: "สังคมศึกษา ศาสนา และวัฒนธรรม",
    subjectNameEn: "Social Studies, Religion, and Culture",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "CORE",
    group: "สังคมศึกษา",
  },
  {
    subjectCode: "PE",
    subjectNameTh: "สุขศึกษาและพลศึกษา",
    subjectNameEn: "Health and Physical Education",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 2,
    category: "CORE",
    group: "พลศึกษา",
  },
  {
    subjectCode: "EN",
    subjectNameTh: "ภาษาอังกฤษ",
    subjectNameEn: "English",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "CORE",
    group: "ภาษาอังกฤษ",
  },
];

/**
 * Common elective subjects for lower secondary
 */
const LOWER_SECONDARY_ELECTIVES: SubjectWeeklyStandard[] = [
  {
    subjectCode: "CH",
    subjectNameTh: "ภาษาจีน",
    subjectNameEn: "Chinese",
    minWeeklyLessons: 1,
    maxWeeklyLessons: 2,
    category: "ELECTIVE",
    group: "ภาษาต่างประเทศ",
  },
  {
    subjectCode: "JP",
    subjectNameTh: "ภาษาญี่ปุ่น",
    subjectNameEn: "Japanese",
    minWeeklyLessons: 1,
    maxWeeklyLessons: 2,
    category: "ELECTIVE",
    group: "ภาษาต่างประเทศ",
  },
  {
    subjectCode: "CP",
    subjectNameTh: "คอมพิวเตอร์",
    subjectNameEn: "Computer",
    minWeeklyLessons: 1,
    maxWeeklyLessons: 2,
    category: "ELECTIVE",
    group: "วิทยาศาสตร์",
  },
];

/**
 * Science-Math track electives for upper secondary
 */
const SCIENCE_MATH_ELECTIVES: SubjectWeeklyStandard[] = [
  {
    subjectCode: "MA_ADV",
    subjectNameTh: "คณิตศาสตร์เพิ่มเติม",
    subjectNameEn: "Advanced Mathematics",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 4,
    category: "ELECTIVE",
    group: "คณิตศาสตร์",
  },
  {
    subjectCode: "PH",
    subjectNameTh: "ฟิสิกส์",
    subjectNameEn: "Physics",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "วิทยาศาสตร์",
  },
  {
    subjectCode: "CH_SCI",
    subjectNameTh: "เคมี",
    subjectNameEn: "Chemistry",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "วิทยาศาสตร์",
  },
  {
    subjectCode: "BI",
    subjectNameTh: "ชีววิทยา",
    subjectNameEn: "Biology",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "วิทยาศาสตร์",
  },
  {
    subjectCode: "CP_ADV",
    subjectNameTh: "วิทยาการคำนวณ",
    subjectNameEn: "Computer Science",
    minWeeklyLessons: 1,
    maxWeeklyLessons: 2,
    category: "ELECTIVE",
    group: "วิทยาศาสตร์",
  },
];

/**
 * Arts-Language track electives for upper secondary
 */
const ARTS_LANGUAGE_ELECTIVES: SubjectWeeklyStandard[] = [
  {
    subjectCode: "SS_ADV",
    subjectNameTh: "สังคมศึกษาเพิ่มเติม",
    subjectNameEn: "Advanced Social Studies",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "สังคมศึกษา",
  },
  {
    subjectCode: "EN_ADV",
    subjectNameTh: "ภาษาอังกฤษเพิ่มเติม",
    subjectNameEn: "Advanced English",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "ภาษาอังกฤษ",
  },
  {
    subjectCode: "CH",
    subjectNameTh: "ภาษาจีน",
    subjectNameEn: "Chinese",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "ภาษาต่างประเทศ",
  },
  {
    subjectCode: "JP",
    subjectNameTh: "ภาษาญี่ปุ่น",
    subjectNameEn: "Japanese",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "ภาษาต่างประเทศ",
  },
  {
    subjectCode: "AR_ADV",
    subjectNameTh: "ศิลปะเพิ่มเติม",
    subjectNameEn: "Advanced Arts",
    minWeeklyLessons: 1,
    maxWeeklyLessons: 2,
    category: "ELECTIVE",
    group: "ศิลปะ",
  },
];

/**
 * Arts-Math track electives for upper secondary (ศิลป์-คำนวณ)
 */
const LANGUAGE_MATH_ELECTIVES: SubjectWeeklyStandard[] = [
  {
    subjectCode: "MA_ADV",
    subjectNameTh: "คณิตศาสตร์เพิ่มเติม",
    subjectNameEn: "Advanced Mathematics",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 4,
    category: "ELECTIVE",
    group: "คณิตศาสตร์",
  },
  {
    subjectCode: "EN_ADV",
    subjectNameTh: "ภาษาอังกฤษเพิ่มเติม",
    subjectNameEn: "Advanced English",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "ภาษาอังกฤษ",
  },
  {
    subjectCode: "CH",
    subjectNameTh: "ภาษาจีน",
    subjectNameEn: "Chinese",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "ภาษาต่างประเทศ",
  },
  {
    subjectCode: "JP",
    subjectNameTh: "ภาษาญี่ปุ่น",
    subjectNameEn: "Japanese",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "ภาษาต่างประเทศ",
  },
  {
    subjectCode: "CP_ADV",
    subjectNameTh: "วิทยาการคำนวณ",
    subjectNameEn: "Computer Science",
    minWeeklyLessons: 1,
    maxWeeklyLessons: 2,
    category: "ELECTIVE",
    group: "วิทยาศาสตร์",
  },
];

/**
 * Required activities for all grade levels
 */
const COMMON_ACTIVITIES: SubjectWeeklyStandard[] = [
  {
    subjectCode: "HR",
    subjectNameTh: "ชั้นเรียน",
    subjectNameEn: "Homeroom",
    minWeeklyLessons: 1,
    maxWeeklyLessons: 1,
    category: "ACTIVITY",
    group: "กิจกรรม",
  },
  {
    subjectCode: "CLUB",
    subjectNameTh: "ชุมนุม",
    subjectNameEn: "Club Activity",
    minWeeklyLessons: 1,
    maxWeeklyLessons: 2,
    category: "ACTIVITY",
    group: "กิจกรรม",
  },
];

/**
 * Complete MOE Weekly Lesson Standards by Grade Year
 */
export const MOE_WEEKLY_STANDARDS: Record<YearKey, YearStandard> = {
  M1: {
    year: "M1",
    description: "มัธยมศึกษาปีที่ 1 (Lower Secondary Year 1)",
    minTotalLessons: 28,
    maxTotalLessons: 32,
    coreSubjects: LOWER_SECONDARY_CORE,
    electiveSubjects: LOWER_SECONDARY_ELECTIVES,
    activities: COMMON_ACTIVITIES,
  },
  M2: {
    year: "M2",
    description: "มัธยมศึกษาปีที่ 2 (Lower Secondary Year 2)",
    minTotalLessons: 28,
    maxTotalLessons: 32,
    coreSubjects: LOWER_SECONDARY_CORE,
    electiveSubjects: LOWER_SECONDARY_ELECTIVES,
    activities: COMMON_ACTIVITIES,
  },
  M3: {
    year: "M3",
    description: "มัธยมศึกษาปีที่ 3 (Lower Secondary Year 3)",
    minTotalLessons: 28,
    maxTotalLessons: 32,
    coreSubjects: LOWER_SECONDARY_CORE,
    electiveSubjects: LOWER_SECONDARY_ELECTIVES,
    activities: COMMON_ACTIVITIES,
  },
  M4: {
    year: "M4",
    description: "มัธยมศึกษาปีที่ 4 (Upper Secondary Year 4)",
    minTotalLessons: 30,
    maxTotalLessons: 34,
    coreSubjects: UPPER_SECONDARY_CORE,
    electiveSubjects: [...SCIENCE_MATH_ELECTIVES, ...ARTS_LANGUAGE_ELECTIVES],
    activities: COMMON_ACTIVITIES,
  },
  M5: {
    year: "M5",
    description: "มัธยมศึกษาปีที่ 5 (Upper Secondary Year 5)",
    minTotalLessons: 30,
    maxTotalLessons: 34,
    coreSubjects: UPPER_SECONDARY_CORE,
    electiveSubjects: [...SCIENCE_MATH_ELECTIVES, ...ARTS_LANGUAGE_ELECTIVES],
    activities: COMMON_ACTIVITIES,
  },
  M6: {
    year: "M6",
    description: "มัธยมศึกษาปีที่ 6 (Upper Secondary Year 6)",
    minTotalLessons: 30,
    maxTotalLessons: 34,
    coreSubjects: UPPER_SECONDARY_CORE,
    electiveSubjects: [...SCIENCE_MATH_ELECTIVES, ...ARTS_LANGUAGE_ELECTIVES],
    activities: COMMON_ACTIVITIES,
  },
};

/**
 * Helper: Get MOE standards for a specific grade year
 */
export function getMOEStandards(year: YearKey): YearStandard {
  return MOE_WEEKLY_STANDARDS[year];
}

/**
 * Helper: Calculate minimum core lessons for a grade year
 */
export function getMinCoreLessons(year: YearKey): number {
  const standard = getMOEStandards(year);
  return standard.coreSubjects.reduce(
    (sum, subject) => sum + subject.minWeeklyLessons,
    0,
  );
}

/**
 * Helper: Calculate maximum core lessons for a grade year
 */
export function getMaxCoreLessons(year: YearKey): number {
  const standard = getMOEStandards(year);
  return standard.coreSubjects.reduce(
    (sum, subject) => sum + subject.maxWeeklyLessons,
    0,
  );
}

/**
 * Helper: Validate if total weekly lessons meet MOE standards
 */
export function validateTotalLessons(
  year: YearKey,
  totalLessons: number,
): {
  valid: boolean;
  message?: string;
} {
  const standard = getMOEStandards(year);

  if (totalLessons < standard.minTotalLessons) {
    return {
      valid: false,
      message: `จำนวนคาบเรียนรวมต่ำกว่ามาตรฐาน กพฐ. (ต้องการอย่างน้อย ${standard.minTotalLessons} คาบ/สัปดาห์)`,
    };
  }

  if (totalLessons > standard.maxTotalLessons) {
    return {
      valid: false,
      message: `จำนวนคาบเรียนรวมเกินมาตรฐาน กพฐ. (ไม่ควรเกิน ${standard.maxTotalLessons} คาบ/สัปดาห์)`,
    };
  }

  return { valid: true };
}

/**
 * Helper: Get all subject groups for a grade year
 */
export function getSubjectGroups(year: YearKey): string[] {
  const standard = getMOEStandards(year);
  const allSubjects = [
    ...standard.coreSubjects,
    ...standard.electiveSubjects,
    ...standard.activities,
  ];

  return [...new Set(allSubjects.map((s) => s.group))];
}

/**
 * Program track types for upper secondary
 * Must match Prisma ProgramTrack enum exactly
 */
export type ProgramTrack =
  | "GENERAL"
  | "SCIENCE_MATH"
  | "LANGUAGE_MATH"
  | "LANGUAGE_ARTS";

/**
 * Helper: Get recommended electives for a program track
 */
export function getTrackElectives(
  year: YearKey,
  track: ProgramTrack,
): SubjectWeeklyStandard[] {
  const standard = getMOEStandards(year);

  // Lower secondary has same electives for all
  if (["M1", "M2", "M3"].includes(year)) {
    return standard.electiveSubjects;
  }

  // Upper secondary varies by track
  switch (track) {
    case "SCIENCE_MATH":
      return SCIENCE_MATH_ELECTIVES;
    case "LANGUAGE_MATH":
      return LANGUAGE_MATH_ELECTIVES;
    case "LANGUAGE_ARTS":
      return ARTS_LANGUAGE_ELECTIVES;
    case "GENERAL":
    default:
      return standard.electiveSubjects;
  }
}
