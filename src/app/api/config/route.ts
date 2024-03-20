import { NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
    try {
        const data = await prisma.table_config.findMany({
            orderBy: {
                ConfigID: "asc"
            }
        })
        return NextResponse.json(data)

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}