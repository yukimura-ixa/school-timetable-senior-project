"use client";

/**
 * ProgramDataGrid - Program management with MUI X DataGrid
 *
 * Features:
 * - Inline row editing (`editMode="row"`)
 * - Track selector (วิทย์-คณิต, ศิลป์-คำนวณ, etc.)
 * - Built-in search, sorting, pagination
 * - Row selection for bulk delete
 *
 * @see https://mui.com/x/react-data-grid/editing/
 */

import React, { useState, useCallback, useMemo } from "react";
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
import { Box, Button, Stack, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { enqueueSnackbar } from "notistack";
import type { program, $Enums } from "@/prisma/generated/client";
import {
  updateProgramAction,
  deleteProgramAction,
} from "@/features/program/application/actions/program.actions";
import { useConfirmDialog } from "@/components/dialogs";
import { AddProgramDialog } from "./AddProgramDialog";

// ==================== Types ====================

interface ProgramDataGridProps {
  year: number;
  initialData: program[];
  onMutate: () => void | Promise<void>;
}

// ==================== Constants ====================

const TRACK_OPTIONS: {
  value: $Enums.ProgramTrack;
  label: string;
  color: string;
}[] = [
  { value: "SCIENCE_MATH", label: "วิทย์-คณิต", color: "#2196f3" },
  { value: "LANGUAGE_MATH", label: "ศิลป์-คำนวณ", color: "#4caf50" },
  { value: "LANGUAGE_ARTS", label: "ศิลป์-ภาษา", color: "#9c27b0" },
  { value: "GENERAL", label: "ทั่วไป", color: "#757575" },
];

// ==================== Component ====================

export function ProgramDataGrid({
  year,
  initialData,
  onMutate,
}: ProgramDataGridProps) {
  const [rows, setRows] = useState<program[]>(initialData);
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
        title: "ลบหลักสูตร",
        message: "คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตรนี้?",
        variant: "danger",
        confirmText: "ลบ",
        cancelText: "ยกเลิก",
      });

      if (confirmed) {
        const result = await deleteProgramAction({ ProgramID: Number(id) });
        if (result.success) {
          enqueueSnackbar("ลบหลักสูตรสำเร็จ", { variant: "success" });
          setRows((prev) => prev.filter((row) => row.ProgramID !== id));
          onMutate();
        } else {
          enqueueSnackbar("ลบหลักสูตรไม่สำเร็จ", { variant: "error" });
        }
      }
    },
    [confirm, onMutate],
  );

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Array.from(rowSelectionModel.ids).map(Number);
    if (selectedIds.length === 0) return;

    const confirmed = await confirm({
      title: "ลบหลักสูตร",
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบ ${selectedIds.length} หลักสูตร?`,
      variant: "danger",
      confirmText: "ลบทั้งหมด",
      cancelText: "ยกเลิก",
    });

    if (confirmed) {
      try {
        for (const id of selectedIds) {
          await deleteProgramAction({ ProgramID: id });
        }
        enqueueSnackbar(`ลบ ${selectedIds.length} หลักสูตรสำเร็จ`, {
          variant: "success",
        });
        setRows((prev) =>
          prev.filter((row) => !selectedIds.includes(row.ProgramID!)),
        );
        setRowSelectionModel({ type: "include", ids: new Set<GridRowId>() });
        onMutate();
      } catch {
        enqueueSnackbar("ลบหลักสูตรไม่สำเร็จ", { variant: "error" });
      }
    }
  }, [rowSelectionModel, confirm, onMutate]);

  // ==================== Update Handler ====================

  const processRowUpdate = useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel): Promise<program> => {
      const updated = newRow;

      // Validate
      if (!updated.ProgramCode?.trim()) {
        throw new Error("รหัสหลักสูตรห้ามว่าง");
      }
      if (!updated.ProgramName?.trim()) {
        throw new Error("ชื่อหลักสูตรห้ามว่าง");
      }

      // Call server action
      const result = await updateProgramAction({
        ProgramID: updated.ProgramID!,
        ProgramCode: updated.ProgramCode.trim(),
        ProgramName: updated.ProgramName.trim(),
        Track: updated.Track,
        MinTotalCredits: updated.MinTotalCredits ?? 0,
        IsActive: updated.IsActive ?? true,
      });

      if (!result.success) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Update failed",
        );
      }

      enqueueSnackbar("บันทึกหลักสูตรสำเร็จ", { variant: "success" });
      onMutate();
      return updated;
    },
    [onMutate],
  );

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    enqueueSnackbar(`บันทึกไม่สำเร็จ: ${error.message}`, { variant: "error" });
  }, []);

  // ==================== Columns ====================

  const columns: GridColDef<program>[] = useMemo(
    () => [
      {
        field: "ProgramID",
        headerName: "ID",
        width: 60,
        editable: false,
      },
      {
        field: "ProgramCode",
        headerName: "รหัสหลักสูตร",
        width: 150,
        editable: true,
      },
      {
        field: "ProgramName",
        headerName: "ชื่อหลักสูตร",
        flex: 1,
        minWidth: 200,
        editable: true,
      },
      {
        field: "Track",
        headerName: "แผนการเรียน",
        width: 130,
        editable: true,
        type: "singleSelect",
        valueOptions: TRACK_OPTIONS.map((t) => t.value),
        renderCell: (params) => {
          const track = TRACK_OPTIONS.find((t) => t.value === params.value);
          if (!track) return params.value;
          return (
            <Chip
              label={track.label}
              size="small"
              sx={{
                bgcolor: `${track.color}15`,
                color: track.color,
                fontWeight: 500,
              }}
            />
          );
        },
        valueFormatter: (value: $Enums.ProgramTrack) => {
          const track = TRACK_OPTIONS.find((t) => t.value === value);
          return track?.label || value;
        },
      },
      {
        field: "MinTotalCredits",
        headerName: "หน่วยกิตขั้นต่ำ",
        width: 120,
        editable: true,
        type: "number",
      },
      {
        field: "IsActive",
        headerName: "สถานะ",
        width: 100,
        editable: true,
        type: "boolean",
        renderCell: (params) => (
          <Chip
            label={params.value ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            color={params.value ? "success" : "default"}
            size="small"
            variant="outlined"
          />
        ),
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
    ],
    [
      rowModesModel,
      handleEditClick,
      handleSaveClick,
      handleCancelClick,
      handleDeleteClick,
    ],
  );

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
          data-testid="add-program-button"
        >
          เพิ่มหลักสูตร
        </Button>
      </Stack>

      {/* DataGrid */}
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.ProgramID!}
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
          noRowsLabel: "ไม่พบข้อมูลหลักสูตร",
          footerRowSelected: (count) => `เลือก ${count} รายการ`,
        }}
      />

      {/* Add Dialog */}
      <AddProgramDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={onMutate}
        year={year}
      />

      {/* Confirm Dialog */}
      {dialog}
    </Box>
  );
}

export default ProgramDataGrid;
