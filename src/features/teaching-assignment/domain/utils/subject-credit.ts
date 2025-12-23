import { subject_credit } from "@/prisma/generated/client";

/**
 * Convert subject_credit enum to numeric value
 */
export function subjectCreditToNumber(credit: subject_credit | string): number {
  switch (credit) {
    case subject_credit.CREDIT_05:
    case "CREDIT_05":
      return 0.5;
    case subject_credit.CREDIT_10:
    case "CREDIT_10":
      return 1.0;
    case subject_credit.CREDIT_15:
    case "CREDIT_15":
      return 1.5;
    case subject_credit.CREDIT_20:
    case "CREDIT_20":
      return 2.0;
    default:
      // Try to parse if it's already a numeric string
      const parsed = parseFloat(String(credit));
      return isNaN(parsed) ? 0 : parsed;
  }
}
