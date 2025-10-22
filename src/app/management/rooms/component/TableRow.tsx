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
  const matchesSearchTerm =
    item.RoomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Building.toLowerCase().includes(searchTerm.toLowerCase());

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
          onChange={() => clickToSelect(item.RoomID)}
          checked={checkedList.includes(item.RoomID)}
        />
      </th>
      {["RoomName", "Building", "Floor"].map((key) => (
        <td
          key={key}
          className="px-6 whitespace-nowrap select-none"
          onClick={() => clickToSelect(item.RoomID)}
        >
          {item[key]}
        </td>
      ))}
      {checkedList.length < 1 ? (
        <td className="mt-5 flex items-center justify-center gap-5 px-6 whitespace-nowrap select-none">
          <BiEdit
            className="fill-[#A16207]"
            size={18}
            onClick={() => {
              setEditModalActive(true), clickToSelect(item.RoomID);
            }}
          />
          {/* Delete action removed - use top toolbar button with multi-select */}
        </td>
      ) : <td className="mt-5 flex gap-5 px-6 whitespace-nowrap select-none" />}
    </tr>
  );
}

export default TableRow;
