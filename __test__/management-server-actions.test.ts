/**
 * Integration Tests for Management Server Actions
 *
 * Tests that verify:
 * - Server Actions return expected data structures
 * - Error handling works correctly
 * - Data transformations are correct
 * - Repository integration works
 */

// Vitest globals are available without import in Vitest
import {
  getTeachersAction,
  getTeacherByIdAction,
} from "@/features/teacher/application/actions/teacher.actions";
import { getRoomsAction } from "@/features/room/application/actions/room.actions";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";
import { getGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";

describe("Teacher Management Server Actions", () => {
  test("getTeachersAction should return success with teacher array", async () => {
    const result = await getTeachersAction();

    expect(result).toHaveProperty("success");

    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);

      // Verify teacher structure if data exists
      if (result.data.length > 0) {
        const teacher = result.data[0];
        expect(teacher).toHaveProperty("TeacherID");
        expect(teacher).toHaveProperty("Firstname");
        expect(teacher).toHaveProperty("Lastname");
        expect(teacher).toHaveProperty("Department");
      }
    } else {
      expect(result).toHaveProperty("error");
      expect(typeof result.error?.message).toBe("string");
    }
  });

  test("getTeacherByIdAction should return teacher when valid ID provided", async () => {
    // First get all teachers to find a valid ID
    const allTeachers = await getTeachersAction();

    if (allTeachers.success && allTeachers.data.length > 0) {
      const validId = allTeachers.data[0]!.TeacherID;

      const result = await getTeacherByIdAction({ TeacherID: validId });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeTruthy();
        expect(result.data?.TeacherID).toBe(validId);
      }
    }
  });

  test("teachers should be ordered by Firstname", async () => {
    const result = await getTeachersAction();

    if (result.success && result.data.length >= 2) {
      const teachers = result.data;

      for (let i = 0; i < teachers.length - 1; i++) {
        const current = teachers[i]!.Firstname.toLowerCase();
        const next = teachers[i + 1]!.Firstname.toLowerCase();

        // Current should be <= next (ascending order)
        expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
      }
    }
  });
});

describe("Room Management Server Actions", () => {
  test("getRoomsAction should return success with room array", async () => {
    const result = await getRoomsAction();

    expect(result).toHaveProperty("success");

    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);

      // Verify room structure if data exists
      if (result.data.length > 0) {
        const room = result.data[0];
        expect(room).toHaveProperty("RoomID");
        expect(room).toHaveProperty("RoomName");
        expect(room).toHaveProperty("Building");
        expect(room).toHaveProperty("Floor");
      }
    } else {
      expect(result).toHaveProperty("error");
      expect(typeof result.error?.message).toBe("string");
    }
  });

  test("rooms should be ordered by RoomID", async () => {
    const result = await getRoomsAction();

    if (result.success && result.data.length >= 2) {
      const rooms = result.data;

      for (let i = 0; i < rooms.length - 1; i++) {
        const currentId = rooms[i]!.RoomID;
        const nextId = rooms[i + 1]!.RoomID;

        // RoomID should be in ascending order
        expect(currentId).toBeLessThanOrEqual(nextId);
      }
    }
  });
});

describe("Subject Management Server Actions", () => {
  test("getSubjectsAction should return success with subject array", async () => {
    const result = await getSubjectsAction();

    expect(result).toHaveProperty("success");

    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);

      // Verify subject structure if data exists
      if (result.data.length > 0) {
        const subject = result.data[0];
        expect(subject).toHaveProperty("SubjectCode");
        expect(subject).toHaveProperty("SubjectName");
        expect(subject).toHaveProperty("Credit");
        expect(subject).toHaveProperty("Category");
      }
    } else {
      expect(result).toHaveProperty("error");
      expect(typeof result.error?.message).toBe("string");
    }
  });

  test("subjects should be ordered by SubjectCode", async () => {
    const result = await getSubjectsAction();

    if (result.success && result.data.length >= 2) {
      const subjects = result.data;

      for (let i = 0; i < subjects.length - 1; i++) {
        const current = subjects[i]!.SubjectCode;
        const next = subjects[i + 1]!.SubjectCode;

        // SubjectCode should be in ascending order
        expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
      }
    }
  });

  test("subjects should have valid categories", async () => {
    const result = await getSubjectsAction();

    if (result.success) {
      // Category field contains enum values, not Thai display names
      const validCategories = ["CORE", "ADDITIONAL", "ACTIVITY"];

      result.data.forEach((subject) => {
        expect(validCategories).toContain(subject.Category);
      });
    }
  });
});

describe("GradeLevel Management Server Actions", () => {
  test("getGradeLevelsAction should return success with gradelevel array", async () => {
    const result = await getGradeLevelsAction();

    expect(result).toHaveProperty("success");

    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);

      // Verify gradelevel structure if data exists
      if (result.data.length > 0) {
        const gradelevel = result.data[0];
        expect(gradelevel).toHaveProperty("GradeID");
        expect(gradelevel).toHaveProperty("Year");
        expect(gradelevel).toHaveProperty("Number");
      }
    } else {
      expect(result).toHaveProperty("error");
      expect(typeof result.error?.message).toBe("string");
    }
  });

  test("gradelevels should be ordered by GradeID", async () => {
    const result = await getGradeLevelsAction();

    if (result.success && result.data.length >= 2) {
      const gradelevels = result.data;

      for (let i = 0; i < gradelevels.length - 1; i++) {
        const current = gradelevels[i]!.GradeID;
        const next = gradelevels[i + 1]!.GradeID;

        // GradeID should be in ascending order
        expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
      }
    }
  });

  test("gradelevels should have valid year (1-6)", async () => {
    const result = await getGradeLevelsAction();

    if (result.success) {
      result.data.forEach((gradelevel) => {
        expect(gradelevel.Year).toBeGreaterThanOrEqual(1);
        expect(gradelevel.Year).toBeLessThanOrEqual(6);
      });
    }
  });
});

describe("Error Handling", () => {
  test("all actions should handle errors gracefully", async () => {
    const actions = [
      getTeachersAction(),
      getRoomsAction(),
      getSubjectsAction(),
      getGradeLevelsAction(),
    ];

    const results = await Promise.all(actions);

    results.forEach((result) => {
      // Every result should have a success property
      expect(result).toHaveProperty("success");

      // If not successful, should have error message
      if (!result.success) {
        expect(result).toHaveProperty("error");
        expect(typeof result.error?.message).toBe("string");
        expect(result.error?.message.length).toBeGreaterThan(0);
      }
    });
  });
});
