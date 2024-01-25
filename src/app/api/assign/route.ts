import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import { teacher, teachers_responsibility, subject, semester } from "@prisma/client"
import { subject_credit, day_of_week } from "@prisma/client"

export async function GET(request: NextRequest) {
  // localhost:3000/api/assign?TeacherID=1&Semester=SEMESTER_1&AcademicYear=2566
  try {
    const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
    const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    const data: teachers_responsibility[] = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: TeacherID,
        AcademicYear: AcademicYear,
        Semester: Semester,
      },
      include: {
        subject: true,
        gradelevel: true
      },
    })
    // const data = await prisma.teachers_responsibility.groupBy({
    //   by: ["SubjectCode", "GradeID", "TeachHour"],
    //   _sum: {
    //     TeachHour: true,
    //   },
    //   where: {
    //     TeacherID: TeacherID,
    //     AcademicYear: AcademicYear,
    //     Semester: Semester,
    //   }
    // })
    return NextResponse.json(data)
  } catch (error) {
    console.log(error)
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
    console.log(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // body: { TeacherID, Prefix, Firstname, Lastname, Department }
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        return prisma.teacher.update({
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
    console.log(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
