import pool from "../conn";

export async function GET(request: Request) {
  const [data, f] = await pool.promise().query(`SELECT * FROM \`subject\``);

  return Response.json(data);
}
