import { teacher } from "@prisma/client";
import React from "react";

type Props = {
  teachers: teacher[];
  slotAmount: number[];
  days: string[];
};

const TableBody = (props: Props) => {
  return (
    <tbody>
      {props.teachers.map((item, index) => (
        <tr className="flex items-center gap-2 h-fit mt-1 select-none">
          <td className="w-[50px] h-[60px] flex items-center justify-center bg-slate-100 rounded">
            <p>{index + 1}</p>
          </td>
          <td className="w-[250px] h-[60px] flex items-center justify-center bg-slate-100 rounded">
            <p>
              {item.Prefix}
              {item.Firstname} {item.Lastname}
            </p>
          </td>
          {props.days.map((item) => (
            <td>
              <div className="flex flex-col items-center">
                <div className="flex gap-2 w-fit">
                  {props.slotAmount.map((item) => (
                    <div className="w-10 h-[60px] border-2 border-slate-200 flex items-center justify-center rounded">
                      <p className="text-sm"></p>
                    </div>
                  ))}
                </div>
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
