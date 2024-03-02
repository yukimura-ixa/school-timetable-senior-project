import { teacher } from "@prisma/client";
import React from "react";

type Props = {
  teachers: teacher[];
  slotAmount: number[];
  days: object[];
};

const TableBody = (props: Props) => {
  return (
    <tbody>
      {props.teachers.map((item, index) => (
        <tr className="flex items-center gap-2 mt-[2px] h-fit select-none">
          {props.days.map((day) => (
                <td>
                    <div className="flex flex-col items-center">
                        <div className="flex gap-2 w-fit">
                        {props.slotAmount.map((item, index) => (
                            <div style={{borderColor : day.BgColor}} className={`relative w-10 h-[60px] border-2 flex items-center justify-center rounded`}>
                                <p className="text-xs absolute left-0 top-[-2px] text-gray-300">{index+1}</p>
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
