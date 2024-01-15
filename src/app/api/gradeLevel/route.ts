import prisma from "@/libs/prisma"
import type { gradelevel } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {

  try {
    const data: gradelevel[] = await prisma.gradelevel.findMany({
      orderBy: {
        GradeID: "asc",
      },
    })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // body: [{ Year, Number }]
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.gradelevel.create({
          data: {
            GradeID: element.Year + '0' + element.Number,
            ProgramID: null,
            Year: element.Year,
            Number: element.Number,
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
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // body: [{ GradeID, Year, Number }]
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.gradelevel.update({
          where: {
            GradeID: element.GradeID,
          },
          data: {
            // ProgramID: element.ProgramID,
            Year: element.Year,
            Number: element.Number,
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
