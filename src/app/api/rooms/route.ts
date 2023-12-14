import prisma from "@/libs/prisma"
import type { room } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.room.findMany({
      orderBy: {
        RoomID: "asc",
      },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.log(error)
    return NextResponse.error()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.room.create({
          data: {
            RoomName: element.RoomName,
            Building: element.Building,
            Floor: element.Floor,
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
  try {
    const body = await request.json()
    const data = await prisma.room.deleteMany({
      where: {
        RoomID: {
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
  try {
    const body = await request.json()
    const data = await Promise.all(
      body.map(async (element) => {
        return await prisma.room.update({
          where: {
            RoomID: element.RoomID,
          },
          data: {
            RoomName: element.RoomName,
            Building: element.Building,
            Floor: element.Floor,
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
