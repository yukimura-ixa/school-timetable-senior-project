"use client";

import { useState, useEffect } from "react"
import { SubjectCategory, type subject } from '@/prisma/generated/client'
import { getSubjectsAction, deleteSubjectsAction } from "@/features/subject/application/actions/subject.actions";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TableContainer,
  Paper,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ActivityModal from "./ActivityModal";

export default function ActivityTable() {
  const [activities, setActivities] = useState<
    Array<{
      SubjectCode: string;
      SubjectName: string;
      ActivityType: string | null;
      IsGraded: boolean;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<{
    SubjectCode?: string;
    SubjectName?: string;
    ActivityType?: string | null;
    IsGraded?: boolean;
  } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    const res = await getSubjectsAction();
    setActivities(
      (res.data ?? [])
        .filter((s: subject) => s.Category === SubjectCategory.ACTIVITY)
        .map((s: subject) => ({
          SubjectCode: s.SubjectCode,
          SubjectName: s.SubjectName,
          ActivityType: s.ActivityType ?? null,
          IsGraded: s.IsGraded,
        }))
    );
    setLoading(false);
  };

  useEffect(() => {
    void fetchActivities();
  }, []);

  const handleAddClick = () => {
    setEditActivity(null);
    setModalOpen(true);
  };

  const handleEditClick = (activity: (typeof activities)[0]) => {
    setEditActivity(activity);
    setModalOpen(true);
  };

  const handleDeleteClick = (subjectCode: string) => {
    setActivityToDelete(subjectCode);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;

    const res = await deleteSubjectsAction({ SubjectCodes: [activityToDelete] });
    if (res.success) {
      await fetchActivities();
    }
    setDeleteConfirmOpen(false);
    setActivityToDelete(null);
  };

  const handleModalClose = async (shouldRefresh: boolean) => {
    setModalOpen(false);
    setEditActivity(null);
    if (shouldRefresh) {
      await fetchActivities();
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography variant="h5">Activity Management</Typography>
        <Button variant="contained" color="primary" onClick={handleAddClick}>
          Add Activity
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject Code</TableCell>
              <TableCell>Subject Name</TableCell>
              <TableCell>Activity Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="textSecondary">
                    No activities found. Add your first activity!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.SubjectCode}>
                  <TableCell>{activity.SubjectCode}</TableCell>
                  <TableCell>{activity.SubjectName}</TableCell>
                  <TableCell>{activity.ActivityType ?? "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(activity)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(activity.SubjectCode)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ActivityModal 
        open={modalOpen} 
        onClose={(shouldRefresh: boolean) => void handleModalClose(shouldRefresh)} 
        editActivity={editActivity} 
      />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this activity? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={() => void handleDeleteConfirm()} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
