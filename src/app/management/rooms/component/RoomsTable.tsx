"use client";
import React, { useState, useEffect, Fragment, type JSX } from "react";
import type { room } from "@/prisma/generated";
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
  Stack,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
//comp
import AddModalForm from "@/app/management/rooms/component/AddModalForm";
import { useConfirmDialog } from "@/components/dialogs";
import { deleteRoomsAction, updateRoomsAction } from "@/features/room/application/actions/room.actions";
import { closeSnackbar, enqueueSnackbar } from "notistack";

type RoomsTableProps = {
  tableHead: string[];
  tableData: room[];
  mutate: Function;
};
function Table({ tableHead, tableData, mutate }: RoomsTableProps): JSX.Element {
  const [addModalActive, setAddModalActive] = useState<boolean>(false);
  const { confirm, dialog } = useConfirmDialog();
  const [roomData, setRoomData] = useState<room[]>([]);
  const [selected, setSelected] = useState<number[]>([]); // RoomIDs
  const [editMode, setEditMode] = useState<boolean>(false);
  const [drafts, setDrafts] = useState<Record<number, { RoomName: string; Building: string; Floor: string }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setRoomData(tableData);
  }, [tableData]);

  const allIds = roomData.map((r) => r.RoomID).filter((x): x is number => typeof x === "number");
  const isSelected = (id: number) => selected.includes(id);
  const toggleAll = (checked: boolean) => setSelected(checked ? [...allIds] : []);
  const toggleOne = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // simple search by RoomName/Building
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filtered = roomData.filter((item) =>
    item.RoomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Building.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDeleteRooms = async () => {
    const confirmed = await confirm({
      title: "ลบข้อมูลสถานที่เรียน",
      message: `คุณต้องการลบข้อมูลสถานที่เรียนที่เลือกทั้งหมด ${selected.length} รายการใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      variant: "danger",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return;

    const loadbar = enqueueSnackbar("กำลังลบข้อมูลสถานที่เรียน", {
      variant: "info",
      persist: true,
    });

    const deleteIds = selected;

    try {
      const result = await deleteRoomsAction({ roomIds: deleteIds });
      
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }
      
      closeSnackbar(loadbar);
      enqueueSnackbar("ลบข้อมูลสถานที่เรียนสำเร็จ", { variant: "success" });
      setSelected([]);
      mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar(
        "ลบข้อมูลสถานที่เรียนไม่สำเร็จ: " + (error.message || "Unknown error"),
        { variant: "error" }
      );
      console.error(error);
    }
  };

  const handleEnterEdit = () => {
    if (selected.length === 0) return;
    const nextDrafts: Record<number, { RoomName: string; Building: string; Floor: string }> = {};
    for (const r of roomData) {
      if (r.RoomID != null && selected.includes(r.RoomID)) {
        nextDrafts[r.RoomID] = {
          RoomName: r.RoomName,
          Building: r.Building,
          Floor: String(r.Floor ?? ""),
        };
      }
    }
    setDrafts(nextDrafts);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setDrafts({});
  };

  const handleSave = async () => {
    if (!editMode || selected.length === 0) return;
    const payload = selected
      .filter((id) => drafts[id])
      .map((id) => ({
        RoomID: id,
        RoomName: drafts[id].RoomName,
        Building: drafts[id].Building,
        Floor: drafts[id].Floor,
      }));

    const loadbar = enqueueSnackbar("กำลังบันทึกการแก้ไขสถานที่เรียน", {
      variant: "info",
      persist: true,
    });
    try {
      const result = await updateRoomsAction(payload);
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }
      closeSnackbar(loadbar);
      enqueueSnackbar("บันทึกการแก้ไขสำเร็จ", { variant: "success" });
      setEditMode(false);
      setDrafts({});
      setSelected([]);
      mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar("บันทึกการแก้ไขไม่สำเร็จ: " + (error.message || "Unknown error"), {
        variant: "error",
      });
    }
  };

  return (
    <>
      {dialog}
      {addModalActive ? (
        <AddModalForm
          closeModal={() => setAddModalActive(false)}
          mutate={mutate}
        />
      ) : null}

      <Toolbar sx={{ pl: 2, pr: 2 }}>
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
          จัดการสถานที่เรียน
        </Typography>
        <MuiTextField
          size="small"
          placeholder="ค้นหาชื่อสถานที่หรืออาคาร"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mr: 2, width: 300 }}
        />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setAddModalActive(true)}>
          เพิ่มสถานที่
        </Button>
        <IconButton aria-label="edit" onClick={handleEnterEdit} disabled={selected.length === 0 || editMode}>
          <EditIcon />
        </IconButton>
        {editMode ? (
          <>
            <IconButton aria-label="save" color="success" onClick={handleSave}>
              <SaveIcon />
            </IconButton>
            <IconButton aria-label="cancel" color="inherit" onClick={handleCancelEdit}>
              <CloseIcon />
            </IconButton>
          </>
        ) : null}
        <IconButton aria-label="delete" color="error" onClick={handleDeleteRooms} disabled={selected.length === 0}>
          <DeleteIcon />
        </IconButton>
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
                  inputProps={{ 'aria-label': 'select all rooms' }}
                />
              </TableCell>
              {tableHead.map((h, i) => (
                <TableCell key={i}>{h}</TableCell>
              ))}
            </MuiTableRow>
          </TableHead>
          <TableBody>
            {paged.map((item) => {
              const id = Number(item.RoomID);
              const selectedRow = isSelected(id);
              const isEditing = editMode && selectedRow;
              return (
                <MuiTableRow key={id} hover selected={selectedRow}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedRow} onChange={() => toggleOne(id)} />
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <MuiTextField
                        size="small"
                        value={drafts[id]?.RoomName ?? ""}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [id]: { ...d[id], RoomName: e.target.value } }))
                        }
                      />
                    ) : (
                      item.RoomName
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <MuiTextField
                        size="small"
                        value={drafts[id]?.Building ?? ""}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [id]: { ...d[id], Building: e.target.value } }))
                        }
                      />
                    ) : (
                      item.Building
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <MuiTextField
                        size="small"
                        value={drafts[id]?.Floor ?? ""}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [id]: { ...d[id], Floor: e.target.value } }))
                        }
                      />
                    ) : (
                      item.Floor
                    )}
                  </TableCell>
                  <TableCell />
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
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </>
  );
}

export default Table;
