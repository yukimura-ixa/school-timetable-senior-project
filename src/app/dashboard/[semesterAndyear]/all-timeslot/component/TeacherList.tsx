"use client";
import type { teacher } from "@/prisma/generated/client";
import React from "react";
import { Box, Typography, Stack, alpha, useTheme } from "@mui/material";
import { colors } from "@/shared/design-system";

type Props = {
  teachers: teacher[];
};

const TeacherList = (props: Props) => {
  const theme = useTheme();

  return (
    <Stack
      spacing={0.5}
      sx={{ h: "fit-content", selectNone: "none", mr: 1, minWidth: 260 }}
    >
      {/* Header */}
      <Stack direction="row" spacing={0.5} sx={{ height: 64 }}>
        <Box
          sx={{
            width: 48,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            bgcolor: alpha(theme.palette.action.selected, 0.3),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="caption"
            fontWeight="bold"
            color="text.secondary"
          >
            ลำดับ
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            bgcolor: alpha(theme.palette.action.selected, 0.3),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="caption"
            fontWeight="bold"
            color="text.secondary"
          >
            ชื่อครูผู้สอน
          </Typography>
        </Box>
      </Stack>

      {/* Body */}
      {props.teachers.map((item, index) => (
        <Stack
          key={item.TeacherID}
          direction="row"
          spacing={0.5}
          sx={{
            height: 60,
            py: 0.5,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: alpha(colors.emerald.main, 0.04),
            },
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            }}
          >
            <Typography
              variant="caption"
              fontWeight="medium"
              color="text.secondary"
            >
              {index + 1}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              height: 60,
              display: "flex",
              alignItems: "center",
              px: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            }}
          >
            <Typography
              variant="body2"
              fontWeight="medium"
              sx={{
                color: "text.primary",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.Prefix}
              {item.Firstname} {item.Lastname}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
};

export default TeacherList;
