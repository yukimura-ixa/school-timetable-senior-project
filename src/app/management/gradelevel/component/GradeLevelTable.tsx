"use client";
import type { gradelevel } from "@/prisma/generated/client";
import {
  EditableTable,
  type ColumnDef,
  type ValidationFn,
} from "@/components/tables";
import {
  deleteGradeLevelsAction,
  updateGradeLevelsAction,
  createGradeLevelAction,
} from "@/features/gradelevel/application/actions/gradelevel.actions";
import { FormControl, MenuItem, Select } from "@mui/material";
import type { program } from "@/prisma/generated/client";

type GradeLevelTableProps = {
  tableData: gradelevel[];
  mutate: () => void | Promise<void>;
  programsByYear: Record<number, program[]>;
};

// Build column definitions for gradelevel table (row-aware Program selector)
const buildGradeLevelColumns = (
  programsByYear: Record<number, program[]>,
): ColumnDef<gradelevel>[] => [
  {
    key: "GradeID",
    label: "รหัส",
    editable: false, // Protected - primary key, used in FK relationships
    width: 120,
  },
  {
    key: "Year",
    label: "ชั้นปี (ม.)",
    editable: true,
    required: true,
    type: "number",
    width: 120,
    render: (value: number) => `ม.${value}`,
  },
  {
    key: "Number",
    label: "ห้อง",
    editable: true,
    required: true,
    type: "number",
    width: 100,
  },
  {
    key: "ProgramID",
    label: "หลักสูตร",
    editable: true,
    // View mode: show related program name if available
    render: (_value: number | null, row: gradelevel) => {
      const anyRow = row as unknown as {
        program?: program | null;
        ProgramID?: number | null;
      };
      if (anyRow?.program) {
        return `${anyRow.program.ProgramName}`;
      }
      if (anyRow?.ProgramID != null) return `#${anyRow.ProgramID}`;
      return "-";
    },
    // Edit mode: filter options by row.Year
    renderEdit: ({ value, row, onChange, hasError }) => {
      const year = row.Year;
      const options = programsByYear[year] ?? [];
      const selected = value == null ? "" : String(value);
      return (
        <FormControl fullWidth size="small" error={hasError}>
          <Select
            value={selected}
            displayEmpty
            onChange={(e) => {
              const v = (e.target as HTMLInputElement).value;
              onChange(v === "" ? null : Number(v));
            }}
          >
            <MenuItem value="">
              <em>ไม่ระบุ</em>
            </MenuItem>
            {options.map((p) => (
              <MenuItem key={p.ProgramID} value={String(p.ProgramID)}>
                {p.ProgramCode} — {p.ProgramName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    },
    width: 320,
  },
  {
    key: "StudentCount",
    label: "จำนวนนักเรียน",
    editable: true,
    type: "number",
    width: 150,
  },
];

// Create a validator that is aware of programs for Year-based validation
const createValidateGradeLevel =
  (programsByYear: Record<number, program[]>): ValidationFn<gradelevel> =>
  (id, data, allData) => {
    // Check required fields
    if (!data.Year || data.Year < 1 || data.Year > 6) {
      return "ชั้นปีต้องอยู่ระหว่าง 1-6 (ม.1 - ม.6)";
    }

    if (!data.Number || data.Number < 1) {
      return "ห้องต้องมากกว่า 0";
    }

    if (data.Number > 99) {
      return "ห้องต้องไม่เกิน 99";
    }

    if (data.StudentCount != null && data.StudentCount < 0) {
      return "จำนวนนักเรียนต้องไม่น้อยกว่า 0";
    }

    if (data.StudentCount != null && data.StudentCount > 100) {
      return "จำนวนนักเรียนต้องไม่เกิน 100 คน";
    }

    // If assigning a program, ensure it's valid for the selected Year
    if (data.ProgramID != null) {
      const list = programsByYear[data.Year] ?? [];
      const exists = list.some((p) => p.ProgramID === data.ProgramID);
      if (!exists) {
        return `หลักสูตรที่เลือกไม่ตรงกับชั้นปี ม.${data.Year}`;
      }
    }

    // Check for duplicate Year + Number combination (excluding current row)
    const duplicate = allData.find(
      (g) =>
        g.Year === data.Year &&
        g.Number === data.Number &&
        g.GradeID !== String(id),
    );

    if (duplicate) {
      return `ม.${data.Year}/${data.Number} มีอยู่ในระบบแล้ว`;
    }

    return null;
  };

// Empty gradelevel factory for creating new rows
const createEmptyGradeLevel = (): Partial<gradelevel> => ({
  GradeID: "", // Will be generated
  Year: 1,
  Number: 1,
  StudentCount: 0,
});

// Wrapper for create action
const handleCreate = async (newGrade: Partial<gradelevel>) => {
  return await createGradeLevelAction({
    Year: newGrade.Year || 1,
    Number: newGrade.Number || 1,
    StudentCount: newGrade.StudentCount ?? 0,
    ProgramID: newGrade.ProgramID ?? null,
  });
};

// Wrapper for update action
const handleUpdate = async (grades: Partial<gradelevel>[]) => {
  return await updateGradeLevelsAction(
    grades.map((g) => ({
      GradeID: String(g.GradeID),
      Year: g.Year || 1,
      Number: g.Number || 1,
      StudentCount: g.StudentCount ?? 0,
      ProgramID: g.ProgramID ?? null,
    })),
  );
};

// Wrapper for delete action
const handleDelete = async (ids: (string | number)[]) => {
  return await deleteGradeLevelsAction(ids as string[]);
};

export default function GradeLevelTable({
  tableData,
  mutate,
  programsByYear,
}: GradeLevelTableProps) {
  const gradeLevelColumns = buildGradeLevelColumns(programsByYear);
  const validateGradeLevel = createValidateGradeLevel(programsByYear);
  return (
    <EditableTable<gradelevel>
      title="จัดการระดับชั้น"
      columns={gradeLevelColumns}
      data={tableData}
      idField="GradeID"
      searchFields={["GradeID"]}
      searchPlaceholder="ค้นหารหัสระดับชั้น (เช่น M1-1)"
      validate={validateGradeLevel}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onMutate={mutate}
      emptyRowFactory={createEmptyGradeLevel}
      rowsPerPageOptions={[5, 10, 25, 50]}
      defaultRowsPerPage={10}
    />
  );
}
