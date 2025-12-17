"use client";
import type {
  subject,
  subject_credit,
  $Enums,
} from "@/prisma/generated/client";
import {
  EditableTable,
  type ColumnDef,
  type ValidationFn,
} from "@/components/tables";
import {
  deleteSubjectsAction,
  createSubjectsAction,
  updateSubjectsAction,
} from "@/features/subject/application/actions/subject.actions";

type SubjectTableProps = {
  tableData: subject[];
  mutate: () => void | Promise<void>;
};

// Column definitions for subjects table
const subjectColumns: ColumnDef<subject>[] = [
  {
    key: "SubjectCode",
    label: "รหัสวิชา",
    editable: false, // Protected - primary key, used in FK relationships
    creatable: true,
    width: 120,
  },
  {
    key: "SubjectName",
    label: "ชื่อวิชา",
    editable: true,
    required: true,
    type: "text",
  },
  {
    key: "Credit",
    label: "หน่วยกิต",
    editable: true,
    required: true,
    type: "select",
    options: [
      { value: "CREDIT_05", label: "0.5" },
      { value: "CREDIT_10", label: "1.0" },
      { value: "CREDIT_15", label: "1.5" },
      { value: "CREDIT_20", label: "2.0" },
    ],
    width: 120,
    render: (value: subject_credit) => {
      const map: Record<subject_credit, string> = {
        CREDIT_05: "0.5",
        CREDIT_10: "1.0",
        CREDIT_15: "1.5",
        CREDIT_20: "2.0",
      };
      return map[value] || value;
    },
  },
  {
    key: "Category",
    label: "ประเภทวิชา",
    editable: true,
    required: true,
    type: "select",
    options: [
      { value: "CORE", label: "รายวิชาพื้นฐาน" },
      { value: "ADDITIONAL", label: "รายวิชาเพิ่มเติม" },
      { value: "ACTIVITY", label: "กิจกรรมพัฒนาผู้เรียน" },
    ],
    width: 150,
    render: (value: $Enums.SubjectCategory) => {
      const map: Record<$Enums.SubjectCategory, string> = {
        CORE: "รายวิชาพื้นฐาน",
        ADDITIONAL: "รายวิชาเพิ่มเติม",
        ACTIVITY: "กิจกรรมพัฒนาผู้เรียน",
      };
      return map[value] || value;
    },
  },
  {
    key: "LearningArea",
    label: "สาระการเรียนรู้",
    editable: true,
    type: "select",
    options: [
      { value: "", label: "-" },
      { value: "THAI", label: "ภาษาไทย" },
      { value: "MATHEMATICS", label: "คณิตศาสตร์" },
      { value: "SCIENCE", label: "วิทยาศาสตร์และเทคโนโลยี" },
      { value: "SOCIAL", label: "สังคมศึกษา ศาสนา และวัฒนธรรม" },
      { value: "HEALTH_PE", label: "สุขศึกษาและพลศึกษา" },
      { value: "ARTS", label: "ศิลปะ" },
      { value: "CAREER", label: "การงานอาชีพ" },
      { value: "FOREIGN_LANGUAGE", label: "ภาษาต่างประเทศ" },
    ],
    width: 180,
    render: (value: $Enums.LearningArea | null) => {
      if (!value) return "-";
      const map: Record<$Enums.LearningArea, string> = {
        THAI: "ภาษาไทย",
        MATHEMATICS: "คณิตศาสตร์",
        SCIENCE: "วิทยาศาสตร์และเทคโนโลยี",
        SOCIAL: "สังคมศึกษา ศาสนา และวัฒนธรรม",
        HEALTH_PE: "สุขศึกษาและพลศึกษา",
        ARTS: "ศิลปะ",
        CAREER: "การงานอาชีพ",
        FOREIGN_LANGUAGE: "ภาษาต่างประเทศ",
      };
      return map[value] || value;
    },
  },
  {
    key: "ActivityType",
    label: "ประเภทกิจกรรม",
    editable: true,
    type: "select",
    options: [
      { value: "", label: "-" },
      { value: "CLUB", label: "ชุมนุม" },
      { value: "SCOUT", label: "ลูกเสือ/เนตรนารี" },
      { value: "GUIDANCE", label: "แนะแนว" },
      { value: "SOCIAL_SERVICE", label: "กิจกรรมเพื่อสังคม" },
    ],
    width: 150,
    render: (value: $Enums.ActivityType | null) => {
      if (!value) return "-";
      const map: Record<$Enums.ActivityType, string> = {
        CLUB: "ชุมนุม",
        SCOUT: "ลูกเสือ/เนตรนารี",
        GUIDANCE: "แนะแนว",
        SOCIAL_SERVICE: "กิจกรรมเพื่อสังคม",
      };
      return map[value] || value;
    },
  },
  {
    key: "IsGraded",
    label: "ให้คะแนน",
    editable: true,
    type: "select",
    options: [
      { value: "true", label: "ใช่" },
      { value: "false", label: "ไม่" },
    ],
    width: 100,
    render: (value: boolean) => (value ? "ใช่" : "ไม่"),
  },
];

// Validation function for subjects
const validateSubject: ValidationFn<subject> = (id, data) => {
  // Check required fields
  if (typeof id === "string") {
    // Creating new subject
    if (!data.SubjectCode || data.SubjectCode.trim() === "") {
      return "รหัสวิชาต้องไม่เป็นค่าว่าง";
    }

    // Subject code format validation (alphanumeric, no spaces)
    const codeRegex = /^[A-Z0-9]+$/;
    if (!codeRegex.test(data.SubjectCode)) {
      return "รหัสวิชาต้องเป็นตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น";
    }

    if (data.SubjectCode.length > 20) {
      return "รหัสวิชาต้องไม่เกิน 20 ตัวอักษร";
    }
  }

  if (!data.SubjectName || data.SubjectName.trim() === "") {
    return "ชื่อวิชาต้องไม่เป็นค่าว่าง";
  }

  if (data.SubjectName.length > 200) {
    return "ชื่อวิชาต้องไม่เกิน 200 ตัวอักษร";
  }

  if (!data.Credit) {
    return "กรุณาเลือกหน่วยกิต";
  }

  if (!data.Category) {
    return "กรุณาเลือกประเภทวิชา";
  }

  // MOE Compliance: LearningArea required if NOT activity
  if (data.Category !== "ACTIVITY" && !data.LearningArea) {
    return "กรุณาเลือกสาระการเรียนรู้สำหรับรายวิชาพื้นฐานและเพิ่มเติม";
  }

  // MOE Compliance: ActivityType required if activity
  if (data.Category === "ACTIVITY" && !data.ActivityType) {
    return "กรุณาเลือกประเภทกิจกรรมสำหรับกิจกรรมพัฒนาผู้เรียน";
  }

  // MOE Compliance: Activity subjects should not have LearningArea
  if (data.Category === "ACTIVITY" && data.LearningArea) {
    return "กิจกรรมพัฒนาผู้เรียนไม่ควรมีสาระการเรียนรู้";
  }

  // MOE Compliance: Non-activity subjects should not have ActivityType
  if (data.Category !== "ACTIVITY" && data.ActivityType) {
    return "รายวิชาพื้นฐานและเพิ่มเติมไม่ควรมีประเภทกิจกรรม";
  }

  return null;
};

// Empty subject factory for creating new rows
const createEmptySubject = (): Partial<subject> => ({
  SubjectCode: "",
  SubjectName: "",
  Credit: "CREDIT_10",
  Category: "CORE",
  LearningArea: null,
  ActivityType: null,
  IsGraded: true,
  Description: null,
});

// Wrapper for create action
const handleCreate = async (newSubject: Partial<subject>) => {
  return await createSubjectsAction([
    {
      SubjectCode: newSubject.SubjectCode?.trim().toUpperCase() || "",
      SubjectName: newSubject.SubjectName?.trim() || "",
      Credit: newSubject.Credit || "CREDIT_10",
      Category: newSubject.Category || "CORE",
      LearningArea: newSubject.LearningArea || null,
      ActivityType: newSubject.ActivityType || null,
      IsGraded: newSubject.IsGraded ?? true,
      Description: newSubject.Description?.trim() || null,
    },
  ]);
};

// Wrapper for update action
const handleUpdate = async (subjects: Partial<subject>[]) => {
  return await updateSubjectsAction(
    subjects.map((s) => ({
      SubjectCode: s.SubjectCode!,
      SubjectName: s.SubjectName?.trim() || "",
      Credit: s.Credit || "CREDIT_10",
      Category: s.Category || "CORE",
      LearningArea: s.LearningArea || null,
      ActivityType: s.ActivityType || null,
      IsGraded: s.IsGraded ?? true,
      Description: s.Description?.trim() || null,
    })),
  );
};

// Wrapper for delete action
const handleDelete = async (ids: (string | number)[]) => {
  return await deleteSubjectsAction({ subjectCodes: ids as string[] });
};

export default function SubjectTable({ tableData, mutate }: SubjectTableProps) {
  return (
    <EditableTable<subject>
      title="จัดการวิชา"
      columns={subjectColumns}
      data={tableData}
      idField="SubjectCode"
      searchFields={["SubjectCode", "SubjectName"]}
      searchPlaceholder="ค้นหารหัสวิชา หรือชื่อวิชา"
      validate={validateSubject}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onMutate={mutate}
      emptyRowFactory={createEmptySubject}
      rowsPerPageOptions={[5, 10, 25, 50]}
      defaultRowsPerPage={10}
    />
  );
}
