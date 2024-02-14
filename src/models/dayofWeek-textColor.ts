import { day_of_week } from "@prisma/client";

type dayOfWeekTextColor = {
  [key in day_of_week]: string;
};

export const dayOfWeekTextColor: dayOfWeekTextColor = {
  [day_of_week.MON]: "#8f843c",
  [day_of_week.TUE]: "#d400fa",
  [day_of_week.WED]: "#32c900",
  [day_of_week.THU]: "#c95700",
  [day_of_week.FRI]: "#0040c9",
};