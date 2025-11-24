import type { teacher } from "@/prisma/generated/client";
import React from "react";

type Props = {
  teachers: teacher[];
};

const TeacherList = (props: Props) => {
  return (
    <table className="mr-2">
      <thead>
        <th className="flex gap-2 bg-white">
          <td className="w-[50px] h-[60px] flex items-center justify-center bg-slate-100 rounded">
            <p>ลำดับ</p>
          </td>
          <td className="w-[250px] h-[60px] flex items-center justify-center bg-slate-100 rounded">
            <p>ผู้สอน</p>
          </td>
        </th>
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
