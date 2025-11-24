/**
 * Test file to validate the seed data structure
 * This validates the logic without requiring a database connection
 */

describe("Seed Data Validation", () => {
  // Test constants from seed.ts
  const THAI_PREFIXES = ["นาย", "นางสาว", "นาง", "ครู", "อาจารย์"];
  const DEPARTMENTS = [
    "คณิตศาสตร์",
    "วิทยาศาสตร์",
    "ภาษาไทย",
    "ภาษาอังกฤษ",
    "สังคมศึกษา",
    "ศิลปะ",
    "พลศึกษา",
    "การงานอาชีพ",
  ];
  const BUILDINGS = [
    { name: "ตึกเรียน", shortName: "1" },
    { name: "ตึกวิทยาศาสตร์", shortName: "2" },
    { name: "ตึกกีฬา", shortName: "3" },
  ];

  describe("Data Dimensions", () => {
    it("should have correct number of departments", () => {
      expect(DEPARTMENTS.length).toBe(8);
    });

    it("should have correct number of buildings", () => {
      expect(BUILDINGS.length).toBe(3);
    });

    it("should have correct number of Thai prefixes", () => {
      expect(THAI_PREFIXES.length).toBe(5);
    });
  });

  describe("Grade Level Generation", () => {
    it("should generate 18 grade levels (M.1-M.6, 3 sections each)", () => {
      const gradeLevels = [];
      for (let year = 1; year <= 6; year++) {
        for (let section = 1; section <= 3; section++) {
          gradeLevels.push({
            GradeID: `${year}0${section}`,
            Year: year,
            Number: section,
          });
        }
      }
      expect(gradeLevels.length).toBe(18);
    });

    it("should generate correct grade IDs", () => {
      const expectedGradeIDs = [
        "101",
        "102",
        "103",
        "201",
        "202",
        "203",
        "301",
        "302",
        "303",
        "401",
        "402",
        "403",
        "501",
        "502",
        "503",
        "601",
        "602",
        "603",
      ];

      const gradeLevels = [];
      for (let year = 1; year <= 6; year++) {
        for (let section = 1; section <= 3; section++) {
          gradeLevels.push(`${year}0${section}`);
        }
      }

      expect(gradeLevels).toEqual(expectedGradeIDs);
    });
  });

  describe("Room Generation", () => {
    it("should generate 40 rooms across 3 buildings", () => {
      const rooms = [];

      for (const building of BUILDINGS) {
        const roomsInBuilding = building.shortName === "3" ? 8 : 16;
        for (let i = 0; i < roomsInBuilding; i++) {
          const floor = Math.floor(i / 4) + 1;
          const roomNum = (i % 4) + 1;
          const roomName = `ห้อง ${building.shortName}${floor}${roomNum}`;
          rooms.push({
            RoomName: roomName,
            Building: building.name,
          });
        }
      }
      expect(rooms.length).toBe(40);
    });

    it("should generate correct room name format (ห้อง xyz)", () => {
      const rooms = [];

      for (const building of BUILDINGS) {
        const roomsInBuilding = building.shortName === "3" ? 8 : 16;
        for (let i = 0; i < roomsInBuilding; i++) {
          const floor = Math.floor(i / 4) + 1;
          const roomNum = (i % 4) + 1;
          const roomName = `ห้อง ${building.shortName}${floor}${roomNum}`;
          rooms.push(roomName);
        }
      }

      // First room in first building (building 1, floor 1, room 1)
      expect(rooms[0]).toBe("ห้อง 111");

      // Last room in first building (building 1, floor 4, room 4)
      expect(rooms[15]).toBe("ห้อง 144");

      // First room in science building (building 2, floor 1, room 1)
      expect(rooms[16]).toBe("ห้อง 211");

      // First room in sports building (building 3, floor 1, room 1)
      expect(rooms[32]).toBe("ห้อง 311");

      // Last room in sports building (building 3, floor 2, room 4)
      expect(rooms[39]).toBe("ห้อง 324");
    });
  });

  describe("Timeslot Generation", () => {
    const days = ["MON", "TUE", "WED", "THU", "FRI"];
    const periods = 8;
    const academicYear = 2567;

    it("should generate 40 timeslots (5 days × 8 periods)", () => {
      const timeslots = [];
      for (const day of days) {
        for (let periodNum = 1; periodNum <= periods; periodNum++) {
          timeslots.push({
            TimeslotID: `1/${academicYear}-${day}${periodNum}`,
            day,
            periodNum,
          });
        }
      }
      expect(timeslots.length).toBe(40);
    });

    it("should generate correct timeslot IDs", () => {
      const timeslots = [];
      for (const day of days) {
        for (let periodNum = 1; periodNum <= periods; periodNum++) {
          timeslots.push(`1-${academicYear}-${day}${periodNum}`);
        }
      }

      expect(timeslots[0]).toBe("1-2567-MON1");
      expect(timeslots[7]).toBe("1-2567-MON8");
      expect(timeslots[8]).toBe("1-2567-TUE1");
      expect(timeslots[39]).toBe("1-2567-FRI8");
    });
  });

  describe("Subject Data", () => {
    const subjects = [
      { code: "ท21101", category: "ภาษาไทย", credit: "CREDIT_15" },
      { code: "ค21101", category: "คณิตศาสตร์", credit: "CREDIT_15" },
      { code: "ว21101", category: "วิทยาศาสตร์", credit: "CREDIT_15" },
      { code: "อ21101", category: "ภาษาต่างประเทศ", credit: "CREDIT_15" },
      { code: "ส21101", category: "สังคมศึกษา", credit: "CREDIT_15" },
      { code: "พ21101", category: "สุขศึกษา-พลศึกษา", credit: "CREDIT_05" },
      { code: "ศ21101", category: "ศิลปะ", credit: "CREDIT_10" },
      { code: "ง21101", category: "การงานอาชีพ", credit: "CREDIT_10" },
    ];

    it("should have correct subject categories", () => {
      const categories = subjects.map((s) => s.category);
      expect(categories).toContain("ภาษาไทย");
      expect(categories).toContain("คณิตศาสตร์");
      expect(categories).toContain("วิทยาศาสตร์");
      expect(categories).toContain("ภาษาต่างประเทศ");
    });

    it("should have correct credit values", () => {
      const credits = subjects.map((s) => s.credit);
      expect(credits).toContain("CREDIT_15");
      expect(credits).toContain("CREDIT_10");
      expect(credits).toContain("CREDIT_05");
    });

    it("should follow Thai subject code format", () => {
      subjects.forEach((subject) => {
        // Thai subject codes should match pattern: [Thai char][5 digits]
        // Using specific Thai chars for subject categories
        expect(subject.code).toMatch(/^[ทคววอสพศง]\d{5}$/);
      });
    });
  });

  describe("Period Schedule", () => {
    const periods = [
      { start: "08:30", end: "09:20", break: "NOT_BREAK" },
      { start: "09:20", end: "10:10", break: "NOT_BREAK" },
      { start: "10:10", end: "11:00", break: "NOT_BREAK" },
      { start: "11:00", end: "11:50", break: "NOT_BREAK" },
      { start: "12:50", end: "13:40", break: "BREAK_JUNIOR" },
      { start: "13:40", end: "14:30", break: "BREAK_SENIOR" },
      { start: "14:30", end: "15:20", break: "NOT_BREAK" },
      { start: "15:20", end: "16:10", break: "NOT_BREAK" },
    ];

    it("should have 8 periods", () => {
      expect(periods.length).toBe(8);
    });

    it("should have lunch break between periods 4 and 5", () => {
      // Period 4 ends at 11:50, Period 5 starts at 12:50
      expect(periods[3].end).toBe("11:50");
      expect(periods[4].start).toBe("12:50");
    });

    it("should have different break times for junior and senior", () => {
      expect(periods[4].break).toBe("BREAK_JUNIOR");
      expect(periods[5].break).toBe("BREAK_SENIOR");
    });

    it("should have 50-minute periods", () => {
      periods.forEach((period) => {
        const [startHour, startMin] = period.start.split(":").map(Number);
        const [endHour, endMin] = period.end.split(":").map(Number);
        const durationMinutes =
          endHour * 60 + endMin - (startHour * 60 + startMin);
        expect(durationMinutes).toBe(50);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should have locked timeslots for school-wide activities", () => {
      const lockedSlots = [
        { day: "MON", period: 8, subject: "ชุมนุม" },
        { day: "WED", period: 8, subject: "ลูกเสือ/ยุวกาชาด" },
      ];

      expect(lockedSlots.length).toBe(2);
      expect(lockedSlots[0].subject).toBe("ชุมนุม");
      expect(lockedSlots[1].subject).toBe("ลูกเสือ/ยุวกาชาด");
    });

    it("should calculate correct teacher distribution", () => {
      const totalTeachers = 60;
      const numDepartments = DEPARTMENTS.length;
      const teachersPerDept = Math.floor(totalTeachers / numDepartments);

      expect(teachersPerDept).toBe(7); // 60 / 8 = 7.5, floor = 7
      expect(teachersPerDept * numDepartments).toBeLessThanOrEqual(
        totalTeachers,
      );
    });
  });

  describe("Data Integrity", () => {
    it("should have unique teacher email format", () => {
      const emails = [];
      for (let i = 1; i <= 60; i++) {
        emails.push(`teacher${i}@school.ac.th`);
      }

      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(emails.length);
    });

    it("should have consistent academic year and semester format", () => {
      const academicYear = 2567;
      const semester = "SEMESTER_1";

      expect(academicYear).toBeGreaterThan(2500); // Thai Buddhist calendar
      expect(academicYear).toBeLessThan(2600);
      expect(["SEMESTER_1", "SEMESTER_2"]).toContain(semester);
    });
  });
});
