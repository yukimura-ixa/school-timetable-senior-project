import type { PrismaClient } from "@/prisma/generated/client";

/**
 * Inserts a class_schedule row that forces a TEACHER_CONFLICT when the E2E
 * user attempts to drag another subject onto the same slot with the same
 * teacher for a different grade.
 *
 * Idempotent: deletes any row matching the same (timeslot, subject, grade)
 * tuple before inserting.
 */
export async function seedConflict({
  prisma,
  timeslotId,
  teacherRespId,
  subjectCode,
  gradeId,
  roomId,
}: {
  prisma: PrismaClient;
  timeslotId: string;
  teacherRespId: number;
  subjectCode: string;
  gradeId: string;
  roomId: number;
}): Promise<{ classId: number }> {
  await prisma.class_schedule.deleteMany({
    where: {
      TimeslotID: timeslotId,
      SubjectCode: subjectCode,
      GradeID: gradeId,
    },
  });
  const created = await prisma.class_schedule.create({
    data: {
      TimeslotID: timeslotId,
      SubjectCode: subjectCode,
      GradeID: gradeId,
      RoomID: roomId,
      IsLocked: false,
      teachers_responsibility: {
        connect: { RespID: teacherRespId },
      },
    },
  });
  return { classId: created.ClassID };
}
