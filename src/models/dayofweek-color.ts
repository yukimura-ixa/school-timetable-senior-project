import { day_of_week } from "@/prisma/generated"

type DayOfWeekColor = {
  [day_of_week: string]: string
}

export const dayOfWeekColor: DayOfWeekColor = {
  [day_of_week.MON]: "#fff4bd",
  [day_of_week.TUE]: "#f9bdff",
  [day_of_week.WED]: "#c9ffbd",
  [day_of_week.THU]: "#ffddbd",
  [day_of_week.FRI]: "#bde4ff",
};

