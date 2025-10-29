/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
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

// Generic column definition
export type ColumnDef<T> = {
  key: keyof T;
  label: string;
  editable?: boolean;
  required?: boolean;
  type?: "text" | "number" | "select";
  options?: { value: string | number; label: string }[];
  width?: number | string;
  render?: (value: any, row: T) => ReactNode;
  // Optional custom renderer specifically for edit mode (row-aware editors)
  // onChange should be called with the new value to update the draft
  renderEdit?: (params: {
    value: any;
    row: T;
    onChange: (newValue: any) => void;
    hasError: boolean;
  }) => ReactNode;
};

// Generic validation function type
export type ValidationFn<T> = (
  id: string | number,
  data: Partial<T>,
  allData: T[]
) => string | null;

// Generic action result
export type ActionResult<T = any> = {
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
  validate?: ValidationFn<T>;
  onCreate?: (newRow: Partial<T>) => Promise<ActionResult>;
  onUpdate?: (rows: Partial<T>[]) => Promise<ActionResult>;
  onDelete?: (ids: (string | number)[]) => Promise<ActionResult>;
  onMutate: () => void | Promise<void>;
  emptyRowFactory: () => Partial<T>;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
};

export function EditableTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  idField,
  searchFields = [],
  searchPlaceholder = "ค้นหา...",
  validate,
  onCreate,
  onUpdate,
  onDelete,
  onMutate,
  emptyRowFactory,
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
}: EditableTableProps<T>) {
  const { confirm, dialog } = useConfirmDialog();
  const [tableData, setTableData] = useState<T[]>([]);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [drafts, setDrafts] = useState<Record<string | number, Partial<T>>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const allIds = tableData.map((r) => r[idField]).filter((x) => x != null);
  const isSelected = (id: string | number) => selected.includes(id);
  const toggleAll = (checked: boolean) => setSelected(checked ? [...allIds] : []);
  const toggleOne = (id: string | number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

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

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
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
    const newRow = drafts[tempId];

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
        throw new Error(errorMessage);
      }

      closeSnackbar(loadbar);
      enqueueSnackbar(`เพิ่ม${title}สำเร็จ`, { variant: "success" });
      setAddMode(false);
      setDrafts({});
      setValidationErrors({});
      await onMutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar(`เพิ่ม${title}ไม่สำเร็จ: ` + (error.message || "Unknown error"), {
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
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar(`ลบ${title}ไม่สำเร็จ: ` + (error.message || "Unknown error"), {
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

    const payload = selected.filter((id) => drafts[id]).map((id) => drafts[id]);

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
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar("บันทึกการแก้ไขไม่สำเร็จ: " + (error.message || "Unknown error"), {
        variant: "error",
      });
    }
  };

  const renderCell = (column: ColumnDef<T>, row: T, isEditing: boolean, id: string | number) => {
    const value = row[column.key];

    // Use custom render if provided and not editing
    if (!isEditing && column.render) {
      return column.render(value, row);
    }

    // Not editable or not in edit mode - just display
    if (!isEditing || column.editable === false) {
      return value != null ? String(value) : "-";
    }

    // Editable and in edit mode - show input
    const draftValue = drafts[id]?.[column.key] ?? value ?? "";
    const hasError = !!validationErrors[String(id)];

    // Row-aware custom edit renderer
    if (column.renderEdit) {
      return column.renderEdit({
        value: draftValue,
        row,
        hasError,
        onChange: (newValue: any) =>
          setDrafts((d) => ({
            ...d,
            [id]: { ...d[id], [column.key]: newValue },
          })),
      });
    }

    if (column.type === "select" && column.options) {
      return (
        <FormControl fullWidth size="small" error={hasError}>
          <Select
            value={draftValue}
            onChange={(e) =>
              setDrafts((d) => ({
                ...d,
                [id]: { ...d[id], [column.key]: e.target.value },
              }))
            }
          >
            {column.options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
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
        onChange={(e) =>
          setDrafts((d) => ({
            ...d,
            [id]: {
              ...d[id],
              [column.key]: column.type === "number" ? Number(e.target.value) : e.target.value,
            },
          }))
        }
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
            aria-label="edit"
            onClick={handleEnterEdit}
            disabled={selected.length === 0 || editMode || addMode}
          >
            <EditIcon />
          </IconButton>
        )}
        {(editMode || addMode) && (
          <>
            <IconButton
              aria-label="save"
              color="success"
              onClick={addMode ? handleSaveNew : handleSave}
            >
              <SaveIcon />
            </IconButton>
            <IconButton
              aria-label="cancel"
              color="inherit"
              onClick={addMode ? handleCancelAdd : handleCancelEdit}
            >
              <CloseIcon />
            </IconButton>
          </>
        )}
        {onDelete && (
          <IconButton
            aria-label="delete"
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
                  indeterminate={selected.length > 0 && selected.length < filtered.length}
                  checked={filtered.length > 0 && selected.length === filtered.length}
                  onChange={(e) => toggleAll(e.target.checked)}
                  inputProps={{ "aria-label": "select all" }}
                  disabled={addMode}
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
                      disabled={addMode}
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
