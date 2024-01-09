import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // query: { TeacherID }
  try {
    const data = await prisma.teacher.findMany({
      orderBy: {
        TeacherID: "asc",
      },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.log(error)
    return NextResponse.error()
  }
}

export async function POST(request: NextRequest) {
  // body: { Prefix, Firstname, Lastname, Department }
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.teacher.create({
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
    return NextResponse.error()
  }
}

export async function DELETE(request: NextRequest) {
  // body: [TeacherID]
  try {
    const body = await request.json()
    const data = await prisma.teacher.deleteMany({
      where: {
        TeacherID: {
          in: body,
        },
      },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.log(error)
    return NextResponse.error()
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
    console.log(error)
    return NextResponse.error()
  }
}
