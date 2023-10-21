import pool from "../conn";

export async function GET(request: Request) {
  const [data, f] = await pool.promise()
    .query(`SELECT * FROM school_timetable.subject
  where Category = "ชุมนุม" or Category = "กิจกรรม"`);

  return Response.json(data);
}
