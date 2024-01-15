import prisma from "@/libs/prisma"
import { type subject } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const data: subject[] = await prisma.subject.findMany({
      orderBy: {
        SubjectCode: "asc",
      },
    })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.subject.create({
          data: {
            SubjectCode: element.SubjectCode,
            SubjectName: element.SubjectName,
            ProgramID: null,
            Credit: element.Credit,
            Category: element.Category,
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
  try {
    const body = await request.json()
    const data = await prisma.subject.deleteMany({
      where: {
        SubjectCode: {
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
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.subject.update({
          where: {
            SubjectCode: element.SubjectCode,
          },
          data: {
            SubjectCode: element.SubjectCode,
            SubjectName: element.SubjectName,
            ProgramID: null,
            Credit: element.Credit,
            Category: element.Category,
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
