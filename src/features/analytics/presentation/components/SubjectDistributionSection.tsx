/**
 * Subject Distribution Section Component
 * Analytics Dashboard - Phase 2
 *
 * Displays subject distribution by category (CORE, ADDITIONAL, ACTIVITY)
 * Shows statistics for each category with visual representation
 */

import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import {
  MenuBook as BookIcon,
  School as SchoolIcon,
  EmojiEvents as ActivityIcon,
} from "@mui/icons-material";
import type { SubjectDistribution } from "@/features/analytics/domain/types/analytics.types";

interface SubjectDistributionSectionProps {
  distribution: SubjectDistribution[];
}

export function SubjectDistributionSection({
  distribution,
}: SubjectDistributionSectionProps) {
  // Sort by hours (descending)
  const sortedDistribution = [...distribution].sort(
    (a, b) => b.totalHours - a.totalHours,
  );

  // Calculate total hours for percentage calculation
  const totalHours = distribution.reduce(
    (sum, item) => sum + item.totalHours,
    0,
  );

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "CORE":
        return <SchoolIcon />;
      case "ADDITIONAL":
        return <BookIcon />;
      case "ACTIVITY":
        return <ActivityIcon />;
      default:
        return <BookIcon />;
    }
  };

  // Get color for category
  const getCategoryColor = (
    color: string,
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    // Map hex colors to MUI chip colors
    if (color.includes("3b82f6")) return "primary"; // Blue
    if (color.includes("10b981")) return "success"; // Green
    if (color.includes("f59e0b")) return "warning"; // Orange
    return "default";
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Header */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 600, mb: 3 }}
      >
        📚 การกระจายวิชาตามประเภท
      </Typography>
      {sortedDistribution.length === 0 ? (
        <Card>
          <CardContent>
            <Typography
              variant="body1"
              align="center"
              sx={{
                color: "text.secondary",
              }}
            >
              ไม่มีข้อมูลการกระจายวิชา
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {/* Category Cards Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
              mb: 4,
            }}
          >
            {sortedDistribution.map((item) => (
              <Card
                key={item.category}
                sx={{
                  borderLeft: 4,
                  borderColor: item.color,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent>
                  {/* Category Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: `${item.color}20`,
                        color: item.color,
                      }}
                    >
                      {getCategoryIcon(item.category)}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: 600 }}
                    >
                      {item.categoryLabel}
                    </Typography>
                  </Box>

                  {/* Statistics */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ fontWeight: 700, color: item.color }}
                    >
                      {item.totalHours}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      ชั่วโมงทั้งหมด
                    </Typography>
                  </Box>

                  {/* Percentage and Subject Count */}
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={`${item.percentage.toFixed(1)}%`}
                      color={getCategoryColor(item.color)}
                      size="small"
                    />
                    <Chip
                      label={`${item.subjectCount} วิชา`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {/* Visual Progress Bar */}
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        height: 8,
                        bgcolor: "grey.200",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${item.percentage}%`,
                          bgcolor: item.color,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {item.percentage.toFixed(1)}% ของชั่วโมงทั้งหมด
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Summary Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                สรุปภาพรวม
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    ชั่วโมงทั้งหมด
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {totalHours} ชม.
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    จำนวนประเภท
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {distribution.length} ประเภท
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    วิชาทั้งหมด
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {distribution.reduce(
                      (sum, item) => sum + item.subjectCount,
                      0,
                    )}{" "}
                    วิชา
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
