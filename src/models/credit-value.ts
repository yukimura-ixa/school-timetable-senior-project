import { subject_credit } from @/prisma/generated/client"

type SubjectCreditValues = {
  [subject_credit: string]: number
}

export const subjectCreditValues: SubjectCreditValues = {
  [subject_credit.CREDIT_05]: 0.5,
  [subject_credit.CREDIT_10]: 1.0,
  [subject_credit.CREDIT_15]: 1.5,
  [subject_credit.CREDIT_20]: 2.0,
}
