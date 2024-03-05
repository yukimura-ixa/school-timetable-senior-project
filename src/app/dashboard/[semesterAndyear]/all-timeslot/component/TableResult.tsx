import { teacher } from "@prisma/client";
import React from "react";

type Props = {
  teachers: teacher[];
  classData: object[];
};

const TableResult = (props: Props) => {
  return (
    <table className="ml-3">
      <thead>
        <th className="flex gap-2 bg-white">
          <td className="w-[50px] h-[60px] flex items-center justify-center bg-slate-100 rounded">
            <p>รวม</p>
          </td>
        </th>
      </thead>
      <tbody>
        {props.teachers.map((tch, index) => (
          <tr className="flex items-center gap-2 h-fit mt-1 select-none">
            <td className="w-[50px] h-[59.8px] flex items-center justify-center bg-slate-100 rounded">
              <p className="text-sm">
                {
                  props.classData.filter((item) =>
                    item.subject.teachers_responsibility
                      .map((tid) => tid.TeacherID)
                      .includes(tch.TeacherID),
                  ).length
                }
              </p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableResult;
