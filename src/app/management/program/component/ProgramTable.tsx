// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { semester, type program } from "@/prisma/generated";

// Program rows include related gradelevel and subject arrays
export type ProgramRow = program & {
  gradelevel: Array<{ GradeID: string | number; Year: number; Number: number }>;
  subject: Array<{ SubjectCode: string }>;
};
import {
  Paper,
  Toolbar,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Table as MuiTable,
  TableHead,
  TableRow as MuiTableRow,
  TableCell,
  TableBody,
  Checkbox,
  TableContainer,
  TablePagination,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { useConfirmDialog } from "@/components/dialogs";
import { semesterThai } from "@/models/semester-thai";
import {
  updateProgramAction,
  deleteProgramAction,
} from "@/features/program/application/actions/program.actions";
import AddStudyProgramModal from "./AddStudyProgramModal";
import EditStudyProgramModal from "./EditStudyProgramModal";

export type ProgramTableProps = {
  year: number;
  rows: ProgramRow[];
  mutate: () => Promise<any> | void;
};

export default function ProgramTable({ year, rows, mutate }: ProgramTableProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, { ProgramName: string; Semester: semester }>>({});
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<semester | "ALL">("ALL");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  // Extract unique academic years from rows
  const availableAcademicYears = useMemo(() => {
    const years = new Set<number>();
    rows.forEach((r) => {
      if ((r as any).AcademicYear) {
        years.add((r as any).AcademicYear);
      }
    });
    // If no years in data, add current Thai year
    if (years.size === 0) {
      years.add(new Date().getFullYear() + 543);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [rows]);

  const filtered = useMemo(() => {
    let result = rows;

    // Semester filter
    if (semesterFilter !== "ALL") {
      result = result.filter((r) => r.Semester === semesterFilter);
    }

    // Academic year filter
    if (academicYearFilter !== "ALL") {
      result = result.filter((r) => (r as any).AcademicYear === parseInt(academicYearFilter));
    }

    // Search filter
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((r) =>
        r.ProgramName.toLowerCase().includes(q)
        || String(r.Semester).toLowerCase().includes(q)
      );
    }

    return result;
  }, [rows, search, semesterFilter, academicYearFilter]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const allIds = filtered.map((r) => r.ProgramID).filter((x): x is number => typeof x === "number");

  const toggleAll = (checked: boolean) => setSelected(checked ? [...allIds] : []);
  const toggleOne = (id: number) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const isSelected = (id: number) => selected.includes(id);

  const handleEnterEdit = () => {
    if (selected.length === 0) return;
    const next: Record<number, { ProgramName: string; Semester: semester }> = {};
    for (const r of rows) {
      if (r.ProgramID != null && selected.includes(r.ProgramID)) {
        next[r.ProgramID] = { ProgramName: r.ProgramName, Semester: r.Semester } as any;
      }
    }
    setDrafts(next);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setDrafts({});
  };

  const handleSave = async () => {
    if (!editMode || selected.length === 0) return;

    const loadbar = enqueueSnackbar("กำลังบันทึกการแก้ไขหลักสูตร", { variant: "info", persist: true });
    try {
      for (const id of selected) {
        const orig = rows.find((r) => r.ProgramID === id);
        const draft = drafts[id];
        if (!orig || !draft) continue;
        // Reuse existing gradelevel/subject connections and AcademicYear on update
        await updateProgramAction({
          ProgramID: id,
          ProgramName: draft.ProgramName,
          Semester: draft.Semester,
          AcademicYear: (orig as any).AcademicYear || new Date().getFullYear() + 543,
          gradelevel: orig.gradelevel.map((g: any) => ({ GradeID: g.GradeID })),
          subject: orig.subject.map((s: any) => ({ SubjectCode: s.SubjectCode })),
        } as any);
      }
      closeSnackbar(loadbar);
      enqueueSnackbar("บันทึกการแก้ไขสำเร็จ", { variant: "success" });
      setEditMode(false);
      setDrafts({});
      setSelected([]);
      await mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar("บันทึกการแก้ไขไม่สำเร็จ: " + (error?.message || "Unknown error"), { variant: "error" });
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    const ok = await confirm({
      title: "ลบหลักสูตร",
      message: `คุณต้องการลบหลักสูตรที่เลือกทั้งหมด ${selected.length} รายการใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      variant: "danger",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
    });
    if (!ok) return;

    const loadbar = enqueueSnackbar("กำลังลบหลักสูตร", { variant: "info", persist: true });
    try {
      for (const id of selected) {
        await deleteProgramAction({ ProgramID: id } as any);
      }
      closeSnackbar(loadbar);
      enqueueSnackbar("ลบหลักสูตรสำเร็จ", { variant: "success" });
      setSelected([]);
      await mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar("ลบหลักสูตรไม่สำเร็จ: " + (error?.message || "Unknown error"), { variant: "error" });
    }
  };

  return (
    <>
      {dialog}
      {addOpen && (
        <AddStudyProgramModal closeModal={() => setAddOpen(false)} mutate={mutate} />
      )}
      {editOpen && selected.length === 1 && (
        <EditStudyProgramModal
          closeModal={() => setEditOpen(false)}
          mutate={mutate}
          editData={rows.find((r) => r.ProgramID === selected[0])}
        />
      )}

      <Paper>
        <Toolbar sx={{ pl: 2, pr: 2, gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ flex: "1 1 100%", minWidth: 120 }} variant="h6">
            หลักสูตร ม.{year}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Semester Filter */}
            <TextField
              select
              size="small"
              label="ภาคเรียน"
              value={semesterFilter}
              onChange={(e) => { setSemesterFilter(e.target.value as semester | "ALL"); setPage(0); }}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="ALL">ทั้งหมด</MenuItem>
              <MenuItem value={semester.SEMESTER_1}>{semesterThai[semester.SEMESTER_1]}</MenuItem>
              <MenuItem value={semester.SEMESTER_2}>{semesterThai[semester.SEMESTER_2]}</MenuItem>
            </TextField>

            {/* Academic Year Filter */}
            <TextField
              select
              size="small"
              label="ปีการศึกษา"
              value={academicYearFilter}
              onChange={(e) => { setAcademicYearFilter(e.target.value); setPage(0); }}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="ALL">ทั้งหมด</MenuItem>
              {availableAcademicYears.map((year) => (
                <MenuItem key={year} value={String(year)}>{year}</MenuItem>
              ))}
            </TextField>

            {/* Search */}
            <TextField
              size="small"
              placeholder="ค้นหาชื่อหลักสูตร"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              sx={{ minWidth: 200 }}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
              เพิ่มหลักสูตร
            </Button>
            <IconButton onClick={handleEnterEdit} disabled={selected.length === 0 || editMode}>
              <EditIcon />
            </IconButton>
            {editMode && (
              <>
                <IconButton color="success" onClick={handleSave}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancelEdit}>
                  <CloseIcon />
                </IconButton>
              </>
            )}
            <IconButton color="error" onClick={handleDelete} disabled={selected.length === 0}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Toolbar>

        <TableContainer>
          <MuiTable size="small">
            <TableHead>
              <MuiTableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < allIds.length}
                    checked={allIds.length > 0 && selected.length === allIds.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>ชื่อหลักสูตร</TableCell>
                <TableCell>ภาคเรียน</TableCell>
                <TableCell align="right">ชั้นเรียน (จำนวน)</TableCell>
                <TableCell align="right">รายวิชา (จำนวน)</TableCell>
              </MuiTableRow>
            </TableHead>
            <TableBody>
              {paged.map((row) => {
                const id = Number(row.ProgramID);
                const selectedRow = isSelected(id);
                const isEditing = editMode && selectedRow;
                return (
                  <MuiTableRow key={id} hover selected={selectedRow}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedRow} onChange={() => toggleOne(id)} />
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          value={drafts[id]?.ProgramName ?? ""}
                          onChange={(e) => setDrafts((d) => ({ ...d, [id]: { ...d[id], ProgramName: e.target.value } }))}
                        />
                      ) : (
                        row.ProgramName
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          select
                          size="small"
                          value={drafts[id]?.Semester ?? row.Semester}
                          onChange={(e) => setDrafts((d) => ({ ...d, [id]: { ...d[id], Semester: e.target.value as semester } }))}
                          sx={{ minWidth: 140 }}
                        >
                          {Object.entries(semesterThai).map(([key, label]) => (
                            <MenuItem key={key} value={key as any}>{label}</MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        semesterThai[row.Semester]
                      )}
                    </TableCell>
                    <TableCell align="right">{row.gradelevel.length}</TableCell>
                    <TableCell align="right">{row.subject.length}</TableCell>
                  </MuiTableRow>
                );
              })}
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5,10,25]}
        />
      </Paper>
    </>
  );
}
