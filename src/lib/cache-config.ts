/**
 * Prisma Accelerate cache tiers.
 *
 * - static: rarely changes (timeslots, grade lookups, term config)
 * - warm: changes on admin edits (stats, counts, lists)
 * - fresh: per-entity detail pages (individual schedules)
 */
export const CACHE_TIERS = {
  static: { ttl: 600, swr: 120 },
  warm: { ttl: 120, swr: 60 },
  fresh: { ttl: 60, swr: 30 },
} as const;

export type CacheTier = keyof typeof CACHE_TIERS;

/**
 * Check whether Prisma Accelerate is active in the current environment.
 */
export function isAccelerateEnabled(): boolean {
  // ACCELERATE_URL is our custom variable; PRISMA_DATABASE_URL is auto-injected
  // by the Vercel Prisma Postgres integration — both activate Accelerate.
  const accelerateUrl =
    process.env.ACCELERATE_URL ?? process.env.PRISMA_DATABASE_URL;
  if (accelerateUrl) return true;

  const dbUrl = process.env.DATABASE_URL;
  return !!(
    dbUrl &&
    (dbUrl.startsWith("prisma://") || dbUrl.startsWith("prisma+postgres://"))
  );
}

/**
 * Returns a `cacheStrategy` object to spread into Prisma read queries.
 * Returns `{}` when Accelerate is not active (local dev / tests).
 *
 * @example
 * ```ts
 * const teachers = await prisma.teacher.findMany({
 *   where: { ... },
 *   ...cacheStrategy("warm", ["teachers"]),
 * });
 * ```
 */
export function cacheStrategy(
  tier: CacheTier,
  tags?: string[],
): object {
  if (!isAccelerateEnabled()) return {};
  const config = CACHE_TIERS[tier];
  return {
    cacheStrategy: {
      ...config,
      ...(tags && tags.length > 0
        ? { tags: tags.map(sanitizeCacheTag) }
        : {}),
    },
  };
}

/**
 * Accelerate rejects the whole query (P6011) if a tag has anything outside
 * [A-Za-z0-9_] or exceeds 64 chars. GradeIDs/ConfigIDs are hyphenated
 * (M1-1, 1-2568), so tag inputs must be mapped, and invalidation must apply
 * the same mapping or its tags won't match the cached ones.
 */
export function sanitizeCacheTag(tag: string): string {
  return tag.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 64);
}
