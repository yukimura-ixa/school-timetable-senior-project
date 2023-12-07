import { getPool } from "@/libs/prisma";

export async function GET(request: Request) {
  const pool = await getPool();
  const [data, f] = await pool.query(`SELECT * FROM school_timetable.subject
  where Category = "ชุมนุม" or Category = "กิจกรรม"`);

  return Response.json(data);
}
