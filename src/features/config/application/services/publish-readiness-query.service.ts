/**
 * Application Service: Publish Readiness Query
 * 
 * Orchestrates the process of checking if a semester is ready to be published.
 * This service is intended to be called from server-side contexts like
 * Server Actions or API Routes.
 */
'use server';

import { checkPublishReadiness } from '../../domain/services/publish-readiness.service';
import type { PublishReadinessResult } from '../../domain/types/publish-readiness-types';
import { findFullConfigData } from '../../infrastructure/repositories/config.repository';

/**
 * Fetches all necessary data for a semester configuration and checks its publish readiness.
 * 
 * @param configId - The ID of the configuration (e.g., "1-2567").
 * @returns The publish readiness result, or null if the config is not found.
 */
export async function getPublishReadiness(configId: string): Promise<PublishReadinessResult | null> {
  const configData = await findFullConfigData(configId);
  
  if (!configData) {
    return null;
  }
  
  return checkPublishReadiness(configData);
}
