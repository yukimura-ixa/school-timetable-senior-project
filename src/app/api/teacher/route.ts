import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.teacher.findMany({
      orderBy: {
        TeacherID: "asc",
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.teacher.create({
          data: {
            Prefix: element.Prefix,
            Firstname: element.Firstname,
            Lastname: element.Lastname,
            Department: element.Department,
          },
        });
      })
    );
    const ids = data.map((record) => record.id);

    return NextResponse.json(ids);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  try {
    const data = await prisma.teacher.deleteMany({
      where: {
        TeacherID: {
          in: body,
        },
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}

// export async function DELETE(request: NextRequest) {
//   const body = await request.json();
//   let values = [];
//   body.forEach((element) => {
//     values.push(element);
//   });

//   return NextResponse.json(
//     await prisma.teacher.deleteMany({
//       where: {
//         TeacherID: {
//           in: values,
//         },
//       },
//     })
//   );
// }
/*
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
*/
