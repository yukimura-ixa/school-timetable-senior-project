"use client";

/**
 * TeacherDataGrid - Teacher management with MUI X DataGrid
 *
 * Features:
 * - Inline row editing (`editMode="row"`)
 * - Built-in search, sorting, pagination
 * - Row selection for bulk delete
 * - Proper accessibility
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
import { Box, Button, Stack, alpha } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { enqueueSnackbar } from "notistack";
import type { teacher } from "@/prisma/generated/client";
import {
  updateTeachersAction,
  deleteTeachersAction,
} from "@/features/teacher/application/actions/teacher.actions";
import { useConfirmDialog } from "@/components/dialogs";
import { AddTeacherDialog } from "./AddTeacherDialog";
import { colors } from "@/shared/design-system";

// ==================== Types ====================

interface TeacherDataGridProps {
  initialData: teacher[];
  onMutate: () => void | Promise<void>;
}

// ==================== Constants ====================

const PREFIX_OPTIONS = ["นาย", "นาง", "นางสาว", "ผศ.", "อ."];
const ROLE_OPTIONS = [
  { value: "teacher", label: "ครู" },
  { value: "admin", label: "ผู้ดูแลระบบ" },
];

// ==================== Component ====================

export function TeacherDataGrid({
  initialData,
  onMutate,
}: TeacherDataGridProps) {
  const [rows, setRows] = useState<teacher[]>(initialData);
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
        title: "ลบข้อมูลครู",
        message: "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลครูนี้?",
        variant: "danger",
        confirmText: "ลบ",
        cancelText: "ยกเลิก",
      });

      if (confirmed) {
        const result = await deleteTeachersAction([id as number]);
        if (result.success) {
          enqueueSnackbar("ลบข้อมูลครูสำเร็จ", { variant: "success" });
          setRows((prev) => prev.filter((row) => row.TeacherID !== id));
          onMutate();
        } else {
          enqueueSnackbar("ลบข้อมูลครูไม่สำเร็จ", { variant: "error" });
        }
      }
    },
    [confirm, onMutate],
  );

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Array.from(rowSelectionModel.ids) as number[];
    if (selectedIds.length === 0) return;

    const confirmed = await confirm({
      title: "ลบข้อมูลครู",
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลครู ${selectedIds.length} คน?`,
      variant: "danger",
      confirmText: "ลบทั้งหมด",
      cancelText: "ยกเลิก",
    });

    if (confirmed) {
      const result = await deleteTeachersAction(selectedIds);
      if (result.success) {
        enqueueSnackbar(`ลบข้อมูลครู ${selectedIds.length} คนสำเร็จ`, {
          variant: "success",
        });
        setRows((prev) =>
          prev.filter((row) => !selectedIds.includes(row.TeacherID)),
        );
        setRowSelectionModel({ type: "include", ids: new Set<GridRowId>() });
        onMutate();
      } else {
        enqueueSnackbar("ลบข้อมูลครูไม่สำเร็จ", { variant: "error" });
      }
    }
  }, [rowSelectionModel, confirm, onMutate]);

  // ==================== Update Handler ====================

  const processRowUpdate = useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel): Promise<teacher> => {
      const updatedTeacher = newRow as teacher;

      // Validate
      if (!updatedTeacher.Firstname?.trim()) {
        throw new Error("ชื่อต้องไม่เป็นค่าว่าง");
      }
      if (!updatedTeacher.Lastname?.trim()) {
        throw new Error("นามสกุลต้องไม่เป็นค่าว่าง");
      }

      // Call server action
      const result = await updateTeachersAction([
        {
          TeacherID: updatedTeacher.TeacherID,
          Prefix: updatedTeacher.Prefix?.trim() || "นาย",
          Firstname: updatedTeacher.Firstname.trim(),
          Lastname: updatedTeacher.Lastname.trim(),
          Department: updatedTeacher.Department?.trim() || "-",
          Email: updatedTeacher.Email?.trim() || "",
          Role: updatedTeacher.Role || "teacher",
        },
      ]);

      if (!result.success) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "บันทึกไม่สำเร็จ",
        );
      }

      enqueueSnackbar("บันทึกข้อมูลสำเร็จ", { variant: "success" });
      onMutate();
      return updatedTeacher;
    },
    [onMutate],
  );

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    enqueueSnackbar(`บันทึกไม่สำเร็จ: ${error.message}`, { variant: "error" });
  }, []);

  // ==================== Columns ====================

  const columns: GridColDef<teacher>[] = [
    {
      field: "TeacherID",
      headerName: "ID",
      width: 60,
      editable: false,
    },
    {
      field: "Prefix",
      headerName: "คำนำหน้า",
      width: 90,
      editable: true,
      type: "singleSelect",
      valueOptions: PREFIX_OPTIONS,
    },
    {
      field: "Firstname",
      headerName: "ชื่อ",
      flex: 1,
      minWidth: 100,
      editable: true,
    },
    {
      field: "Lastname",
      headerName: "นามสกุล",
      flex: 1,
      minWidth: 100,
      editable: true,
    },
    {
      field: "Department",
      headerName: "กลุ่มสาระ",
      flex: 1,
      minWidth: 120,
      editable: true,
    },
    {
      field: "Email",
      headerName: "อีเมล",
      flex: 1.5,
      minWidth: 150,
      editable: false, // Email is protected
    },
    {
      field: "Role",
      headerName: "บทบาท",
      width: 100,
      editable: true,
      type: "singleSelect",
      valueOptions: ROLE_OPTIONS.map((r) => r.value),
      valueFormatter: (value: string) => {
        const option = ROLE_OPTIONS.find((r) => r.value === value);
        return option?.label || value;
      },
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
          data-testid="add-teacher-button"
          sx={{
            bgcolor: colors.emerald.main,
            "&:hover": { bgcolor: colors.emerald.dark },
          }}
        >
          เพิ่มข้อมูลครู
        </Button>
      </Stack>

      {/* DataGrid */}
      <DataGrid<teacher>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.TeacherID}
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
          "& .MuiDataGrid-columnHeader:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: alpha(colors.emerald.main, 0.04),
          },
          "& .MuiDataGrid-row.Mui-selected": {
            bgcolor: alpha(colors.emerald.main, 0.08),
            "&:hover": {
              bgcolor: alpha(colors.emerald.main, 0.12),
            },
          },
          "& .MuiCheckbox-root.Mui-checked": {
            color: colors.emerald.main,
          },
        }}
        localeText={{
          noRowsLabel: "ไม่พบข้อมูลครู",
          footerRowSelected: (count) => `เลือก ${count} รายการ`,
        }}
      />

      {/* Add Dialog */}
      <AddTeacherDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={onMutate}
      />

      {/* Confirm Dialog */}
      {dialog}
    </Box>
  );
}

export default TeacherDataGrid;
