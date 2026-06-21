/**
 * Room Selection Content
 *
 * Rendered inside the arrange room-selection modal. Fetches available rooms
 * for a timeslot and lets the user pick one (select), then commit (confirm)
 * to create the class schedule entry.
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useSnackbar } from "notistack";
import { toErrorMessage } from "@/shared/lib/error-message";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Alert,
  Button,
  Collapse,
  CircularProgress,
  CardActionArea,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  MeetingRoom as RoomIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  ExpandMore as ExpandIcon,
  EventBusy as BusyIcon,
} from "@mui/icons-material";
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
  resp: string;
  /** When rendered as an in-page modal, close via state instead of router.back(). */
  onClose?: () => void;
};

const DAY_LABEL: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
  SAT: "เสาร์",
  SUN: "อาทิตย์",
};

/**
 * Timeslot IDs look like "1-2568-MON4" (configId "1-2568" + day "MON" +
 * period "4"). Derive a human-readable "จันทร์ คาบ 4" without an extra fetch.
 */
function describeTimeslot(timeslotId: string): string {
  const tail = timeslotId.split("-").pop() ?? "";
  const day = tail.match(/^[A-Z]+/)?.[0] ?? "";
  const period = tail.match(/\d+$/)?.[0] ?? "";
  const dayLabel = DAY_LABEL[day] ?? day;
  if (!dayLabel && !period) return timeslotId;
  return [dayLabel, period && `คาบ ${period}`].filter(Boolean).join(" ");
}

/** "M1-1" -> "ม.1/1". Falls back to the raw id for unexpected shapes. */
function describeGrade(gradeId: string): string {
  const m = gradeId.match(/^M(\d+)-(\d+)$/i);
  return m ? `ม.${m[1]}/${m[2]}` : gradeId;
}

export function RoomSelectionContent({
  timeslot,
  subject,
  grade,
  teacher: _teacher,
  resp,
  onClose,
}: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [showOccupied, setShowOccupied] = React.useState(false);
  const [setAsDefault, setSetAsDefault] = React.useState(false);

  const { data, error, isLoading } = useSWR(
    `/api/rooms/available?timeslot=${timeslot}`,
    (url) => fetch(url).then((r) => r.json()),
  );

  const {
    available = [],
    occupied = [],
  }: { available: Room[]; occupied: Room[] } = data?.data || {};

  const selectedRoom = available.find((r) => r.RoomID === selectedId) ?? null;

  const handleConfirm = async () => {
    if (!selectedRoom) return;
    setIsCreating(true);

    try {
      const result = await createClassScheduleAction({
        TimeslotID: timeslot,
        SubjectCode: subject,
        GradeID: grade,
        RoomID: selectedRoom.RoomID,
        IsLocked: false,
        ResponsibilityIDs: resp ? [parseInt(resp, 10)] : [],
        SetAsDefaultRoom: setAsDefault,
      });

      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        result.success
      ) {
        enqueueSnackbar("✅ จัดตารางสอนสำเร็จ", { variant: "success" });
        // Notify GridSlot to revalidate SWR before closing modal.
        // router.refresh() only refreshes RSC; client SWR caches stay stale.
        window.dispatchEvent(new CustomEvent("schedule-updated"));
        onClose?.();
        router.refresh(); // Refresh grid data (server components)
      } else {
        const errorMsg =
          result &&
          typeof result === "object" &&
          "error" in result &&
          result.error &&
          typeof result.error === "object" &&
          "message" in result.error
            ? toErrorMessage(result.error)
            : "";

        enqueueSnackbar(
          `❌ ไม่สามารถจัดตารางได้${errorMsg ? `: ${errorMsg}` : ""}`,
          { variant: "error" },
        );
      }
    } catch (err) {
      console.error("Create schedule error:", err);
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

  return (
    <Box>
      {/* Context: what we're scheduling, in human-readable terms */}
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          flexWrap: "wrap",
          mb: 2.5,
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: "action.hover",
        }}
      >
        <Chip label={subject} color="primary" size="small" />
        <Chip label={describeGrade(grade)} size="small" />
        <Chip
          label={describeTimeslot(timeslot)}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Typography
        variant="subtitle2"
        sx={{
          color: "text.secondary",
          mb: 1,
          fontWeight: 600,
        }}
      >
        ห้องว่าง · {available.length} ห้อง
      </Typography>
      {available.length === 0 ? (
        <Alert severity="warning">ไม่มีห้องว่างในช่วงเวลานี้</Alert>
      ) : (
        <Box
          data-testid="available-rooms-list"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 1.25,
          }}
        >
          {available.map((room) => {
            const isSelected = room.RoomID === selectedId;
            return (
              <CardActionArea
                key={room.RoomID}
                onClick={() => setSelectedId(room.RoomID)}
                disabled={isCreating}
                data-testid={`room-option-${room.RoomID}`}
                data-room-name={room.RoomName}
                aria-pressed={isSelected}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1.5px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: isSelected ? "action.selected" : "background.paper",
                  transition:
                    "border-color .15s, box-shadow .15s, transform .15s",
                  "&:hover": {
                    borderColor: isSelected ? "primary.main" : "primary.light",
                    boxShadow: 2,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    alignItems: "center",
                    mb: 0.75,
                  }}
                >
                  {isSelected ? (
                    <CheckIcon fontSize="small" color="primary" />
                  ) : (
                    <RoomIcon fontSize="small" color="action" />
                  )}
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 700 }}
                  >
                    {room.RoomName}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                  }}
                >
                  {room.Building} · {room.Floor}
                </Typography>
                {room.Capacity != null && (
                  <Chip
                    label={`${room.Capacity} ที่นั่ง`}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.75, height: 20, fontSize: "0.7rem" }}
                  />
                )}
              </CardActionArea>
            );
          })}
        </Box>
      )}
      {/* Occupied rooms: collapsed by default, for context only */}
      {occupied.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowOccupied((v) => !v)}
            startIcon={<BusyIcon fontSize="small" />}
            endIcon={
              <ExpandIcon
                fontSize="small"
                sx={{
                  transition: "transform .2s",
                  transform: showOccupied ? "rotate(180deg)" : "none",
                }}
              />
            }
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            ห้องไม่ว่าง ({occupied.length})
          </Button>
          <Collapse in={showOccupied}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 1.25,
                mt: 1,
                opacity: 0.6,
              }}
            >
              {occupied.map((room) => (
                <Box
                  key={room.RoomID}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "1.5px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 600 }}
                  >
                    {room.RoomName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {room.Building} · {room.Floor}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
      {/* Remember this room as the teacher+subject default for future drops */}
      {resp && selectedRoom && (
        <FormControlLabel
          sx={{ mt: 2, display: "block" }}
          control={
            <Checkbox
              size="small"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              disabled={isCreating}
              data-testid="set-default-room"
            />
          }
          label={`ตั้ง "${selectedRoom.RoomName}" เป็นห้องเริ่มต้นสำหรับวิชานี้`}
        />
      )}
      {/* Commit bar */}
      <Box
        sx={{
          mt: 2.5,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {selectedRoom
            ? `เลือก: ${selectedRoom.RoomName}`
            : "เลือกห้องเพื่อจัดตาราง"}
        </Typography>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedRoom || isCreating}
          data-testid="room-confirm"
          endIcon={
            isCreating ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <ArrowIcon />
            )
          }
        >
          ยืนยันจัดห้อง
        </Button>
      </Box>
    </Box>
  );
}
