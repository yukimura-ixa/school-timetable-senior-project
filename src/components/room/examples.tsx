/**
 * Room Selection UI Components - Usage Examples
 *
 * This file demonstrates how to use the enhanced room selection components
 * with building/floor grouping and MUI integration.
 */

import React, { useState } from "react";
import { Box, Stack, Typography, Paper } from "@mui/material";
import { RoomAutocomplete, RoomMultiSelect } from "@/components/room";
import { useRooms } from "@/hooks";
import type { room } from "@/prisma/generated/client";

/**
 * Example 1: Single Room Selection
 * Use case: Selecting one room for a class schedule
 */
export function SingleRoomExample() {
  const { data: rooms } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<room | null>(null);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        เลือกห้องเรียน (เลือกได้ 1 ห้อง)
      </Typography>
      <RoomAutocomplete
        rooms={rooms}
        value={selectedRoom}
        onChange={setSelectedRoom}
        label="ห้องเรียน"
        placeholder="เลือกห้องเรียนสำหรับตารางนี้"
        required
      />
      {selectedRoom && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>ห้องที่เลือก:</strong> {selectedRoom.RoomName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            อาคาร {selectedRoom.Building} • ชั้น {selectedRoom.Floor}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

/**
 * Example 2: Multiple Room Selection
 * Use case: Selecting multiple rooms for bulk operations
 */
export function MultipleRoomExample() {
  const { data: rooms } = useRooms();
  const [selectedRooms, setSelectedRooms] = useState<room[]>([]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        เลือกห้องเรียน (เลือกได้หลายห้อง)
      </Typography>
      <RoomMultiSelect
        rooms={rooms}
        value={selectedRooms}
        onChange={setSelectedRooms}
        label="ห้องเรียน"
        placeholder="เลือกห้องเรียนหลายห้อง"
        limitTags={2}
      />
      {selectedRooms.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
          <Typography variant="body2" gutterBottom>
            <strong>ห้องที่เลือก ({selectedRooms.length}):</strong>
          </Typography>
          <Stack spacing={1}>
            {selectedRooms.map((room) => (
              <Typography key={room.RoomID} variant="caption">
                • {room.RoomName} (อาคาร {room.Building} • ชั้น {room.Floor})
              </Typography>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

/**
 * Example 3: Room Selection with Validation
 * Use case: Form validation for required room field
 */
export function RoomWithValidationExample() {
  const { data: rooms } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<room | null>(null);
  const [touched, setTouched] = useState(false);

  const error = touched && !selectedRoom;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        เลือกห้องเรียน (มี Validation)
      </Typography>
      <RoomAutocomplete
        rooms={rooms}
        value={selectedRoom}
        onChange={(room) => {
          setSelectedRoom(room);
          setTouched(true);
        }}
        label="ห้องเรียน"
        placeholder="กรุณาเลือกห้องเรียน"
        required
        error={error}
        helperText={
          error ? "กรุณาเลือกห้องเรียน" : "เลือกห้องที่ต้องการสำหรับตารางนี้"
        }
      />
    </Paper>
  );
}

/**
 * Example 4: Disabled State
 * Use case: Showing room selection when user doesn't have permission
 */
export function DisabledRoomExample() {
  const { data: rooms } = useRooms();
  const preSelectedRoom = rooms[0] || null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        ห้องเรียน (ปิดการแก้ไข)
      </Typography>
      <RoomAutocomplete
        rooms={rooms}
        value={preSelectedRoom}
        onChange={() => {}}
        label="ห้องเรียน"
        disabled
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        คุณไม่มีสิทธิ์แก้ไขห้องเรียนในตารางนี้
      </Typography>
    </Paper>
  );
}

/**
 * Example 5: Integration with Form
 * Use case: Using room selection in a form with other fields
 */
export function RoomFormIntegrationExample() {
  const { data: rooms } = useRooms();
  const [formData, setFormData] = useState({
    subject: "",
    room: null as room | null,
    teacher: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    // console.log("Form submitted:", formData);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h6">เพิ่มรายการตาราง</Typography>

          <RoomAutocomplete
            rooms={rooms}
            value={formData.room}
            onChange={(room) => setFormData({ ...formData, room })}
            label="ห้องเรียน"
            placeholder="เลือกห้องเรียน"
            required
            size="medium"
          />

          {/* Other form fields would go here */}
        </Stack>
      </form>
    </Paper>
  );
}

/**
 * Features Overview:
 *
 * ✅ Building/Floor Grouping
 *    - Rooms are automatically grouped by building and floor
 *    - Easy to find rooms in specific locations
 *
 * ✅ Case-Insensitive Search
 *    - Search by room name, building, or floor
 *    - Works in both Thai and English
 *
 * ✅ Visual Enhancements
 *    - Icons for better visual recognition
 *    - Building/floor metadata shown in options
 *    - Sticky group headers for easy navigation
 *
 * ✅ Accessibility
 *    - Keyboard navigation support
 *    - Screen reader friendly
 *    - Proper ARIA labels
 *
 * ✅ MUI Integration
 *    - Consistent with Material-UI design system
 *    - Responsive and mobile-friendly
 *    - Theme-aware styling
 *
 * ✅ Validation Support
 *    - Required field validation
 *    - Custom error messages
 *    - Helper text support
 *
 * Migration Guide:
 *
 * Old way (custom Dropdown):
 * ```tsx
 * <Dropdown
 *   data={rooms}
 *   currentValue={selectedRoom?.RoomName}
 *   handleChange={(value) => setRoom(value as room)}
 *   useSearchBar={true}
 * />
 * ```
 *
 * New way (RoomAutocomplete):
 * ```tsx
 * <RoomAutocomplete
 *   rooms={rooms}
 *   value={selectedRoom}
 *   onChange={setRoom}
 *   label="ห้องเรียน"
 * />
 * ```
 */
