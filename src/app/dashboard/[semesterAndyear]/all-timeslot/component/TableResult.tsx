import { teacher } from "@prisma/client";

type ClassData = {
  teachers_responsibility: Array<{ TeacherID: number }>;
  TimeslotID: string;
  [key: string]: any;
};

type Props = {
  teachers: teacher[];
  classData: ClassData[];
};

const TableResult = (props: Props) => {
  const findResult = (tID: number) => {
    let filter1 = props.classData.filter((item) =>
      item.teachers_responsibility
        .map((tid) => tid.TeacherID)
        .includes(tID),
    );
    let filter2 = filter1.filter((cid, index) => filter1.findIndex(item => item.TimeslotID == cid.TimeslotID) == index)
    return filter2.length;
  };
  return (
    <table className="ml-3">
      <thead>
        <th className="flex gap-2 bg-white">
          <td className="w-[50px] h-[60px] flex items-center justify-center bg-slate-100 rounded">
            <p onClick={() => console.log(props.classData)}>รวมคาบ</p>
          </td>
        </th>
      </thead>
      <tbody>
        {props.teachers.map((tch, index) => (
          <tr key={tch.TeacherID} className="flex items-center gap-2 h-fit mt-1 select-none">
            <td className="w-[50px] h-[59.8px] flex items-center justify-center bg-slate-100 rounded">
              <p className="text-sm">
                {
                  findResult(tch.TeacherID)
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
