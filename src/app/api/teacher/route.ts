import { getPool } from "@/services/db";

export async function GET(request: Request) {
  const pool = await getPool();
  const [data, f] = await pool.query(`SELECT * FROM \`teacher\` ORDER BY TeacherID DESC`);

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
export async function DELETE(request: Request) {
  const pool = await getPool();
  const body = await request.json();
  let values = [];
  body.forEach((element) => {
    values.push(element);
  });
  let query = `DELETE FROM \`teacher\` WHERE TeacherID IN (${values})`;

  return Response.json(
    await pool.query(query, [values], (err, result) => {
      if (err) {
        return Response.error();
      }
    })
  );
}

export async function PUT(request: Request) {
  const pool = await getPool();
  const body = await request.json();
  let values = [];
  let teacherID = [];
  body.data.forEach((element) => {
    values.push([
      element.Prefix,
      element.Firstname,
      element.Lastname,
      element.Department,
    ]);
  });
  body.TeacherID.forEach((element) => {
    teacherID.push([
      element
    ]);
  });
  let query = `UPDATE \`teacher\` SET Prefix = ? Firstname = ? Lastname = ? Department = ? WHERE TeacherID = ?`;

  return Response.json(
    await pool.query(query, [values], (err, result) => {
      if (err) {
        return Response.error();
      }
    })
  );
}
