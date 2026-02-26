"use client";

/**
 * GradeLevelDataGrid - GradeLevel management with MUI X DataGrid
 *
 * Features:
 * - Inline row editing (`editMode="row"`)
 * - Program selection filtered by Year
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
  GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { enqueueSnackbar } from "notistack";
import type { gradelevel, program } from "@/prisma/generated/client";
import {
  updateGradeLevelsAction,
  deleteGradeLevelsAction,
} from "@/features/gradelevel/application/actions/gradelevel.actions";
import { useConfirmDialog } from "@/components/dialogs";
import { AddGradeLevelDialog } from "./AddGradeLevelDialog";

// ==================== Types ====================

interface GradeLevelDataGridProps {
  initialData: gradelevel[];
  onMutate: () => void | Promise<void>;
  programsByYear: Record<number, program[]>;
}

// ==================== Custom Edit Component for Program ====================

interface ProgramEditProps extends GridRenderEditCellParams<gradelevel> {
  programsByYear: Record<number, program[]>;
}

function ProgramEditComponent(props: ProgramEditProps) {
  const { id, value, row, programsByYear } = props;
  const apiRef = useGridApiContext();

  const year = row.Year;
  const options = programsByYear[year] ?? [];
  const selected = value == null ? "" : String(value);

  const handleChange = (event: { target: { value: unknown } }) => {
    const newValue =
      event.target.value === "" ? null : Number(event.target.value);
    void apiRef.current.setEditCellValue({
      id,
      field: "ProgramID",
      value: newValue,
    });
  };

  return (
    <FormControl fullWidth size="small">
      <Select
        value={selected}
        displayEmpty
        onChange={handleChange}
        sx={{ height: "100%" }}
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
}

// ==================== Component ====================

export function GradeLevelDataGrid({
  initialData,
  onMutate,
  programsByYear,
}: GradeLevelDataGridProps) {
  const [rows, setRows] = useState<gradelevel[]>(initialData);
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
        title: "ลบระดับชั้น",
        message: "คุณแน่ใจหรือไม่ว่าต้องการลบระดับชั้นนี้?",
        variant: "danger",
        confirmText: "ลบ",
        cancelText: "ยกเลิก",
      });

      if (confirmed) {
        const result = await deleteGradeLevelsAction([id as string]);
        if (result.success) {
          enqueueSnackbar("ลบระดับชั้นสำเร็จ", { variant: "success" });
          setRows((prev) => prev.filter((row) => row.GradeID !== id));
          await onMutate();
        } else {
          enqueueSnackbar("ลบระดับชั้นไม่สำเร็จ", { variant: "error" });
        }
      }
    },
    [confirm, onMutate],
  );

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Array.from(rowSelectionModel.ids) as string[];
    if (selectedIds.length === 0) return;

    const confirmed = await confirm({
      title: "ลบระดับชั้น",
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบ ${selectedIds.length} ระดับชั้น?`,
      variant: "danger",
      confirmText: "ลบทั้งหมด",
      cancelText: "ยกเลิก",
    });

    if (confirmed) {
      const result = await deleteGradeLevelsAction(selectedIds);
      if (result.success) {
        enqueueSnackbar(`ลบ ${selectedIds.length} ระดับชั้นสำเร็จ`, {
          variant: "success",
        });
        setRows((prev) =>
          prev.filter((row) => !selectedIds.includes(row.GradeID)),
        );
        setRowSelectionModel({ type: "include", ids: new Set<GridRowId>() });
        await onMutate();
      } else {
        enqueueSnackbar("ลบระดับชั้นไม่สำเร็จ", { variant: "error" });
      }
    }
  }, [rowSelectionModel, confirm, onMutate]);

  // ==================== Update Handler ====================

  const processRowUpdate = useCallback(
    async (
      newRow: GridRowModel,
      _oldRow: GridRowModel,
    ): Promise<gradelevel> => {
      const updated = newRow as gradelevel;

      // Validate
      if (!updated.Year || updated.Year < 1 || updated.Year > 6) {
        throw new Error("ชั้นปีต้องอยู่ระหว่าง 1-6 (ม.1 - ม.6)");
      }
      if (!updated.Number || updated.Number < 1) {
        throw new Error("ห้องต้องมากกว่า 0");
      }
      if (updated.StudentCount != null && updated.StudentCount < 0) {
        throw new Error("จำนวนนักเรียนต้องไม่น้อยกว่า 0");
      }

      // Validate program matches year
      if (updated.ProgramID != null) {
        const validPrograms = programsByYear[updated.Year] ?? [];
        const isValid = validPrograms.some(
          (p) => p.ProgramID === updated.ProgramID,
        );
        if (!isValid) {
          throw new Error(`หลักสูตรที่เลือกไม่ตรงกับชั้นปี ม.${updated.Year}`);
        }
      }

      // Call server action
      const result = await updateGradeLevelsAction([
        {
          GradeID: updated.GradeID,
          Year: updated.Year,
          Number: updated.Number,
          StudentCount: updated.StudentCount ?? 0,
          ProgramID: updated.ProgramID ?? null,
        },
      ]);

      if (!result.success) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "บันทึกไม่สำเร็จ",
        );
      }

      enqueueSnackbar("บันทึกระดับชั้นสำเร็จ", { variant: "success" });
      await onMutate();
      return updated;
    },
    [onMutate, programsByYear],
  );

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    enqueueSnackbar(`บันทึกไม่สำเร็จ: ${error.message}`, { variant: "error" });
  }, []);

  // ==================== Columns ====================

  const columns: GridColDef<gradelevel>[] = useMemo(
    () => [
      {
        field: "GradeID",
        headerName: "รหัส",
        width: 90,
        editable: false,
      },
      {
        field: "Year",
        headerName: "ชั้นปี (ม.)",
        width: 100,
        editable: true,
        type: "number",
        valueFormatter: (value: number) => `ม.${value}`,
      },
      {
        field: "Number",
        headerName: "ห้อง",
        width: 80,
        editable: true,
        type: "number",
      },
      {
        field: "ProgramID",
        headerName: "หลักสูตร",
        flex: 1,
        minWidth: 200,
        editable: true,
        valueFormatter: (value: number | null, row) => {
          const anyRow = row as gradelevel & { program?: program | null };
          if (anyRow?.program) {
            return anyRow.program.ProgramName;
          }
          if (value != null) return `#${value}`;
          return "-";
        },
        renderEditCell: (params) => (
          <ProgramEditComponent {...params} programsByYear={programsByYear} />
        ),
      },
      {
        field: "StudentCount",
        headerName: "จำนวนนักเรียน",
        width: 120,
        editable: true,
        type: "number",
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
      programsByYear,
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
          data-testid="add-gradelevel-button"
        >
          เพิ่มระดับชั้น
        </Button>
      </Stack>

      {/* DataGrid */}
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.GradeID}
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
          noRowsLabel: "ไม่พบข้อมูลระดับชั้น",
          footerRowSelected: (count) => `เลือก ${count} รายการ`,
        }}
      />

      {/* Add Dialog */}
      <AddGradeLevelDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={onMutate}
        programsByYear={programsByYear}
      />

      {/* Confirm Dialog */}
      {dialog}
    </Box>
  );
}

export default GradeLevelDataGrid;
