import type { teacher } from "@/prisma/generated/client";
import React from "react";

type Props = {
  teachers: teacher[];
};

const TeacherList = (props: Props) => {
  return (
    <table className="mr-2">
      <thead>
        <tr className="flex gap-2 bg-white">
          <th className="w-[50px] h-[60px] bg-slate-100 rounded">
            <div className="h-full flex items-center justify-center">
              <p>ลำดับ</p>
            </div>
          </th>
          <th className="w-[250px] h-[60px] bg-slate-100 rounded">
            <div className="h-full flex items-center justify-center">
              <p>ชื่อครู</p>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {props.teachers.map((item, index) => (
          <tr
            key={item.TeacherID}
            className="flex items-center gap-2 h-fit mt-1 select-none"
          >
            <td className="w-[50px] h-[60px] flex items-center justify-center bg-slate-100 rounded">
              <p>{index + 1}</p>
            </td>
            <td className="w-[250px] h-[60px] flex items-center justify-center bg-slate-100 rounded">
              <p>
                {item.Prefix}
                {item.Firstname} {item.Lastname}
              </p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TeacherList;
