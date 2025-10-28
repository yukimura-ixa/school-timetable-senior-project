"use client";
import type { teacher } from "@/prisma/generated";
import { EditableTable, type ColumnDef, type ValidationFn } from "@/components/tables";
import { deleteTeachersAction, updateTeachersAction } from "@/features/teacher/application/actions/teacher.actions";

type TeacherTableProps = {
  tableData: teacher[];
  mutate: () => void | Promise<void>;
};

// Column definitions for teachers table
const teacherColumns: ColumnDef<teacher>[] = [
  {
    key: "TeacherID",
    label: "ID",
    editable: false, // Protected - primary key
    width: 80,
  },
  {
    key: "Prefix",
    label: "คำนำหน้าชื่อ",
    editable: true,
    required: true,
    type: "select",
    options: [
      { value: "นาย", label: "นาย" },
      { value: "นาง", label: "นาง" },
      { value: "นางสาว", label: "นางสาว" },
      { value: "ผศ.", label: "ผศ." },
      { value: "อ.", label: "อ." },
    ],
    width: 120,
  },
  {
    key: "Firstname",
    label: "ชื่อ",
    editable: true,
    required: true,
    type: "text",
  },
  {
    key: "Lastname",
    label: "นามสกุล",
    editable: true,
    required: true,
    type: "text",
  },
  {
    key: "Department",
    label: "กลุ่มสาระ",
    editable: true,
    type: "text",
  },
  {
    key: "Email",
    label: "อีเมล",
    editable: false, // Protected - used in auth, must be unique
    type: "text",
  },
  {
    key: "Role",
    label: "บทบาท",
    editable: true,
    type: "select",
    options: [
      { value: "teacher", label: "ครู" },
      { value: "admin", label: "ผู้ดูแลระบบ" },
    ],
    width: 150,
  },
];

// Validation function for teachers
const validateTeacher: ValidationFn<teacher> = (id, data, allData) => {
  // Check required fields
  if (!data.Prefix || data.Prefix.trim() === "") {
    return "คำนำหน้าชื่อต้องไม่เป็นค่าว่าง";
  }

  if (!data.Firstname || data.Firstname.trim() === "") {
    return "ชื่อต้องไม่เป็นค่าว่าง";
  }

  if (data.Firstname.length > 100) {
    return "ชื่อต้องไม่เกิน 100 ตัวอักษร";
  }

  if (!data.Lastname || data.Lastname.trim() === "") {
    return "นามสกุลต้องไม่เป็นค่าว่าง";
  }

  if (data.Lastname.length > 100) {
    return "นามสกุลต้องไม่เกิน 100 ตัวอักษร";
  }

  // Email is protected in editing, but validate on create
  if (typeof id === "string" && data.Email) {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.Email)) {
      return "รูปแบบอีเมลไม่ถูกต้อง";
    }

    // Check for duplicate email
    const duplicate = allData.find((t) => t.Email === data.Email);
    if (duplicate) {
      return "อีเมลนี้ถูกใช้งานแล้ว";
    }
  }

  return null;
};

// Empty teacher factory for creating new rows
const createEmptyTeacher = (): Partial<teacher> => ({
  Prefix: "นาย",
  Firstname: "",
  Lastname: "",
  Department: "-",
  Email: "",
  Role: "teacher",
});

// Wrapper for create action
const handleCreate = async (newTeacher: Partial<teacher>) => {
  return await updateTeachersAction([
    {
      Prefix: newTeacher.Prefix?.trim() || "นาย",
      Firstname: newTeacher.Firstname?.trim() || "",
      Lastname: newTeacher.Lastname?.trim() || "",
      Department: newTeacher.Department?.trim() || "-",
      Email: newTeacher.Email?.trim() || "",
      Role: newTeacher.Role || "teacher",
    },
  ]);
};

// Wrapper for update action
const handleUpdate = async (teachers: Partial<teacher>[]) => {
  return await updateTeachersAction(
    teachers.map((t) => ({
      TeacherID: t.TeacherID as number,
      Prefix: t.Prefix?.trim() || "นาย",
      Firstname: t.Firstname?.trim() || "",
      Lastname: t.Lastname?.trim() || "",
      Department: t.Department?.trim() || "-",
      Email: t.Email?.trim() || "", // Email is protected but include in payload
      Role: t.Role || "teacher",
    }))
  );
};

// Wrapper for delete action
const handleDelete = async (ids: (string | number)[]) => {
  return await deleteTeachersAction({ teacherIds: ids as number[] });
};

export default function TeacherTable({ tableData, mutate }: TeacherTableProps) {
  return (
    <EditableTable<teacher>
      title="จัดการข้อมูลครู"
      columns={teacherColumns}
      data={tableData}
      idField="TeacherID"
      searchFields={["Firstname", "Lastname", "Department", "Email"]}
      searchPlaceholder="ค้นหาชื่อ นามสกุล กลุ่มสาระ หรืออีเมล"
      validate={validateTeacher}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onMutate={mutate}
      emptyRowFactory={createEmptyTeacher}
      rowsPerPageOptions={[5, 10, 25, 50]}
      defaultRowsPerPage={10}
    />
  );
}
