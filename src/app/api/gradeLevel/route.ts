import prisma from "@/libs/prisma";
import type { gradelevel } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.gradelevel.findMany({
      orderBy: {
        GradeID: "asc",
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.gradelevel.create({
          data: {
            GradeID: element.GradeID,
            GradeProgram: element.GradeProgram,
            Year: element.Year,
            Number: element.Number,
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
  try {
    const body = await request.json();
    const data = await prisma.gradelevel.deleteMany({
      where: {
        GradeID: {
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.gradelevel.update({
          where: {
            GradeID: element.GradeID,
          },
          data: {
            GradeProgram: element.GradeProgram,
            Year: element.Year,
            Number: element.Number,
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
