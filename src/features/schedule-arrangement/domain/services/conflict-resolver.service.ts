/**
 * Conflict Resolver — pure ranking for conflict resolution suggestions.
 *
 * Given a ResolutionContext (conflict + attempt + world snapshot), produce up
 * to N ranked `ResolutionSuggestion`s. No I/O, no React, no Prisma — every
 * input is passed in explicitly so unit tests can exercise every branch.
 */

import type {
  ResolutionContext,
  ResolutionSuggestion,
} from "../models/conflict.model";

export interface SuggestOptions {
  maxSuggestions?: number;
}

export function suggestResolutions(
  ctx: ResolutionContext,
  opts: SuggestOptions = {},
): ResolutionSuggestion[] {
  if (!ctx.conflict.hasConflict) return [];
  const _max = opts.maxSuggestions ?? 3;
  // Candidate generation filled in by subsequent tasks.
  return [];
}
