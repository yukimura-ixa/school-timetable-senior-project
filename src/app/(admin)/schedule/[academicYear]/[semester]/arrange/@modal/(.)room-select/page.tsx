/**
 * Room Selection Modal - Intercepting Route
 *
 * This intercepts navigation to /room-select and shows it as a modal overlay.
 * The (.) prefix means "intercept routes at the same level".
 *
 * Benefits:
 * - Back button closes modal (returns to arrange page)
 * - Refresh shows full-page version (fallback)
 * - URL is shareable and bookmarkable
 * - Modal state persists in URL
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { RoomSelectionContent } from "../room-select/_components/RoomSelectionContent";

export default function RoomSelectModal() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const timeslot = searchParams.get("timeslot") || "";
  const subject = searchParams.get("subject") || "";
  const grade = searchParams.get("grade") || "";
  const teacher = searchParams.get("teacher") || "";

  const handleClose = () => {
    router.back(); // Close modal by going back
  };

  return (
    <Dialog open onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        เลือกห้องเรียน
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <RoomSelectionContent
          timeslot={timeslot}
          subject={subject}
          grade={grade}
          teacher={teacher}
        />
      </DialogContent>
    </Dialog>
  );
}
