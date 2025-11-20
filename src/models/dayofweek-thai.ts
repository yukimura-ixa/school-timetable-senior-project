import { day_of_week } from @/prisma/generated/client"

type DayOfWeekThai = {
  [day_of_week: string]: string
}

export const dayOfWeekThai: DayOfWeekThai = {
  [day_of_week.MON]: "จันทร์",
  [day_of_week.TUE]: "อังคาร",
  [day_of_week.WED]: "พุธ",
  [day_of_week.THU]: "พฤหัสบดี",
  [day_of_week.FRI]: "ศุกร์",
  [day_of_week.SAT]: "เสาร์",
  [day_of_week.SUN]: "อาทิตย์",
};

