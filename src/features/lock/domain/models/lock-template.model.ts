/**
 * Lock Template Models
 *
 * Predefined templates for common lock scenarios
 */

export interface LockTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  category: "lunch" | "activity" | "exam" | "assembly" | "other";

  // Template configuration
  config: {
    subjectCode: string;
    subjectName: string;
    roomId: number | null;
    roomName: string;

    // Target grades
    gradeFilter: {
      type: "junior" | "senior" | "all" | "specific";
      levels?: number[]; // 1-6 for ม.1-6
      gradeIds?: string[]; // Specific grade IDs
    };

    // Target timeslots
    timeslotFilter: {
      days: string[]; // ['MON', 'TUE', 'WED', 'THU', 'FRI']
      // 1-based period indices (e.g. [8, 9] = คาบ 8-9). Matched against the
      // period embedded in TimeslotID, so templates work regardless of the
      // school's actual period start times. Empty when allDay is set.
      periods: number[];
      allDay?: boolean; // Lock all periods for selected days
    };
  };
}

/**
 * Predefined lock templates for common scenarios
 */
export const LOCK_TEMPLATES: LockTemplate[] = [
  // Lunch Break Templates
  {
    id: "lunch-junior",
    name: "พักกลางวัน (ม.ต้น)",
    nameEn: "Lunch Break (Junior)",
    description:
      "พักกลางวันสำหรับนักเรียนชั้นมัธยมศึกษาตอนต้น (ม.1-3) ทุกวัน คาบ 4",
    icon: "🍱",
    category: "lunch",
    config: {
      subjectCode: "LUNCH-JR",
      subjectName: "พักกลางวัน (ม.ต้น)",
      roomId: null,
      roomName: "โรงอาหาร",
      gradeFilter: {
        type: "junior",
        levels: [1, 2, 3],
      },
      timeslotFilter: {
        days: ["MON", "TUE", "WED", "THU", "FRI"],
        periods: [4],
      },
    },
  },
  {
    id: "lunch-senior",
    name: "พักกลางวัน (ม.ปลาย)",
    nameEn: "Lunch Break (Senior)",
    description:
      "พักกลางวันสำหรับนักเรียนชั้นมัธยมศึกษาตอนปลาย (ม.4-6) ทุกวัน คาบ 5",
    icon: "🍱",
    category: "lunch",
    config: {
      subjectCode: "LUNCH-SR",
      subjectName: "พักกลางวัน (ม.ปลาย)",
      roomId: null,
      roomName: "โรงอาหาร",
      gradeFilter: {
        type: "senior",
        levels: [4, 5, 6],
      },
      timeslotFilter: {
        days: ["MON", "TUE", "WED", "THU", "FRI"],
        periods: [5],
      },
    },
  },

  // Activity Templates
  {
    id: "activity-morning",
    name: "กิจกรรมเช้า",
    nameEn: "Morning Activities",
    description: "กิจกรรมหน้าเสาธงทุกวันจันทร์ คาบแรก สำหรับนักเรียนทุกชั้น",
    icon: "🎌",
    category: "activity",
    config: {
      subjectCode: "ACT-MORNING",
      subjectName: "กิจกรรมหน้าเสาธง",
      roomId: null,
      roomName: "สนามหน้าเสาธง",
      gradeFilter: {
        type: "all",
      },
      timeslotFilter: {
        days: ["MON"],
        periods: [1],
      },
    },
  },
  {
    id: "activity-club",
    name: "ชุมนุม",
    nameEn: "Club Activities",
    description: "ชุมนุมทุกวันศุกร์ คาบ 8-9 สำหรับนักเรียนทุกชั้น",
    icon: "🎨",
    category: "activity",
    config: {
      subjectCode: "ACT-CLUB",
      subjectName: "ชุมนุม",
      roomId: null,
      roomName: "ตามชุมนุม",
      gradeFilter: {
        type: "all",
      },
      timeslotFilter: {
        days: ["FRI"],
        periods: [8, 9],
      },
    },
  },
  {
    id: "activity-sport",
    name: "กิจกรรมกีฬา",
    nameEn: "Sports Activities",
    description: "กิจกรรมกีฬาทุกวันพุธ บ่าย คาบ 7-8 สำหรับนักเรียนทุกชั้น",
    icon: "⚽",
    category: "activity",
    config: {
      subjectCode: "ACT-SPORT",
      subjectName: "กิจกรรมกีฬา",
      roomId: null,
      roomName: "สนามกีฬา",
      gradeFilter: {
        type: "all",
      },
      timeslotFilter: {
        days: ["WED"],
        periods: [7, 8],
      },
    },
  },

  // Assembly Templates
  {
    id: "assembly-weekly",
    name: "ประชุมประจำสัปดาห์",
    nameEn: "Weekly Assembly",
    description: "ประชุมนักเรียนทุกวันศุกร์ คาบ 1 สำหรับนักเรียนทุกชั้น",
    icon: "📢",
    category: "assembly",
    config: {
      subjectCode: "ASSEMBLY",
      subjectName: "ประชุมนักเรียน",
      roomId: null,
      roomName: "หอประชุม",
      gradeFilter: {
        type: "all",
      },
      timeslotFilter: {
        days: ["FRI"],
        periods: [1],
      },
    },
  },
  {
    id: "assembly-junior",
    name: "ประชุมผู้ปกครอง (ม.ต้น)",
    nameEn: "Parent Meeting (Junior)",
    description: "ประชุมผู้ปกครองนักเรียนม.ต้น ทั้งวัน สำหรับ ม.1-3",
    icon: "👨‍👩‍👧‍👦",
    category: "assembly",
    config: {
      subjectCode: "PARENT-JR",
      subjectName: "ประชุมผู้ปกครอง",
      roomId: null,
      roomName: "หอประชุม",
      gradeFilter: {
        type: "junior",
        levels: [1, 2, 3],
      },
      timeslotFilter: {
        days: ["SAT"],
        periods: [],
        allDay: true,
      },
    },
  },

  // Exam Templates
  {
    id: "exam-midterm",
    name: "สอบกลางภาค",
    nameEn: "Midterm Exam",
    description: "สอบกลางภาค ทุกชั้น ทั้งสัปดาห์",
    icon: "📝",
    category: "exam",
    config: {
      subjectCode: "EXAM-MID",
      subjectName: "สอบกลางภาค",
      roomId: null,
      roomName: "ห้องสอบ",
      gradeFilter: {
        type: "all",
      },
      timeslotFilter: {
        days: ["MON", "TUE", "WED", "THU", "FRI"],
        periods: [],
        allDay: true,
      },
    },
  },
  {
    id: "exam-final",
    name: "สอบปลายภาค",
    nameEn: "Final Exam",
    description: "สอบปลายภาค ทุกชั้น ทั้งสัปดาห์",
    icon: "📝",
    category: "exam",
    config: {
      subjectCode: "EXAM-FINAL",
      subjectName: "สอบปลายภาค",
      roomId: null,
      roomName: "ห้องสอบ",
      gradeFilter: {
        type: "all",
      },
      timeslotFilter: {
        days: ["MON", "TUE", "WED", "THU", "FRI"],
        periods: [],
        allDay: true,
      },
    },
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: LockTemplate["category"],
): LockTemplate[] {
  return LOCK_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): LockTemplate | undefined {
  return LOCK_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): Array<{
  value: LockTemplate["category"];
  label: string;
  icon: string;
}> {
  return [
    { value: "lunch", label: "พักกลางวัน", icon: "🍱" },
    { value: "activity", label: "กิจกรรม", icon: "🎨" },
    { value: "assembly", label: "ประชุม", icon: "📢" },
    { value: "exam", label: "สอบ", icon: "📝" },
    { value: "other", label: "อื่นๆ", icon: "📌" },
  ];
}
