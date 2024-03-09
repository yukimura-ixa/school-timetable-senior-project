import prisma from "@/libs/prisma"
import type { gradelevel } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {

  try {
    const data: gradelevel[] = await prisma.gradelevel.findMany({
      orderBy: {
        GradeID: "asc",
      },
      include: {
        program: true,
      }
    })
    return NextResponse.json(data)
  } catch (error) {
    console.log(error)
    return NextResponse.json(error.message, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // body: [{ Year, Number }]
  try {
    const body = await request.json()
    const data = await Promise.all(


      body.map(async (element) => {
        const alreadyExist = await prisma.gradelevel.findFirst({
          where: {
            Year: element.Year,
            Number: element.Number,
          },
        })
        if (alreadyExist) {
          throw new Error("มีข้อมูลชั้นปีนี้อยู่แล้ว กรุณาตรวจสอบอีกครั้ง")
        }
        return await prisma.gradelevel.create({
          data: {
            GradeID: element.Year + '0' + element.Number,
            Year: element.Year,
            Number: element.Number,
          },
        })
      })
    )
    const ids = data.map((record) => record.id)

    return NextResponse.json(ids)
  } catch (error) {
    console.log(error)
    return NextResponse.json(error.message, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  // body: [GradeID]
  try {
    const body = await request.json()
    const data = await prisma.gradelevel.deleteMany({
      where: {
        GradeID: {
          in: body,
        },
      },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.log(error)
    return NextResponse.json(error.message, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // body: [{ GradeID, Year, Number }]
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        const alreadyExist = await prisma.gradelevel.findFirst({
          where: {
            Year: element.Year,
            Number: element.Number,
          },
        })
        if (!alreadyExist) {
          throw new Error("ไม่พบข้อมูลชั้นเรียน กรุณาตรวจสอบอีกครั้ง")
        }
        return await prisma.gradelevel.update({
          where: {
            GradeID: element.GradeID,
          },
          data: {
            Year: element.Year,
            Number: element.Number,
          },
        })
      })
    )
    const ids = data.map((record) => record.id)

    return NextResponse.json(ids)
  } catch (error) {
    console.log(error)
    return NextResponse.json(error.message, { status: 500 })
  }
}
