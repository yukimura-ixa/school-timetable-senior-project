import { NextResponse } from "next/server";

type LoadingStuckEvent = {
  event: "loading_stuck_banner_shown";
  occurredAt: string;
  path?: string;
  search?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoadingStuckEvent;

    if (body?.event !== "loading_stuck_banner_shown" || !body.occurredAt) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    console.info("[telemetry] loading-stuck", body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[telemetry] loading-stuck failed", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
