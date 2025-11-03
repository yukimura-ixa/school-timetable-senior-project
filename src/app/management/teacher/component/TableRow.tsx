// TableRow.jsx
import React, { Fragment } from "react";
import { BiEdit } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";
import type { teacher } from "@/prisma/generated";

type TableRowProps = {
  item: teacher;
  index: number;
  clickToSelect: (id: number) => void;
  checkedList: number[];
  setEditModalActive: (active: boolean) => void;
  pageOfData: teacher[];
  searchTerm: string;
};

function TableRow({
  item,
  index,
  clickToSelect,
  checkedList,
  setEditModalActive,
  pageOfData,
  searchTerm,
}: TableRowProps) {
  const matchesSearchTerm =
    item.Firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Lastname.toLowerCase().includes(searchTerm.toLowerCase());

  if (!matchesSearchTerm) {
    return null; // Do not render if it doesn't match the search term
  }

  return (
    <tr className="h-[60px] border-b bg-[#FFF] hover:bg-cyan-50 hover:text-cyan-600 even:bg-slate-50 cursor-pointer">
      <th>
        <input
          className="cursor-pointer"
          type="checkbox"
          name="itemdata"
          onChange={() => clickToSelect(item.TeacherID)}
          checked={checkedList.includes(item.TeacherID)}
        />
      </th>
      {(["Prefix", "Firstname", "Lastname", "Department", "Email"] as const).map((key) => (
        <td
          key={key}
          className="px-6 whitespace-nowrap select-none"
          onClick={() => clickToSelect(item.TeacherID)}
        >
          {item[key]}
        </td>
      ))}
      {checkedList.length < 1 && (
        <td className="mt-5 flex gap-5 px-6 whitespace-nowrap select-none">
          <BiEdit
            className="fill-[#A16207]"
            size={18}
            onClick={() => {
              setEditModalActive(true), clickToSelect(item.TeacherID);
            }}
          />
          {/* Delete action removed - use top toolbar button with multi-select */}
        </td>
      )}
    </tr>
  );
}

export default TableRow;
