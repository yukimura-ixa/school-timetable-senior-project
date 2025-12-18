"use client";
import {
  EditableTable,
  type ColumnDef,
  type ValidationFn,
} from "@/components/tables";
import type { program, $Enums } from "@/prisma/generated/client";
import {
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
} from "@/features/program/application/actions/program.actions";
import { enqueueSnackbar } from "notistack";

export type ProgramEditableTableProps = {
  year: number;
  rows: program[];
  mutate: () => void | Promise<void>;
};

// Track label mapping
const trackLabels: Record<$Enums.ProgramTrack, string> = {
  SCIENCE_MATH: "วิทย์-คณิต",
  LANGUAGE_MATH: "ศิลป์-คำนวณ",
  LANGUAGE_ARTS: "ศิลป์-ภาษา",
  GENERAL: "ทั่วไป",
};

const columnsForYear = (_year: number): ColumnDef<program>[] => [
  { key: "ProgramID", label: "ID", editable: false, width: 80 },
  {
    key: "ProgramCode",
    label: "รหัสหลักสูตร",
    editable: true,
    required: true,
    type: "text",
    width: 140,
  },
  {
    key: "ProgramName",
    label: "ชื่อหลักสูตร",
    editable: true,
    required: true,
    type: "text",
    width: 260,
  },
  {
    key: "Track",
    label: "แผนการเรียน",
    editable: true,
    required: true,
    type: "select",
    options: [
      { value: "SCIENCE_MATH", label: trackLabels.SCIENCE_MATH },
      { value: "LANGUAGE_MATH", label: trackLabels.LANGUAGE_MATH },
      { value: "LANGUAGE_ARTS", label: trackLabels.LANGUAGE_ARTS },
      { value: "GENERAL", label: trackLabels.GENERAL },
    ],
    width: 160,
    render: (value: $Enums.ProgramTrack) => trackLabels[value] || value,
  },
  {
    key: "MinTotalCredits",
    label: "หน่วยกิตขั้นต่ำ",
    editable: true,
    type: "number",
    width: 140,
  },
  {
    key: "IsActive",
    label: "สถานะ",
    editable: true,
    type: "select",
    options: [
      { value: "true", label: "เปิดใช้งาน" },
      { value: "false", label: "ปิดใช้งาน" },
    ],
    width: 120,
    render: (value: boolean) => (value ? "เปิดใช้งาน" : "ปิดใช้งาน"),
  },
];

const validateProgram: (year: number) => ValidationFn<program> =
  (year: number) => (_id, data, all) => {
    // Basic required
    if (!data.ProgramCode || String(data.ProgramCode).trim() === "") {
      return "รหัสหลักสูตรห้ามว่าง";
    }
    if (!data.ProgramName || String(data.ProgramName).trim() === "") {
      return "ชื่อหลักสูตรห้ามว่าง";
    }
    // ProgramCode format (M1-M6 for Thai years ม.1-ม.6)
    if (!/^[A-Z_]+-M[1-6]-\d{4}$/.test(String(data.ProgramCode))) {
      return "รหัสต้องมีรูปแบบ GENERAL-M1-2567, SCI_MATH-M4-2567 เป็นต้น";
    }
    // Unique ProgramCode among rows (client-side)
    const dup = all.find(
      (r) =>
        r.ProgramCode === data.ProgramCode && r.ProgramID !== data.ProgramID,
    );
    if (dup) {
      return "รหัสหลักสูตรซ้ำในรายการ";
    }
    // Note: multiple programs per track/year now allowed (soft check removed)
    return null;
  };

// Empty row for creation
const emptyProgram = (year: number): Partial<program> => ({
  ProgramCode: `GENERAL-M${year}-2567`,
  ProgramName: "",
  Year: year,
  Track: "GENERAL" as unknown as $Enums.ProgramTrack,
  MinTotalCredits: 0,
  IsActive: true,
});

export default function ProgramEditableTable({
  year,
  rows,
  mutate,
}: ProgramEditableTableProps) {
  const columns = columnsForYear(year);
  const validate = validateProgram(year);

  const onCreate = async (row: Partial<program>) => {
    enqueueSnackbar("กำลังเพิ่มหลักสูตร", { variant: "info", persist: true });
    try {
      const res = await createProgramAction({
        ProgramCode: String(row.ProgramCode),
        ProgramName: String(row.ProgramName),
        Year: year,
        Track: row.Track ?? "GENERAL",
        MinTotalCredits: Number(row.MinTotalCredits ?? 0),
        IsActive: String(row.IsActive) === "true" || row.IsActive === true,
      });
      enqueueSnackbar("เพิ่มหลักสูตรสำเร็จ", { variant: "success" });
      return { success: true as const, data: res.data };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "เพิ่มหลักสูตรไม่สำเร็จ";
      enqueueSnackbar(message, { variant: "error" });
      return { success: false as const, error: message };
    } finally {
      enqueueSnackbar("", { variant: "default" });
    }
  };

  const onUpdate = async (rows: Partial<program>[]) => {
    enqueueSnackbar("กำลังบันทึกการแก้ไข", { variant: "info", persist: true });
    try {
      for (const r of rows) {
        if (r.ProgramID == null) continue;
        await updateProgramAction({
          ProgramID: Number(r.ProgramID),
          ProgramCode: r.ProgramCode ?? undefined,
          ProgramName: r.ProgramName ?? "",
          Track: r.Track,
          MinTotalCredits: r.MinTotalCredits,
          IsActive:
            typeof r.IsActive === "string" ? r.IsActive === "true" : r.IsActive,
        });
      }
      enqueueSnackbar("บันทึกสำเร็จ", { variant: "success" });
      await mutate();
      return { success: true as const };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "บันทึกไม่สำเร็จ";
      enqueueSnackbar(message, { variant: "error" });
      return { success: false as const, error: message };
    }
  };

  const onDelete = async (ids: (string | number)[]) => {
    enqueueSnackbar("กำลังลบหลักสูตร", { variant: "info", persist: true });
    try {
      for (const id of ids) {
        await deleteProgramAction({ ProgramID: Number(id) });
      }
      enqueueSnackbar("ลบสำเร็จ", { variant: "success" });
      await mutate();
      return { success: true as const };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ลบไม่สำเร็จ";
      enqueueSnackbar(message, { variant: "error" });
      return { success: false as const, error: message };
    }
  };

  return (
    <EditableTable<program>
      title={`หลักสูตร ม.${year}`}
      columns={columns}
      data={rows}
      idField="ProgramID"
      searchFields={["ProgramCode", "ProgramName"]}
      searchPlaceholder="ค้นหาโดยรหัส/ชื่อหลักสูตร"
      validate={validate}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onMutate={mutate}
      emptyRowFactory={() => emptyProgram(year)}
      rowsPerPageOptions={[5, 10, 25, 50]}
      defaultRowsPerPage={10}
    />
  );
}
