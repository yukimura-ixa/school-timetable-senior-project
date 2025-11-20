import { useRooms } from "@/hooks";
import { RoomAutocomplete } from "@/components/room";
import type { room } from @/prisma/generated/client";
import React from "react";
import { Box, Typography } from "@mui/material";

type Props = {
  roomName: string | null;
  handleRoomChange: (value: room) => void;
  required?: boolean;
  availabilityMap?: Record<number, 'available' | 'occupied' | 'partial'>;
  showAvailability?: boolean;
};

/**
 * Enhanced room selection component with MUI Autocomplete
 * Features:
 * - Building/floor grouping
 * - Case-insensitive search
 * - Visual icons and metadata
 * - Accessible keyboard navigation
 */
function SelectRoomName({ roomName, handleRoomChange, required = false, availabilityMap, showAvailability }: Props) {
  const { data: rooms } = useRooms();

  // Find the currently selected room by name
  const selectedRoom = roomName 
    ? rooms.find((r) => r.RoomName === roomName) || null
    : null;

  return (
    <Box sx={{ width: "100%" }}>
      <RoomAutocomplete
        rooms={rooms}
        value={selectedRoom}
        onChange={(room) => {
          if (room) {
            handleRoomChange(room);
          }
        }}
        label="สถานที่เรียน"
        placeholder="เลือกห้องเรียน"
        required={required}
        fullWidth
        size="small"
        availabilityMap={availabilityMap}
        showAvailability={showAvailability}
      />
    </Box>
  );
}

export default SelectRoomName;
