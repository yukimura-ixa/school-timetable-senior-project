/**
 * Unit Tests for Public Data Mappers
 * 
 * Tests that verify:
 * - PII protection (no email fields)
 * - Correct data transformations
 * - Pagination logic
 * - Sorting behavior
 */

import { describe, test, expect } from "@jest/globals";
import { 
  getPublicTeachers, 
  getPaginatedTeachers, 
  getTeacherCount,
  getTopTeachersByUtilization 
} from "@/lib/public/teachers";
import { 
  getPublicClasses, 
  getPaginatedClasses, 
  getClassCount 
} from "@/lib/public/classes";
import { 
  getQuickStats, 
  getPeriodLoadPerDay, 
  getRoomOccupancy 
} from "@/lib/public/stats";

describe("Public Teachers Data Layer", () => {
  test("should not expose email addresses (PII protection)", async () => {
    const teachers = await getPublicTeachers();
    
    // Verify no teacher object contains email field
    teachers.forEach((teacher) => {
      expect(teacher).not.toHaveProperty("email");
      expect(teacher).not.toHaveProperty("Email");
    });
  });

  test("should return valid teacher data structure", async () => {
    const teachers = await getPublicTeachers();
    
    if (teachers.length > 0) {
      const teacher = teachers[0];
      
      expect(teacher).toHaveProperty("teacherId");
      expect(teacher).toHaveProperty("name");
      expect(teacher).toHaveProperty("department");
      expect(teacher).toHaveProperty("subjectCount");
      expect(teacher).toHaveProperty("weeklyHours");
      expect(teacher).toHaveProperty("utilization");
      
      expect(typeof teacher.teacherId).toBe("number");
      expect(typeof teacher.name).toBe("string");
      expect(typeof teacher.department).toBe("string");
      expect(typeof teacher.subjectCount).toBe("number");
      expect(typeof teacher.weeklyHours).toBe("number");
      expect(typeof teacher.utilization).toBe("number");
    }
  });

  test("should calculate utilization correctly", async () => {
    const teachers = await getPublicTeachers();
    
    teachers.forEach((teacher) => {
      // Utilization should be between 0 and 100 (or slightly above for overtime)
      expect(teacher.utilization).toBeGreaterThanOrEqual(0);
      
      // Utilization is rounded: Math.round((weeklyHours / 40) * 100)
      const expectedUtilization = Math.round((teacher.weeklyHours / 40) * 100);
      expect(teacher.utilization).toBe(expectedUtilization);
    });
  });

  test("should handle pagination correctly", async () => {
    const page1 = await getPaginatedTeachers({ page: 1, perPage: 10 });
    const page2 = await getPaginatedTeachers({ page: 2, perPage: 10 });
    
    // Page 1 should have at most 10 items
    expect(page1.data.length).toBeLessThanOrEqual(10);
    
    // If there are more than 10 teachers total, page 2 should have data
    const totalCount = await getTeacherCount();
    if (totalCount > 10) {
      expect(page2.data.length).toBeGreaterThan(0);
      
      // First item of page 2 should not be in page 1
      const page1Ids = page1.data.map(t => t.teacherId);
      const page2FirstId = page2.data[0]?.teacherId;
      expect(page1Ids).not.toContain(page2FirstId);
    }
  });

  test("should sort by utilization correctly", async () => {
    const ascending = await getPublicTeachers(undefined, "utilization", "asc");
    const descending = await getPublicTeachers(undefined, "utilization", "desc");
    
    if (ascending.length >= 2) {
      expect(ascending[0].utilization).toBeLessThanOrEqual(ascending[1].utilization);
    }
    
    if (descending.length >= 2) {
      expect(descending[0].utilization).toBeGreaterThanOrEqual(descending[1].utilization);
    }
  });

  test("getTopTeachersByUtilization should return top N teachers", async () => {
    const top5 = await getTopTeachersByUtilization(5);
    
    expect(top5.length).toBeLessThanOrEqual(5);
    
    // Should be sorted by utilization descending
    for (let i = 0; i < top5.length - 1; i++) {
      expect(top5[i].utilization).toBeGreaterThanOrEqual(top5[i + 1].utilization);
    }
  });

  test("should filter by search term", async () => {
    const searchTerm = "Math";
    const results = await getPublicTeachers(searchTerm);
    
    // All results should match the search term in name or department
    results.forEach((teacher) => {
      const matchesSearch = 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      expect(matchesSearch).toBe(true);
    });
  });
});

describe("Public Classes Data Layer", () => {
  test("should not expose individual student data", async () => {
    const classes = await getPublicClasses();
    
    // Classes should have grade-level data only
    classes.forEach((cls) => {
      expect(cls).not.toHaveProperty("students");
      expect(cls).not.toHaveProperty("studentList");
      expect(cls).toHaveProperty("gradeId");
    });
  });

  test("should return valid class data structure", async () => {
    const classes = await getPublicClasses();
    
    if (classes.length > 0) {
      const cls = classes[0];
      
      expect(cls).toHaveProperty("gradeId");
      expect(cls).toHaveProperty("year");
      expect(cls).toHaveProperty("section");
      expect(cls).toHaveProperty("subjectCount");
      expect(cls).toHaveProperty("weeklyHours");
      
      expect(typeof cls.gradeId).toBe("string");
      expect(typeof cls.year).toBe("number");
      expect(typeof cls.section).toBe("number");
      expect(typeof cls.subjectCount).toBe("number");
      expect(typeof cls.weeklyHours).toBe("number");
    }
  });

  test("should handle pagination correctly", async () => {
    const page1 = await getPaginatedClasses({ page: 1, perPage: 10 });
    const page2 = await getPaginatedClasses({ page: 2, perPage: 10 });
    
    expect(page1.data.length).toBeLessThanOrEqual(10);
    
    const totalCount = await getClassCount();
    if (totalCount > 10) {
      expect(page2.data.length).toBeGreaterThan(0);
      
      const page1Ids = page1.data.map(c => c.gradeId);
      const page2FirstId = page2.data[0]?.gradeId;
      expect(page1Ids).not.toContain(page2FirstId);
    }
  });
});

describe("Public Stats Data Layer", () => {
  test("getQuickStats should return valid metrics", async () => {
    const stats = await getQuickStats();
    
    expect(stats).toHaveProperty("totalTeachers");
    expect(stats).toHaveProperty("totalClasses");
    expect(stats).toHaveProperty("totalRooms");
    expect(stats).toHaveProperty("periodsPerDay");
    expect(stats).toHaveProperty("currentTerm");
    
    expect(stats.totalTeachers).toBeGreaterThan(0);
    expect(stats.totalClasses).toBeGreaterThan(0);
    expect(stats.totalRooms).toBeGreaterThan(0);
    expect(stats.periodsPerDay).toBeGreaterThan(0);
    expect(typeof stats.currentTerm).toBe("string");
  });

  test("getPeriodLoadPerDay should return data for all weekdays", async () => {
    const periodLoad = await getPeriodLoadPerDay();
    
    // Should have data for MON-FRI (5 days)
    expect(periodLoad.length).toBe(5);
    
    const expectedDays = ["MON", "TUE", "WED", "THU", "FRI"];
    const actualDays = periodLoad.map(d => d.day);
    
    expectedDays.forEach((day) => {
      expect(actualDays).toContain(day);
    });
    
    // All period counts should be non-negative
    periodLoad.forEach((item) => {
      expect(item.periods).toBeGreaterThanOrEqual(0);
    });
  });

  test("getRoomOccupancy should return valid occupancy data", async () => {
    const occupancy = await getRoomOccupancy();
    
    // Should have data (at least one timeslot)
    expect(occupancy.length).toBeGreaterThan(0);
    
    occupancy.forEach((item) => {
      expect(item).toHaveProperty("day");
      expect(item).toHaveProperty("period");
      expect(item).toHaveProperty("occupancyPercent");
      
      // Occupancy should be between 0 and 100
      expect(item.occupancyPercent).toBeGreaterThanOrEqual(0);
      expect(item.occupancyPercent).toBeLessThanOrEqual(100);
    });
  });
});

describe("Security & Privacy", () => {
  test("no PII in any public data endpoints", async () => {
    const teachers = await getPublicTeachers();
    const classes = await getPublicClasses();
    
    // Convert to JSON and check for email patterns
    const teachersJson = JSON.stringify(teachers);
    const classesJson = JSON.stringify(classes);
    
    // Should not contain email patterns (e.g., @gmail.com, @example.com)
    const emailPattern = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    
    expect(emailPattern.test(teachersJson)).toBe(false);
    expect(emailPattern.test(classesJson)).toBe(false);
  });
});
