import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const log = createLogger("TelemetryLoadingStuck");

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

    log.info("Loading stuck telemetry", body);

    return NextResponse.json({ success: true });
  } catch (error) {
    log.logError(error, { route: "telemetry/loading-stuck" });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
