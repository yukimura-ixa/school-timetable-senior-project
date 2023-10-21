import { getPool } from "@/services/db";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const pool = await getPool();
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("TeacherID");
  const [teacher, teacherField] = await pool.query(
    `SELECT * from teacher where TeacherID=${query}`
  );
  const [teacher_responsibility, teacher_responsibilityField] =
    await pool.query(`SELECT teacher.TeacherID, subject.SubjectID, subject.SubjectCode, subject.SubjectName, teaches.GradeID, gradeLevel.Year, gradeLevel.Number, teaches.TeachHour
            FROM teacher
            JOIN teaches ON teacher.TeacherID = teaches.TeacherID
            JOIN gradelevel ON teaches.GradeID = gradeLevel.GradeID
            JOIN subject ON teaches.SubjectID = subject.SubjectID
            WHERE teacher.TeacherID = ${query};`);
  let resToJson = JSON.parse(JSON.stringify(teacher_responsibility)); //เอา object ที่คิวรี่มา JSON.stringify แล้วค่อย แปลงเป็น JSON อีกทีเพื่อเอามาใช้
  let mapClassRoom = resToJson.map((item: any) => item.GradeID); //map เอารหัสชั้นเรียน เช่น 101 102 303
  let mapSubject = resToJson.map((item: any) => ({
    GradeID: item.GradeID,
    SubjectID: item.SubjectID,
    SubjectCode: item.SubjectCode,
    SubjectName: item.SubjectName,
    TeachHour: item.TeachHour,
  }));
  let mapGrade = resToJson.map((item: any) => item.Year); //map เอาตัวแรกของรหัสชั้นเรียน เช่น 604 เป็น 6 เอาค่านี้ไว้ใช้เป็นชั้นเรียน
  let removeDulpicateGrade = [...new Set(mapGrade)]; //ใช้คำสั่ง new Set() แล้ว spread array เพื่อกำจัดตัวซ้ำออกไป เช่น [1, 1, 2, 3, 3] => [1, 2, 3]
  let removeDulpicateClassRooms = [...new Set(mapClassRoom)];
  let createGradeObj = removeDulpicateGrade.map((year: any) => ({
    //ใช้เก็บ Object ของชั้นเรียนและห้องเรียน
    Year: year, //เก็บชั้นเรียน (Year : "1")
    //เก็บห้องเรียนเป็น array (ClassRoom : [])
    ClassRooms: removeDulpicateClassRooms
      .map(
        (
          room: any //map array แยกห้องเรียนไปหาแต่ละชั้น
        ) =>
          year == room[0]
            ? {
                GradeID: parseInt(room),
                Subjects: mapSubject
                  .filter((item) => item.GradeID == room)
                  .map((item) => ({
                    SubjectID: item.SubjectID,
                    SubjectCode: item.SubjectCode,
                    SubjectName: item.SubjectName,
                    TeachHour: item.TeachHour,
                  })),
              }
            : null //เช็คว่า year และ room[0] (เลขหน้าสุดของ string บ่งบอกชั้นเรียน) เท่ากันไหม ถ้าใช่ก็ return ค่าออกมา ถ้าไม่ก็เก็บ null ไปก่อน
      )
      .filter((item: any) => item !== null), //filter array โดยเอา null ออก ["101", "102", null] => ["101", "102"]
  }));
  return Response.json({ Teacher: { ...teacher[0] }, Grade: createGradeObj });
}

// export function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams
//   query is "hello" for /api/search?query=hello
// }
