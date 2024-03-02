import React, { Fragment } from "react";
import { BiEdit } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";
import { subjectCreditTitles } from "@/models/credit-titles";

function TableRow({
  item,
  index,
  clickToSelect,
  checkedList,
  setEditModalActive,
  setDeleteModalActive,
  pageOfData,
  searchTerm,
}) {
  const matchesSearchTerm =
    item.SubjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.SubjectCode.toLowerCase().includes(searchTerm.toLowerCase());

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
          onChange={() => clickToSelect(item.SubjectCode)}
          checked={checkedList.includes(item.SubjectCode)}
        />
      </th>
      {["SubjectCode", "SubjectName", "Credit", "Category"].map((key) => (
        <td
          key={key}
          className="px-6 whitespace-nowrap select-none"
          onClick={() => clickToSelect(item.SubjectCode)}
        >
          {key === "Credit" ? subjectCreditTitles[item[key]] : item[key]}
        </td>
      ))}
      {checkedList.length < 1 ? (
        <td className="mt-5 flex gap-5 px-6 whitespace-nowrap select-none">
          <BiEdit
            className="fill-[#A16207]"
            size={18}
            onClick={() => {
              setEditModalActive(true), clickToSelect(item.SubjectCode);
            }}
          />
          <TbTrash
            className="text-red-500"
            size={18}
            onClick={() => {
              setDeleteModalActive(true), clickToSelect(item.SubjectCode);
            }}
          />
        </td>
      ) : <td className="mt-5 flex gap-5 px-6 whitespace-nowrap select-none" />}
    </tr>
  );
}

export default TableRow;
