"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import {
  Table as MuiTable,
  TableHead,
  TableRow as MuiTableRow,
  TableCell,
  TableBody,
  Checkbox,
  Toolbar,
  Typography,
  IconButton,
  TextField as MuiTextField,
  TableContainer,
  Paper,
  TablePagination,
  Button,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useConfirmDialog } from "@/components/dialogs";
import { closeSnackbar, enqueueSnackbar } from "notistack";

// Generic column definition using discriminated union for strict type safe render/renderEdit
export type ColumnDef<T> = {
  [K in keyof T]: {
    key: K;
    label: string;
    editable?: boolean;
    creatable?: boolean;
    required?: boolean;
    type?: "text" | "number" | "select";
    options?: { value: string | number; label: string }[];
    width?: number | string;
    render?: (value: T[K], row: T) => ReactNode;
    // Optional custom renderer specifically for edit mode (row-aware editors)
    // onChange should be called with the new value to update the draft
    renderEdit?: (params: {
      value: T[K];
      row: T;
      onChange: (newValue: T[K]) => void;
      hasError: boolean;
    }) => ReactNode;
  };
}[keyof T];

// Generic validation function type
export type ValidationFn<T> = (
  id: string | number,
  data: Partial<T>,
  allData: T[],
) => string | null;

// Generic action result
export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string | { message: string };
};

export type EditableTableProps<T> = {
  title: string;
  columns: ColumnDef<T>[];
  data: T[];
  idField: keyof T;
  searchFields?: (keyof T)[];
  searchPlaceholder?: string;
  searchTestId?: string;
  validate?: ValidationFn<T>;
  onCreate?: (newRow: Partial<T>) => Promise<ActionResult>;
  onUpdate?: (rows: Partial<T>[]) => Promise<ActionResult>;
  onDelete?: (ids: (string | number)[]) => Promise<ActionResult>;
  onMutate: () => void | Promise<void>;
  emptyRowFactory: () => Partial<T>;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  // Allow consumers to keep selection enabled even if add mode is active (useful when add flow is external)
  disableSelectionDuringCreate?: boolean;
};

export function EditableTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  idField,
  searchFields = [],
  searchPlaceholder = "ค้นหา...",
  searchTestId,
  validate,
  onCreate,
  onUpdate,
  onDelete,
  onMutate,
  emptyRowFactory,
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  disableSelectionDuringCreate = true,
}: EditableTableProps<T>) {
  const { confirm, dialog } = useConfirmDialog();
  const [tableData, setTableData] = useState<T[]>(data);

  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [drafts, setDrafts] = useState<Record<string | number, Partial<T>>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const allIds = tableData.map((r) => r[idField]).filter((x) => x != null);

  const isSelected = (id: string | number) => selected.includes(id);
  const toggleAll = (checked: boolean) =>
    setSelected(checked ? [...allIds] : []);
  const toggleOne = (id: string | number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // Search filter
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filtered = tableData.filter((item) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return searchFields.some((field) => {
      const value = item[field];
      if (value == null) return false;
      return String(value).toLowerCase().includes(lowerSearch);
    });
  });

  const paged = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Add new row
  const handleAddRow = () => {
    if (editMode) return;
    const tempId = `new_${Date.now()}`;
    setDrafts({ [tempId]: emptyRowFactory() });
    setAddMode(true);
  };

  const handleCancelAdd = () => {
    setDrafts({});
    setAddMode(false);
    setValidationErrors({});
  };

  const handleSaveNew = async () => {
    if (!onCreate) {
      enqueueSnackbar("การเพิ่มข้อมูลไม่พร้อมใช้งาน", { variant: "error" });
      return;
    }

    const tempId = Object.keys(drafts)[0];
    if (!tempId) {
      enqueueSnackbar("ไม่พบข้อมูลที่จะเพิ่ม", { variant: "error" });
      return;
    }
    const newRow = drafts[tempId];
    if (!newRow) {
      enqueueSnackbar("ข้อมูลไม่ถูกต้อง", { variant: "error" });
      return;
    }

    // Validate
    if (validate) {
      const error = validate(tempId, newRow, tableData);
      if (error) {
        setValidationErrors({ [tempId]: error });
        enqueueSnackbar(error, { variant: "error" });
        return;
      }
    }

    const loadbar = enqueueSnackbar(`กำลังเพิ่ม${title}`, {
      variant: "info",
      persist: true,
    });

    try {
      const result = await onCreate(newRow);

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error";
        console.error("[EDITABLE_TABLE_SAVE_FAILED]", {
          title,
          error: errorMessage,
          fullError: result.error,
        });
        throw new Error(errorMessage);
      }

      closeSnackbar(loadbar);
      enqueueSnackbar(`เพิ่ม${title}สำเร็จ`, { variant: "success" });
      setAddMode(false);
      setDrafts({});
      setValidationErrors({});
      await onMutate();
    } catch (error: unknown) {
      closeSnackbar(loadbar);
      const message = error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar(`เพิ่ม${title}ไม่สำเร็จ: ` + message, {
        variant: "error",
      });
    }
  };

  // Delete rows
  const handleDelete = async () => {
    if (!onDelete) {
      enqueueSnackbar("การลบข้อมูลไม่พร้อมใช้งาน", { variant: "error" });
      return;
    }

    const confirmed = await confirm({
      title: `ลบ${title}`,
      message: `คุณต้องการลบ${title}ที่เลือกทั้งหมด ${selected.length} รายการใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      variant: "danger",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return;

    const loadbar = enqueueSnackbar(`กำลังลบ${title}`, {
      variant: "info",
      persist: true,
    });

    try {
      const result = await onDelete(selected);

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }

      closeSnackbar(loadbar);
      enqueueSnackbar(`ลบ${title}สำเร็จ`, { variant: "success" });
      setSelected([]);
      await onMutate();
    } catch (error: unknown) {
      closeSnackbar(loadbar);
      const message = error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar(`ลบ${title}ไม่สำเร็จ: ` + message, {
        variant: "error",
      });
      console.error(error);
    }
  };

  // Edit existing rows
  const handleEnterEdit = () => {
    if (selected.length === 0 || addMode) return;
    const nextDrafts: Record<string | number, Partial<T>> = {};
    for (const row of tableData) {
      const id = row[idField];
      if (id != null && selected.includes(id)) {
        nextDrafts[id] = { ...row };
      }
    }
    setDrafts(nextDrafts);
    setEditMode(true);
    setValidationErrors({});
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setDrafts({});
    setValidationErrors({});
  };

  const handleSave = async () => {
    if (!onUpdate || !editMode || selected.length === 0) return;

    // Validate all selected rows
    const errors: Record<string, string> = {};
    for (const id of selected) {
      if (drafts[id] && validate) {
        const error = validate(id, drafts[id], tableData);
        if (error) {
          errors[String(id)] = error;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      enqueueSnackbar("กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง", { variant: "error" });
      return;
    }

    const payload = selected
      .filter((id) => drafts[id] !== undefined)
      .map((id) => drafts[id]!);

    const loadbar = enqueueSnackbar(`กำลังบันทึกการแก้ไข${title}`, {
      variant: "info",
      persist: true,
    });

    try {
      const result = await onUpdate(payload);
      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }
      closeSnackbar(loadbar);
      enqueueSnackbar("บันทึกการแก้ไขสำเร็จ", { variant: "success" });
      setEditMode(false);
      setDrafts({});
      setSelected([]);
      setValidationErrors({});
      await onMutate();
    } catch (error: unknown) {
      closeSnackbar(loadbar);
      const message = error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar("บันทึกการแก้ไขไม่สำเร็จ: " + message, {
        variant: "error",
      });
    }
  };

  const renderCell = (
    column: ColumnDef<T>,
    row: T,
    isEditing: boolean,
    id: string | number,
  ) => {
    const value = row[column.key];

    // Use custom render if provided and not editing
    if (!isEditing && column.render) {
      return (column.render as any)(value, row);
    }

    // Check if field should be editable
    // 1. Must be in edit mode (isEditing=true)
    // 2. AND (editable is not false OR (it's a new row AND field is creatable))
    const isNew = String(id).startsWith("new_");
    const canEdit =
      isEditing && (column.editable !== false || (isNew && column.creatable));

    // Not editable - just display
    if (!canEdit) {
      return value != null ? String(value) : "-";
    }

    // Editable and in edit mode - show input
    const draftValue = drafts[id]?.[column.key] ?? value ?? "";
    const hasError = !!validationErrors[String(id)];

    // Row-aware custom edit renderer
    if (column.renderEdit) {
      return (column.renderEdit as any)({
        value: draftValue,
        row,
        hasError,
        onChange: (newValue: any) => {
          setDrafts((d) => {
            const updated = { ...d };
            updated[id] = {
              ...(d[id] ?? {}),
              [column.key]: newValue,
            } as Partial<T>;
            return updated;
          });
        },
      });
    }

    if (column.type === "select" && column.options) {
      return (
        <FormControl fullWidth size="small" error={hasError}>
          <Select
            value={draftValue}
            data-testid={`select-${String(column.key)}`}
            onChange={(e) => {
              setDrafts((d) => {
                const updated = { ...d };
                updated[id] = {
                  ...(d[id] ?? {}),
                  [column.key]: e.target.value,
                } as Partial<T>;
                return updated;
              });
            }}
          >
            {column.options.map((opt) => (
              <MenuItem
                key={opt.value}
                value={opt.value}
                data-testid={`option-${String(column.key)}-${opt.value}`}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <MuiTextField
        size="small"
        fullWidth
        type={column.type === "number" ? "number" : "text"}
        value={draftValue}
        onChange={(e) => {
          setDrafts((d) => {
            const updated = { ...d };
            updated[id] = {
              ...(d[id] ?? {}),
              [column.key]:
                column.type === "number"
                  ? Number(e.target.value)
                  : e.target.value,
            } as Partial<T>;
            return updated;
          });
        }}
        error={hasError}
        helperText={hasError ? validationErrors[String(id)] : undefined}
        placeholder={column.required ? `${column.label} *` : column.label}
      />
    );
  };

  return (
    <>
      {dialog}

      <Toolbar sx={{ pl: 2, pr: 2 }}>
        <Typography sx={{ flex: "1 1 100%" }} variant="h6" component="div">
          {title}
        </Typography>
        {searchFields.length > 0 && (
          <MuiTextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearch}
            sx={{ mr: 2, width: 300 }}
            inputProps={{
              "aria-label": searchPlaceholder,
              ...(searchTestId ? { "data-testid": searchTestId } : {}),
            }}
          />
        )}
        {onCreate && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
            disabled={editMode || addMode}
          >
            เพิ่ม
          </Button>
        )}
        {onUpdate && (
          <IconButton
            aria-label="แก้ไข"
            onClick={handleEnterEdit}
            disabled={selected.length === 0 || editMode || addMode}
          >
            <EditIcon />
          </IconButton>
        )}
        {(editMode || addMode) && (
          <>
            <IconButton
              aria-label="บันทึก"
              color="success"
              onClick={addMode ? handleSaveNew : handleSave}
            >
              <SaveIcon />
            </IconButton>
            <IconButton
              aria-label="ยกเลิก"
              color="inherit"
              onClick={addMode ? handleCancelAdd : handleCancelEdit}
            >
              <CloseIcon />
            </IconButton>
          </>
        )}
        {onDelete && (
          <IconButton
            aria-label="ลบ"
            color="error"
            onClick={handleDelete}
            disabled={selected.length === 0 || editMode || addMode}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Toolbar>

      <TableContainer component={Paper}>
        <MuiTable size="small">
          <TableHead>
            <MuiTableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < filtered.length
                  }
                  checked={
                    filtered.length > 0 && selected.length === filtered.length
                  }
                  onChange={(e) => toggleAll(e.target.checked)}
                  inputProps={{ "aria-label": "เลือกทั้งหมด" }}
                  disabled={addMode && disableSelectionDuringCreate}
                />
              </TableCell>
              {columns.map((col) => (
                <TableCell key={String(col.key)} style={{ width: col.width }}>
                  {col.label}
                </TableCell>
              ))}
            </MuiTableRow>
          </TableHead>
          <TableBody>
            {/* Add new row at top when in add mode */}
            {addMode &&
              Object.keys(drafts).map((tempId) => (
                <MuiTableRow key={tempId} sx={{ bgcolor: "action.hover" }}>
                  <TableCell padding="checkbox">
                    <Checkbox disabled />
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {renderCell(col, drafts[tempId] as T, true, tempId)}
                    </TableCell>
                  ))}
                </MuiTableRow>
              ))}

            {/* Existing rows */}
            {paged.map((item) => {
              const id = item[idField];
              const selectedRow = isSelected(id);
              const isEditing = editMode && selectedRow;
              return (
                <MuiTableRow key={String(id)} hover selected={selectedRow}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRow}
                      onChange={() => toggleOne(id)}
                      disabled={addMode && disableSelectionDuringCreate}
                    />
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {renderCell(col, item, isEditing, id)}
                    </TableCell>
                  ))}
                </MuiTableRow>
              );
            })}
          </TableBody>
        </MuiTable>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      </TableContainer>
    </>
  );
}
