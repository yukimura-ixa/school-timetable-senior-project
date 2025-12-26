"use client";

/**
 * SubjectDataGrid - Subject management with MUI X DataGrid
 *
 * Features:
 * - Inline row editing (`editMode="row"`)
 * - MOE-compliant validation (LearningArea/ActivityType rules)
 * - Built-in search, sorting, pagination
 * - Row selection for bulk delete
 *
 * @see https://mui.com/x/react-data-grid/editing/
 */

import React, { useState, useCallback } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRowModel,
  GridRowSelectionModel,
  GridActionsCellItem,
  GridRowModes,
  GridRowModesModel,
  GridEventListener,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { Box, Button, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { enqueueSnackbar } from "notistack";
import type { subject, $Enums } from "@/prisma/generated/client";
import {
  updateSubjectsAction,
  deleteSubjectsAction,
} from "@/features/subject/application/actions/subject.actions";
import { useConfirmDialog } from "@/components/dialogs";
import { AddSubjectDialog } from "./AddSubjectDialog";

// ==================== Types ====================

interface SubjectDataGridProps {
  initialData: subject[];
  onMutate: () => void | Promise<void>;
}

// ==================== Constants ====================

const CREDIT_OPTIONS = [
  { value: "CREDIT_05", label: "0.5" },
  { value: "CREDIT_10", label: "1.0" },
  { value: "CREDIT_15", label: "1.5" },
  { value: "CREDIT_20", label: "2.0" },
];

const CATEGORY_OPTIONS = [
  { value: "CORE", label: "รายวิชาพื้นฐาน" },
  { value: "ADDITIONAL", label: "รายวิชาเพิ่มเติม" },
  { value: "ACTIVITY", label: "กิจกรรมพัฒนาผู้เรียน" },
];

const LEARNING_AREA_OPTIONS = [
  { value: "", label: "-" },
  { value: "THAI", label: "ภาษาไทย" },
  { value: "MATHEMATICS", label: "คณิตศาสตร์" },
  { value: "SCIENCE", label: "วิทยาศาสตร์และเทคโนโลยี" },
  { value: "SOCIAL", label: "สังคมศึกษาฯ" },
  { value: "HEALTH_PE", label: "สุขศึกษาและพลศึกษา" },
  { value: "ARTS", label: "ศิลปะ" },
  { value: "CAREER", label: "การงานอาชีพ" },
  { value: "FOREIGN_LANGUAGE", label: "ภาษาต่างประเทศ" },
];

const ACTIVITY_TYPE_OPTIONS = [
  { value: "", label: "-" },
  { value: "CLUB", label: "ชุมนุม" },
  { value: "SCOUT", label: "ลูกเสือ/เนตรนารี" },
  { value: "GUIDANCE", label: "แนะแนว" },
  { value: "SOCIAL_SERVICE", label: "กิจกรรมเพื่อสังคม" },
];

// ==================== Component ====================

export function SubjectDataGrid({
  initialData,
  onMutate,
}: SubjectDataGridProps) {
  const [rows, setRows] = useState<subject[]>(initialData);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set<GridRowId>(),
    });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { confirm, dialog } = useConfirmDialog();

  // Sync with initialData changes
  React.useEffect(() => {
    setRows(initialData);
  }, [initialData]);

  // ==================== Event Handlers ====================

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = useCallback((id: GridRowId) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit },
    }));
  }, []);

  const handleSaveClick = useCallback((id: GridRowId) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View },
    }));
  }, []);

  const handleCancelClick = useCallback((id: GridRowId) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
  }, []);

  const handleDeleteClick = useCallback(
    async (id: GridRowId) => {
      const confirmed = await confirm({
        title: "ลบวิชา",
        message: "คุณแน่ใจหรือไม่ว่าต้องการลบวิชานี้?",
        variant: "danger",
        confirmText: "ลบ",
        cancelText: "ยกเลิก",
      });

      if (confirmed) {
        const result = await deleteSubjectsAction({
          subjectCodes: [id as string],
        });
        if (result.success) {
          enqueueSnackbar("ลบวิชาสำเร็จ", { variant: "success" });
          setRows((prev) => prev.filter((row) => row.SubjectCode !== id));
          await onMutate();
        } else {
          enqueueSnackbar("ลบวิชาไม่สำเร็จ", { variant: "error" });
        }
      }
    },
    [confirm, onMutate],
  );

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Array.from(rowSelectionModel.ids) as string[];
    if (selectedIds.length === 0) return;

    const confirmed = await confirm({
      title: "ลบวิชา",
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบ ${selectedIds.length} วิชา?`,
      variant: "danger",
      confirmText: "ลบทั้งหมด",
      cancelText: "ยกเลิก",
    });

    if (confirmed) {
      const result = await deleteSubjectsAction({ subjectCodes: selectedIds });
      if (result.success) {
        enqueueSnackbar(`ลบ ${selectedIds.length} วิชาสำเร็จ`, {
          variant: "success",
        });
        setRows((prev) =>
          prev.filter((row) => !selectedIds.includes(row.SubjectCode)),
        );
        setRowSelectionModel({ type: "include", ids: new Set<GridRowId>() });
        await onMutate();
      } else {
        enqueueSnackbar("ลบวิชาไม่สำเร็จ", { variant: "error" });
      }
    }
  }, [rowSelectionModel, confirm, onMutate]);

  // ==================== Update Handler with MOE Validation ====================

  const processRowUpdate = useCallback(
    async (newRow: GridRowModel, _oldRow: GridRowModel): Promise<subject> => {
      const updated = newRow as subject;

      // Validate required fields
      if (!updated.SubjectName?.trim()) {
        throw new Error("ชื่อวิชาต้องไม่เป็นค่าว่าง");
      }
      if (!updated.Credit) {
        throw new Error("กรุณาเลือกหน่วยกิต");
      }
      if (!updated.Category) {
        throw new Error("กรุณาเลือกประเภทวิชา");
      }

      // MOE Compliance validation
      if (updated.Category !== "ACTIVITY" && !updated.LearningArea) {
        throw new Error(
          "กรุณาเลือกสาระการเรียนรู้สำหรับรายวิชาพื้นฐานและเพิ่มเติม",
        );
      }
      if (updated.Category === "ACTIVITY" && !updated.ActivityType) {
        throw new Error("กรุณาเลือกประเภทกิจกรรมสำหรับกิจกรรมพัฒนาผู้เรียน");
      }

      // Call server action
      const result = await updateSubjectsAction([
        {
          SubjectCode: updated.SubjectCode,
          SubjectName: updated.SubjectName.trim(),
          Credit: updated.Credit,
          Category: updated.Category,
          LearningArea: updated.LearningArea || null,
          ActivityType: updated.ActivityType || null,
          IsGraded: updated.IsGraded ?? true,
          Description: updated.Description?.trim() || null,
        },
      ]);

      if (!result.success) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Update failed",
        );
      }

      enqueueSnackbar("บันทึกวิชาสำเร็จ", { variant: "success" });
      await onMutate();
      return updated;
    },
    [onMutate],
  );

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    enqueueSnackbar(`บันทึกไม่สำเร็จ: ${error.message}`, { variant: "error" });
  }, []);

  // ==================== Columns ====================

  const columns: GridColDef<subject>[] = [
    {
      field: "SubjectCode",
      headerName: "รหัสวิชา",
      width: 100,
      editable: false, // Primary key - not editable
    },
    {
      field: "SubjectName",
      headerName: "ชื่อวิชา",
      flex: 1.5,
      minWidth: 150,
      editable: true,
    },
    {
      field: "Credit",
      headerName: "หน่วยกิต",
      width: 90,
      editable: true,
      type: "singleSelect",
      valueOptions: CREDIT_OPTIONS.map((o) => o.value),
      valueFormatter: (value: string) => {
        const opt = CREDIT_OPTIONS.find((o) => o.value === value);
        return opt?.label || value;
      },
    },
    {
      field: "Category",
      headerName: "ประเภทวิชา",
      width: 130,
      editable: true,
      type: "singleSelect",
      valueOptions: CATEGORY_OPTIONS.map((o) => o.value),
      valueFormatter: (value: string) => {
        const opt = CATEGORY_OPTIONS.find((o) => o.value === value);
        return opt?.label || value;
      },
    },
    {
      field: "LearningArea",
      headerName: "สาระการเรียนรู้",
      flex: 1,
      minWidth: 120,
      editable: true,
      type: "singleSelect",
      valueOptions: LEARNING_AREA_OPTIONS.map((o) => o.value),
      valueFormatter: (value: $Enums.LearningArea | null) => {
        if (!value) return "-";
        const opt = LEARNING_AREA_OPTIONS.find((o) => o.value === value);
        return opt?.label || value;
      },
    },
    {
      field: "ActivityType",
      headerName: "ประเภทกิจกรรม",
      width: 120,
      editable: true,
      type: "singleSelect",
      valueOptions: ACTIVITY_TYPE_OPTIONS.map((o) => o.value),
      valueFormatter: (value: $Enums.ActivityType | null) => {
        if (!value) return "-";
        const opt = ACTIVITY_TYPE_OPTIONS.find((o) => o.value === value);
        return opt?.label || value;
      },
    },
    {
      field: "IsGraded",
      headerName: "ให้คะแนน",
      width: 80,
      editable: true,
      type: "boolean",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "จัดการ",
      width: 80,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon color="primary" />}
              label="บันทึก"
              onClick={() => handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="ยกเลิก"
              onClick={() => handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="แก้ไข"
            onClick={() => handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="ลบ"
            onClick={() => void handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  // ==================== Render ====================

  const selectedCount = rowSelectionModel.ids.size;

  return (
    <Box sx={{ width: "100%", height: 600 }}>
      {/* Toolbar */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Box>
          {selectedCount > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => void handleBulkDelete()}
            >
              ลบที่เลือก ({selectedCount})
            </Button>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
          data-testid="add-subject-button"
        >
          เพิ่มวิชา
        </Button>
      </Stack>

      {/* DataGrid */}
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.SubjectCode}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={setRowModesModel}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        checkboxSelection
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={setRowSelectionModel}
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        sx={{
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
        }}
        localeText={{
          noRowsLabel: "ไม่พบข้อมูลวิชา",
          footerRowSelected: (count) => `เลือก ${count} รายการ`,
        }}
      />

      {/* Add Dialog */}
      <AddSubjectDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={onMutate}
      />

      {/* Confirm Dialog */}
      {dialog}
    </Box>
  );
}

export default SubjectDataGrid;
