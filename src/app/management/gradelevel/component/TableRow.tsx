// TableRow.jsx
import React, { Fragment } from "react";
import { BiEdit } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";

function TableRow({
  item,
  index,
  clickToSelect,
  checkedList,
  setEditModalActive,
  pageOfData,
  searchTerm,
}) {
  console.log(item);
  const matchesSearchTerm = item.GradeID.toLowerCase().includes(
    searchTerm.toLowerCase(),
  );

  if (!matchesSearchTerm) {
    return null; // Do not render if it doesn't match the search term
  }

  return (
    <tr className="relative h-[60px] border-b bg-[#FFF] hover:bg-cyan-50 hover:text-cyan-600 even:bg-slate-50 cursor-pointer">
      <th>
        <input
          className="cursor-pointer"
          type="checkbox"
          name="itemdata"
          onChange={() => clickToSelect(item.GradeID)}
          checked={checkedList.includes(item.GradeID)}
        />
      </th>
      {["GradeID", "Year", "Number", "program"].map((key) => (
        <td
          key={key}
          className="px-6 whitespace-nowrap select-none"
          onClick={() => clickToSelect(item.GradeID)}
        >
          {key !== "program"
            ? item[key]
            : Array.isArray(item[key]) && item[key].length > 0
              ? item[key]
                  .map((program) => program.ProgramName)
                  .join(", ")
                  .slice(0, 30) + (item[key].length > 1 ? "..." : "")
              : "ไม่พบข้อมูล"}
        </td>
      ))}
      {checkedList.length < 1 ? (
        <td className="mt-5 flex gap-5 px-6 whitespace-nowrap select-none">
          <BiEdit
            className="fill-[#A16207]"
            size={18}
            onClick={() => {
              setEditModalActive(true), clickToSelect(item.GradeID);
            }}
          />
          {/* Delete action removed - use top toolbar button with multi-select */}
        </td>
      ) : (
        <td className="mt-5 flex gap-5 px-6 whitespace-nowrap select-none" />
      )}
    </tr>
  );
}

export default TableRow;
