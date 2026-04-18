"use server";

import prisma from "@/lib/prisma";
import { isAccelerateEnabled } from "@/lib/cache-config";
import { createLogger } from "@/lib/logger";

const log = createLogger("CacheInvalidation");

/**
 * Invalidate Prisma Accelerate cache for given tags.
 * No-op when Accelerate is not active (local dev / tests).
 * Non-fatal on failure — TTL is the safety net.
 */
export async function invalidatePublicCache(tags: string[]): Promise<void> {
  if (!isAccelerateEnabled()) {
    log.debug("Accelerate not active, skipping invalidation", { tags });
    return;
  }

  try {
    const client = prisma as unknown as {
      $accelerate: { invalidate: (opts: { tags: string[] }) => Promise<void> };
    };
    await client.$accelerate.invalidate({ tags });
  } catch (err) {
    log.warn("Cache invalidation failed", {
      tags,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
