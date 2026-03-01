"use server";

import prisma from "@/lib/prisma";
import { isAccelerateEnabled } from "@/lib/cache-config";

/**
 * Invalidate Prisma Accelerate cache for given tags.
 * No-op when Accelerate is not active (local dev / tests).
 * Non-fatal on failure — TTL is the safety net.
 */
export async function invalidatePublicCache(tags: string[]): Promise<void> {
  if (!isAccelerateEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        "[cache] Accelerate not active, skipping invalidation for:",
        tags,
      );
    }
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).$accelerate.invalidate({ tags });
  } catch (err) {
    console.warn("[cache] Invalidation failed:", err);
  }
}
