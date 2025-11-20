/**
 * Presentation Layer: Room Selection Dialog Component
 * 
 * MUI v7 Dialog for selecting room when assigning subject to timeslot.
 * Replaces legacy modal with modern design.
 * 
 * @module RoomSelectionDialog
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Radio,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  MeetingRoom as RoomIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { room } from '@/prisma/generated/client';

interface RoomSelectionDialogProps {
  /** Dialog open state */
  open: boolean;
  
  /** Available rooms */
  rooms: room[];
  
  /** Subject being assigned */
  subjectName?: string;
  
  /** Timeslot being assigned to */
  timeslotLabel?: string;
  
  /** Handler for room selection */
  onSelect: (room: room) => void | Promise<void>;
  
  /** Handler for cancel */
  onCancel: () => void;
  
  /** Currently occupied rooms (conflicts) */
  occupiedRoomIDs?: number[];
}

/**
 * Room selection dialog component
 */
export function RoomSelectionDialog({
  open,
  rooms,
  subjectName,
  timeslotLabel,
  onSelect,
  onCancel,
  occupiedRoomIDs = [],
}: RoomSelectionDialogProps) {
  const [selectedRoom, setSelectedRoom] = useState<room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter rooms by search
  const filteredRooms = React.useMemo(() => {
    if (!searchQuery) return rooms;
    
    const query = searchQuery.toLowerCase();
    return rooms.filter(
      room =>
        room.RoomName.toLowerCase().includes(query) ||
        room.Building?.toLowerCase().includes(query) ||
        room.Floor?.toLowerCase().includes(query)
    );
  }, [rooms, searchQuery]);

  // Group rooms by building
  const roomsByBuilding = React.useMemo(() => {
    const groups: Record<string, typeof rooms> = {};
    filteredRooms.forEach(room => {
      const building = room.Building || 'ไม่ระบุอาคาร';
      if (!groups[building]) {
        groups[building] = [];
      }
      groups[building].push(room);
    });
    return groups;
  }, [filteredRooms]);

  const handleConfirm = () => {
    if (selectedRoom) {
      void onSelect(selectedRoom); // Explicitly mark as fire-and-forget
      setSelectedRoom(null);
      setSearchQuery('');
    }
  };

  const handleCancel = () => {
    onCancel();
    setSelectedRoom(null);
    setSearchQuery('');
  };

  const isRoomOccupied = (roomID: number) => {
    return occupiedRoomIDs.includes(roomID);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <RoomIcon color="primary" />
          <Typography variant="h6" component="span">
            เลือกห้องเรียน
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Assignment Info */}
          {(subjectName || timeslotLabel) && (
            <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Stack spacing={0.5}>
                {subjectName && (
                  <Typography variant="body2">
                    <strong>วิชา:</strong> {subjectName}
                  </Typography>
                )}
                {timeslotLabel && (
                  <Typography variant="body2">
                    <strong>คาบ:</strong> {timeslotLabel}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="ค้นหาห้อง, อาคาร, ชั้น..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Room List */}
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {Object.keys(roomsByBuilding).length === 0 ? (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                ไม่พบห้องที่ตรงกับเงื่อนไข
              </Typography>
            ) : (
              <Stack spacing={2}>
                {Object.entries(roomsByBuilding).map(([building, buildingRooms]) => (
                  <Box key={building}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {building}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <List dense disablePadding>
                      {buildingRooms.map(room => {
                        const isOccupied = isRoomOccupied(room.RoomID);
                        const isSelected = selectedRoom?.RoomID === room.RoomID;
                        
                        return (
                          <ListItem
                            key={room.RoomID}
                            disablePadding
                            secondaryAction={
                              isOccupied && (
                                <Chip
                                  label="ห้องไม่ว่าง"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )
                            }
                          >
                            <ListItemButton
                              selected={isSelected}
                              onClick={() => setSelectedRoom(room)}
                              disabled={isOccupied}
                            >
                              <ListItemIcon>
                                <Radio
                                  checked={isSelected}
                                  disabled={isOccupied}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={room.RoomName}
                                secondary={
                                  <Stack direction="row" spacing={0.5} component="span">
                                    {room.Floor && (
                                      <Chip
                                        label={`ชั้น ${room.Floor}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 18, fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Stack>
                                }
                                primaryTypographyProps={{
                                  fontWeight: isSelected ? 'bold' : 'normal',
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleCancel}
          startIcon={<CloseIcon />}
          color="inherit"
        >
          ยกเลิก
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedRoom}
        >
          ยืนยัน
        </Button>
      </DialogActions>
    </Dialog>
  );
}
