import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { safeParseInt } from "@/functions/parseUtils";
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const hasTeacherID = request.nextUrl.searchParams.has("TeacherID");
    
    if (hasTeacherID) {
      const TeacherID = safeParseInt(request.nextUrl.searchParams.get("TeacherID"));
      
      const validation = validateRequiredParams({ TeacherID });
      if (validation) return validation;

      const data = await prisma.teacher.findUnique({
        where: {
          TeacherID: TeacherID!,
        },
      });
      return NextResponse.json(data);
    } else {
      const data = await prisma.teacher.findMany({
        orderBy: {
          Firstname: "asc",
        },
      });
      return NextResponse.json(data);
    }
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch teacher data");
  }
}

export async function POST(request: NextRequest) {
  // body: { Prefix, Firstname, Lastname, Department, Email }
  try {
    const body = await request.json();
    const data = await Promise.all(
      body.map(async (element: {
        Prefix: string;
        Firstname: string;
        Lastname: string;
        Email: string;
        Department: string;
      }) => {
        const alreadyExist = await prisma.teacher.findFirst({
          where: {
            Prefix: element.Prefix,
            Firstname: element.Firstname,
            Lastname: element.Lastname,
            Email: element.Email,
            Department: element.Department,
          },
        });
        if (alreadyExist) {
          throw new Error("มีข้อมูลอยู่แล้ว กรุณาตรวจสอบอีกครั้ง");
        }
        const emailAlreadyExist = await prisma.teacher.findFirst({
          where: {
            Email: element.Email,
          },
        });
        if (emailAlreadyExist) {
          throw new Error("เพิ่มอีเมลซ้ำ กรุณาตรวจสอบอีกครั้ง");
        }
        return await prisma.teacher.create({
          data: {
            Prefix: element.Prefix,
            Firstname: element.Firstname,
            Lastname: element.Lastname,
            Department: element.Department,
            Email: element.Email
          },
        });
      })
    );
    const ids = data.map((record) => record.TeacherID);

    return NextResponse.json(ids);
  } catch (error) {
    return createErrorResponse(error, "Failed to create teacher records");
  }
}

export async function DELETE(request: NextRequest) {
  // body: [TeacherID]
  try {
    const body: number[] = await request.json();
    const data = await prisma.teacher.deleteMany({
      where: {
        TeacherID: {
          in: body,
        },
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    return createErrorResponse(error, "Failed to delete teacher records");
  }
}

export async function PUT(request: NextRequest) {
  // body: { TeacherID, Prefix, Firstname, Lastname, Department, Email }
  try {
    const body = await request.json();
    const data = await Promise.all(
      body.map(async (element: {
        TeacherID: number;
        Prefix: string;
        Firstname: string;
        Lastname: string;
        Email: string;
        Department: string;
      }) => {
        const alreadyExist = await prisma.teacher.findUnique({
          where: {
            TeacherID: element.TeacherID,
          },
        });
        if (!alreadyExist) {
          throw new Error("ไม่พบข้อมูลของครูท่านนี้");
        }
        return await prisma.teacher.update({
          where: {
            TeacherID: element.TeacherID,
          },
          data: {
            Prefix: element.Prefix,
            Firstname: element.Firstname,
            Lastname: element.Lastname,
            Department: element.Department,
            Email: element.Email
          },
        });
      })
    );
    const ids = data.map((record) => record.TeacherID);

    return NextResponse.json(ids);
  } catch (error) {
    return createErrorResponse(error, "Failed to update teacher records");
  }
}
