/**
 * Room Selection Content - Shared Component
 *
 * Used by both the full-page route and modal intercept.
 * Fetches available rooms and handles room selection.
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useSnackbar } from "notistack";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { createClassScheduleAction } from "@/features/class/application/actions/class.actions";

type Room = {
  RoomID: number;
  RoomName: string;
  Building: string;
  Floor: string;
  Capacity: number | null;
};

type Props = {
  timeslot: string;
  subject: string;
  grade: string;
  teacher: string;
};

export function RoomSelectionContent({
  timeslot,
  subject,
  grade,
  teacher: _teacher,
}: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [isCreating, setIsCreating] = React.useState(false);

  // Fetch available rooms
  const { data, error, isLoading } = useSWR(
    `/api/rooms/available?timeslot=${timeslot}`,
    (url) => fetch(url).then((r) => r.json()),
  );

  const handleRoomSelect = async (room: Room) => {
    setIsCreating(true);

    try {
      // Create schedule entry via Server Action
      const result = await createClassScheduleAction({
        TimeslotID: timeslot,
        SubjectCode: subject,
        GradeID: grade,
        RoomID: room.RoomID,
        IsLocked: false,
        ResponsibilityIDs: [], // Populated by server action
      });

      if (result && typeof result === "object" && "success" in result && result.success) {
        enqueueSnackbar("✅ จัดตารางสอนสำเร็จ", { variant: "success" });
        router.back(); // Close modal
        router.refresh(); // Refresh grid data
      } else {
        const errorMsg =
          result &&
          typeof result === "object" &&
          "error" in result &&
          result.error &&
          typeof result.error === "object" &&
          "message" in result.error
            ? String((result.error as { message?: unknown }).message ?? "")
            : "";

        enqueueSnackbar(
          `❌ ไม่สามารถจัดตารางได้${errorMsg ? `: ${errorMsg}` : ""}`,
          { variant: "error" },
        );
      }
    } catch (error) {
      console.error("Create schedule error:", error);
      enqueueSnackbar("❌ เกิดข้อผิดพลาด", { variant: "error" });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">เกิดข้อผิดพลาดในการโหลดข้อมูลห้องเรียน</Alert>
    );
  }

  const {
    available = [],
    occupied = [],
  }: { available: Room[]; occupied: Room[] } = data?.data || {};

  return (
    <Box>
      {/* Info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        กำลังจัดห้องเรียนสำหรับ Timeslot: {timeslot}
      </Alert>

      {/* Available Rooms */}
      <Typography variant="h6" gutterBottom>
        ห้องว่าง ({available.length} ห้อง)
      </Typography>

      {available.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ไม่มีห้องว่างในช่วงเวลานี้
        </Alert>
      ) : (
        <List sx={{ mb: 2 }}>
          {available.map((room) => (
            <ListItemButton
              key={room.RoomID}
              onClick={() => handleRoomSelect(room)}
              disabled={isCreating}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={room.RoomName}
                secondary={
                  <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                    <Chip label={`อาคาร ${room.Building}`} size="small" />
                    <Chip label={`ชั้น ${room.Floor}`} size="small" />
                    {room.Capacity && (
                      <Chip
                        label={`${room.Capacity} ที่นั่ง`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}

      {/* Occupied Rooms */}
      {occupied.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom color="text.secondary">
            ห้องไม่ว่าง ({occupied.length} ห้อง)
          </Typography>
          <List>
            {occupied.map((room) => (
              <ListItemButton
                key={room.RoomID}
                disabled
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  opacity: 0.5,
                }}
              >
                <ListItemText
                  primary={room.RoomName}
                  secondary={`อาคาร ${room.Building} ชั้น ${room.Floor}`}
                />
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      {isCreating && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}
