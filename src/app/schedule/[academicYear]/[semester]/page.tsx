import { redirect } from "next/navigation";

import { getWizardState } from "@/features/schedule-wizard/application/services/wizard-state.service";
import {
  WIZARD_STEPS,
  furthestReachableStep,
} from "@/features/schedule-wizard/domain/wizard-steps";

/**
 * Base schedule route. The wizard chrome lives in the layout; this page just
 * forwards the user to the furthest step they can currently reach, so they
 * resume where the term's progress left off instead of always landing on step 1.
 */
export default async function Schedule({
  params,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  const { academicYear, semester } = await params;
  const year = parseInt(academicYear, 10);
  const sem = parseInt(semester, 10) as 1 | 2;

  const state = await getWizardState(year, sem);
  const key = furthestReachableStep(state);
  const segment = WIZARD_STEPS.find((s) => s.key === key)?.segment ?? "config";

  redirect(`/schedule/${academicYear}/${semester}/${segment}`);
}
