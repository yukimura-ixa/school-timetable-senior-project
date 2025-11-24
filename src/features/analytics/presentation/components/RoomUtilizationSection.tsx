/**
 * RoomUtilizationSection Component
 * Displays room utilization analysis with occupancy data
 */

import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import type { RoomOccupancy } from "../../domain/types/analytics.types";

interface RoomUtilizationSectionProps {
  occupancy: RoomOccupancy[];
}

export function RoomUtilizationSection({
  occupancy,
}: RoomUtilizationSectionProps) {
  // Sort by occupancy rate descending
  const sortedOccupancy = [...occupancy].sort(
    (a, b) => b.occupancyRate - a.occupancyRate,
  );

  // Get utilization status color
  const getUtilizationColor = (
    rate: number,
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    if (rate >= 80) return "error"; // Over-utilized
    if (rate >= 60) return "success"; // Well-utilized
    if (rate >= 40) return "warning"; // Moderately-utilized
    if (rate >= 20) return "info"; // Lightly-utilized
    return "default"; // Rarely used
  };

  // Get utilization status label
  const getUtilizationLabel = (rate: number) => {
    if (rate >= 80) return "ใช้งานสูงมาก";
    if (rate >= 60) return "ใช้งานดี";
    if (rate >= 40) return "ใช้งานปานกลาง";
    if (rate >= 20) return "ใช้งานน้อย";
    return "ใช้งานน้อยมาก";
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        🏫 การใช้ห้องเรียน
      </Typography>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            สรุปการใช้งานห้องเรียน
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            แสดงอัตราการใช้งานห้องเรียนแต่ละห้อง เรียงจากมากไปน้อย
          </Typography>

          {/* Room List */}
          <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
            {sortedOccupancy.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                ไม่มีข้อมูลการใช้ห้องเรียน
              </Typography>
            ) : (
              sortedOccupancy.map((room) => (
                <Box
                  key={room.roomId}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {room.roomName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        อาคาร {room.building}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {room.occupancyRate.toFixed(1)}%
                      </Typography>
                      <Chip
                        label={getUtilizationLabel(room.occupancyRate)}
                        color={getUtilizationColor(room.occupancyRate)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Visual bar */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 8,
                      bgcolor: "grey.200",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${Math.min(room.occupancyRate, 100)}%`,
                        height: "100%",
                        bgcolor:
                          room.occupancyRate >= 80
                            ? "error.main"
                            : room.occupancyRate >= 60
                              ? "success.main"
                              : room.occupancyRate >= 40
                                ? "warning.main"
                                : "info.main",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>

                  {/* Day breakdown (optional - show if needed) */}
                  {room.dayOccupancy && room.dayOccupancy.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: "block" }}
                      >
                        การใช้งานแต่ละวัน:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {room.dayOccupancy.map((day) => {
                          const dayOccupiedCount = day.periods.filter(
                            (p) => p.isOccupied,
                          ).length;
                          const dayRate =
                            (dayOccupiedCount / day.periods.length) * 100;
                          return (
                            <Chip
                              key={day.day}
                              label={`${day.day}: ${dayRate.toFixed(0)}%`}
                              size="small"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
