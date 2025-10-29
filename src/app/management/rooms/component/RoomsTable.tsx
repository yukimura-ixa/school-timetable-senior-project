"use client";
import type { room } from "@/prisma/generated";
import { EditableTable, type ColumnDef, type ValidationFn } from "@/components/tables";
import { deleteRoomsAction, updateRoomsAction } from "@/features/room/application/actions/room.actions";

type RoomsTableProps = {
  tableData: room[];
  mutate: () => void | Promise<void>;
};

// Column definitions for rooms table
const roomColumns: ColumnDef<room>[] = [
  {
    key: "RoomID",
    label: "ID",
    editable: false, // Protected - primary key
    width: 80,
  },
  {
    key: "RoomName",
    label: "ชื่อห้อง",
    editable: true,
    required: true,
    type: "text",
  },
  {
    key: "Building",
    label: "อาคาร",
    editable: true,
    type: "text",
  },
  {
    key: "Floor",
    label: "ชั้น",
    editable: true,
    type: "text",
  },
];

// Validation function for rooms
const validateRoom: ValidationFn<room> = (id, data, allData) => {
  // Check required fields
  if (!data.RoomName || data.RoomName.trim() === "") {
    return "ชื่อห้องต้องไม่เป็นค่าว่าง";
  }

  // Check length
  if (data.RoomName.length > 50) {
    return "ชื่อห้องต้องไม่เกิน 50 ตัวอักษร";
  }

  // Check for duplicate room name (excluding current row)
  const duplicate = allData.find(
    (r) =>
      r.RoomName.toLowerCase() === data.RoomName.toLowerCase().trim() &&
      (typeof id === "string" || r.RoomID !== id)
  );

  if (duplicate) {
    return "ชื่อห้องซ้ำกับห้องที่มีอยู่แล้ว";
  }

  return null;
};

// Empty room factory for creating new rows
const createEmptyRoom = (): Partial<room> => ({
  RoomName: "",
  Building: "-",
  Floor: "-",
});

// Wrapper for create action (maps to update with no ID)
const handleCreate = async (newRoom: Partial<room>) => {
  return await updateRoomsAction([
    {
      RoomName: newRoom.RoomName?.trim() || "",
      Building: newRoom.Building?.trim() || "-",
      Floor: newRoom.Floor?.trim() || "-",
    },
  ]);
};

// Wrapper for update action
const handleUpdate = async (rooms: Partial<room>[]) => {
  return await updateRoomsAction(
    rooms.map((r) => ({
      RoomID: r.RoomID as number,
      RoomName: r.RoomName?.trim() || "",
      Building: r.Building?.trim() || "-",
      Floor: r.Floor?.trim() || "-",
    }))
  );
};

// Wrapper for delete action
const handleDelete = async (ids: (string | number)[]) => {
  return await deleteRoomsAction({ roomIds: ids as number[] });
};

export default function RoomsTable({ tableData, mutate }: RoomsTableProps) {
  return (
    <EditableTable<room>
      title="จัดการสถานที่เรียน"
      columns={roomColumns}
      data={tableData}
      idField="RoomID"
      searchFields={["RoomName", "Building"]}
      searchPlaceholder="ค้นหาชื่อสถานที่หรืออาคาร"
      validate={validateRoom}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onMutate={mutate}
      emptyRowFactory={createEmptyRoom}
      rowsPerPageOptions={[5, 10, 25]}
      defaultRowsPerPage={10}
    />
  );
}
