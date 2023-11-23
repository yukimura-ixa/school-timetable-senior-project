import { getPool } from "@/services/db";

export async function GET(request: Request) {
  const pool = await getPool();
  const [data, f] = await pool.query(`SELECT * FROM \`teacher\``);

  return Response.json(data);
}

export async function POST(request: Request) {
  const pool = await getPool();
  const body = await request.json();
  let query = `INSERT INTO \`teacher\` (\`Prefix\`, \`Firstname\`, \`Lastname\`, \`Department\`) VALUES ?`;
  let values = [];
  body.forEach((element) => {
    values.push([
      element.Prefix,
      element.Firstname,
      element.Lastname,
      element.Department,
    ]);
  });

  return Response.json(
    await pool.query(query, [values], (err, result) => {
      if (err) {
        return Response.error();
      }
    })
  );
}
