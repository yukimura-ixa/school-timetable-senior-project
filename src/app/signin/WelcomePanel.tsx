"use client";

/**
 * WelcomePanel - Premium glassmorphism welcome section
 *
 * Features:
 * - Gradient backgrounds with decorative glow effects
 * - Animated floating icons
 * - Modern glassmorphism aesthetic
 */

import React from "react";
import { Box, Typography, Stack, alpha } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  colors,
  gradients,
  animations,
  keyframeAnimations,
  glowEffectSx,
  iconBoxSx,
} from "@/shared/design-system";

export default function WelcomePanel() {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: { xs: 300, md: 500 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        p: 5,
        background: `linear-gradient(135deg, ${colors.blue.dark} 0%, ${colors.violet.dark} 50%, ${colors.emerald.dark} 100%)`,
        boxShadow: `0 20px 60px ${alpha(colors.blue.dark, 0.4)}`,
      }}
    >
      {/* Decorative glow effects */}
      <Box
        sx={{
          ...glowEffectSx(gradients.blueViolet, "topRight", 250),
          opacity: 0.4,
          animation: animations.pulse,
        }}
        className="card-glow"
      />
      <Box
        sx={{
          ...glowEffectSx(gradients.emeraldCyan, "bottomLeft", 200),
          opacity: 0.3,
          animation: animations.pulse,
          animationDelay: "1s",
        }}
        className="card-glow"
      />

      {/* Floating icons decoration */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          position: "absolute",
          top: 24,
          right: 24,
          opacity: 0.3,
        }}
      >
        <Box
          sx={{
            animation: `${keyframeAnimations.float} 3s ease-in-out infinite`,
          }}
        >
          <CalendarMonthIcon sx={{ fontSize: 32, color: "white" }} />
        </Box>
        <Box
          sx={{
            animation: `${keyframeAnimations.float} 3s ease-in-out infinite 0.5s`,
          }}
        >
          <GroupsIcon sx={{ fontSize: 32, color: "white" }} />
        </Box>
      </Stack>

      {/* Main content */}
      <Stack spacing={4} sx={{ position: "relative", zIndex: 1 }}>
        {/* Logo/Icon */}
        <Box
          sx={{
            ...iconBoxSx(
              `linear-gradient(135deg, ${alpha("#fff", 0.3)} 0%, ${alpha("#fff", 0.1)} 100%)`,
              "#fff",
              "large",
            ),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha("#fff", 0.2)}`,
            animation: animations.float,
          }}
          className="card-icon"
        >
          <SchoolIcon sx={{ fontSize: 32, color: "white" }} />
        </Box>

        {/* Title */}
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.02em",
              mb: 1,
            }}
          >
            Phrasongsa
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              color: alpha("#fff", 0.9),
              mb: 2,
            }}
          >
            Timetable Management
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: alpha("#fff", 0.75),
              maxWidth: 360,
              lineHeight: 1.7,
            }}
          >
            ระบบจัดตารางเรียนตารางสอนอัจฉริยะสำหรับโรงเรียนมัธยมศึกษา
          </Typography>
        </Box>

        {/* Feature highlights */}
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {[
            "จัดตารางอัตโนมัติ ลดภาระงาน",
            "ตรวจสอบความขัดแย้งแบบ Real-time",
            "รองรับมาตรฐาน กระทรวงศึกษาธิการ",
          ].map((feature, index) => (
            <Stack
              key={index}
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                opacity: 0,
                animation: animations.fadeIn,
                animationDelay: `${0.3 + index * 0.15}s`,
                animationFillMode: "forwards",
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: colors.emerald.light,
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: alpha("#fff", 0.85), fontWeight: 500 }}
              >
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>

      {/* Bottom decoration */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: `linear-gradient(to top, ${alpha("#000", 0.15)} 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}
