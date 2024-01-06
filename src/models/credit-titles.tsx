import { subject_credit } from "@prisma/client";

type SubjectCreditWithTitles = {
  [key in subject_credit]: string;
};

export const subjectCreditTitles: SubjectCreditWithTitles = {
  [subject_credit.CREDIT_05]: "0.5",
  [subject_credit.CREDIT_10]: "1.0",
  [subject_credit.CREDIT_15]: "1.5",
  [subject_credit.CREDIT_20]: "2.0",
};
