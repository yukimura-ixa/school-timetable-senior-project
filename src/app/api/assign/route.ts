import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import type { teacher, teachers_responsibility, subject } from "@prisma/client"
import { subject_credit, day_of_week } from "@prisma/client"

export async function GET(request: NextRequest) {
  // query: { TeacherID }
  try {
    const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
    const data: teachers_responsibility[] = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: TeacherID,
      },
      include: {
        subject: true,
        gradelevel: true,
      },
    })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // body: {  TeacherID, GradeID, SubjectCode, AcademicYear, Semester, TeachHour}
  try {
    const body = await request.json()
    const data = await prisma.teachers_responsibility.create({
      data: {
        AcademicYear: body.AcademicYear,
        Semester: body.Semester,
        TeachHour: body.TeachHour,
        teacher: {
          connect: {
            TeacherID: body.TeacherID,
          },
        },
        subject: {
          connect: {
            SubjectCode: body.SubjectCode,
          },
        },
        gradelevel: {
          connect: {
            GradeID: body.GradeID,
          },
        },
      }
    })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // body: { TeacherID, Prefix, Firstname, Lastname, Department }
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.teacher.update({
          where: {
            TeacherID: element.TeacherID,
          },
          data: {
            Prefix: element.Prefix,
            Firstname: element.Firstname,
            Lastname: element.Lastname,
            Department: element.Department,
          },
        })
      })
    )
    const ids = data.map((record) => record.id)

    return NextResponse.json(ids)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
