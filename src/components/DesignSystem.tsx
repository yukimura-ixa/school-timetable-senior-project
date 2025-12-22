"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
} from "@mui/material";

// Import from the unified design system
import {
  colors,
  gradients,
  animations,
  glassCardSx,
  iconBoxSx,
  statBadgeSx,
} from "@/shared/design-system";

/**
 * DesignSystem Component
 *
 * A reference documentation for the project's premium design system.
 * This component demonstrates how MUI and Tailwind share the same design tokens.
 *
 * Usage: Import and place it in a developer-only route to verify styles.
 */
const DesignSystem: React.FC = () => {
  return (
    <Box sx={{ p: 4, bgcolor: "background.default", minHeight: "100vh" }}>
      <Typography variant="h1" gutterBottom sx={{ mb: 4 }}>
        PT Design System v2.0
      </Typography>

      {/* Typography Section */}
      <section className="mb-12">
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 800 }}
        >
          Typography (Inter + Sarabun)
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={2}>
          <Typography variant="h1">Heading 1 - PT Phrasongsa</Typography>
          <Typography variant="h2">Heading 2 - ระบบจัดตารางเรียน</Typography>
          <Typography variant="h3">Heading 3 - Dashboard Overview</Typography>
          <Typography variant="h4">Heading 4 - Management Settings</Typography>
          <Typography variant="h5">Heading 5 - Teacher Schedule</Typography>
          <Typography variant="body1">
            Body 1 - The quick brown fox jumps over the lazy dog.
            ภาษาไทยที่สวยงามในระบบ.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Body 2 - Secondary text for descriptions and metadata.
          </Typography>
        </Stack>
      </section>

      {/* Colors & Gradients */}
      <section className="mb-12">
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 800 }}
        >
          Colors & Gradients
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box className="bg-ds-gradient-primary h-24 rounded-2xl flex items-end p-3">
              <span className="text-white font-bold">DS Primary</span>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box className="bg-ds-gradient-ocean h-24 rounded-2xl flex items-end p-3">
              <span className="text-white font-bold">DS Ocean</span>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box className="bg-ds-gradient-sunset h-24 rounded-2xl flex items-end p-3">
              <span className="text-white font-bold">DS Sunset</span>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box className="bg-ds-gradient-surface border border-white/40 h-24 rounded-2xl flex items-end p-3">
              <span className="text-slate-900 font-bold">DS Surface</span>
            </Box>
          </Grid>
        </Grid>
      </section>

      {/* MUI Token Showcase (from design-system.ts) */}
      <section className="mb-12">
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 800 }}
        >
          MUI Token Showcase (design-system.ts)
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 2 }}>
            <Box
              sx={{
                bgcolor: colors.blue.main,
                height: 64,
                borderRadius: 2,
                display: "flex",
                alignItems: "end",
                p: 1,
              }}
            >
              <Typography variant="caption" color="white" fontWeight={700}>
                blue.main
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box
              sx={{
                bgcolor: colors.emerald.main,
                height: 64,
                borderRadius: 2,
                display: "flex",
                alignItems: "end",
                p: 1,
              }}
            >
              <Typography variant="caption" color="white" fontWeight={700}>
                emerald.main
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box
              sx={{
                bgcolor: colors.violet.main,
                height: 64,
                borderRadius: 2,
                display: "flex",
                alignItems: "end",
                p: 1,
              }}
            >
              <Typography variant="caption" color="white" fontWeight={700}>
                violet.main
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box
              sx={{
                bgcolor: colors.amber.main,
                height: 64,
                borderRadius: 2,
                display: "flex",
                alignItems: "end",
                p: 1,
              }}
            >
              <Typography variant="caption" color="white" fontWeight={700}>
                amber.main
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box
              sx={{
                bgcolor: colors.red.main,
                height: 64,
                borderRadius: 2,
                display: "flex",
                alignItems: "end",
                p: 1,
              }}
            >
              <Typography variant="caption" color="white" fontWeight={700}>
                red.main
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Box
              sx={{
                bgcolor: colors.cyan.main,
                height: 64,
                borderRadius: 2,
                display: "flex",
                alignItems: "end",
                p: 1,
              }}
            >
              <Typography variant="caption" color="white" fontWeight={700}>
                cyan.main
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </section>

      {/* Glassmorphism Section */}
      <section className="mb-12">
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 800 }}
        >
          Glassmorphism Base
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box
          sx={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000')",
            backgroundSize: "cover",
            p: 6,
            borderRadius: 6,
            display: "flex",
            gap: 4,
          }}
        >
          <Paper elevation={1} sx={{ p: 4, width: 300 }}>
            <Typography variant="h6" gutterBottom>
              Glass Base (MUI)
            </Typography>
            <Typography variant="body2">
              Default Elevation 1 in the new theme automatically applies
              glassmorphism.
            </Typography>
          </Paper>

          <div className="glass-card p-8 w-80 rounded-3xl">
            <Typography variant="h6" color="primary" gutterBottom>
              Glass Card (CSS)
            </Typography>
            <Typography variant="body2">
              Using .glass-card utility class for deep blur and subtle borders.
            </Typography>
            <Button variant="contained" sx={{ mt: 3 }} fullWidth>
              Action Button
            </Button>
          </div>
        </Box>
      </section>

      {/* Components Section */}
      <section className="mb-12">
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 800 }}
        >
          Modernized Components
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Button variant="contained" color="primary">
            Primary Pill
          </Button>
          <Button variant="outlined" color="primary">
            Outlined Pill
          </Button>
          <Button variant="text" color="primary">
            Text Button
          </Button>
          <Button variant="contained" sx={{ bgcolor: "warning.main" }}>
            Custom Color
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Chip label="Active" color="primary" variant="filled" />
          <Chip label="Draft" color="default" variant="outlined" />
          <Chip label="Conflict" color="error" variant="filled" />
          <Chip
            label="Beta"
            sx={{ bgcolor: "info.light", color: "info.dark" }}
          />
        </Stack>
      </section>

      {/* Data Cards */}
      <section>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 800 }}
        >
          Surface Units
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={4} key={i}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.primary">
                    Card Item {i}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Standardized card with soft shadows and refined borders.
                  </Typography>
                  <Box
                    sx={{ mt: 2, p: 2, bgcolor: "slate.100", borderRadius: 2 }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      INNER METRIC
                    </Typography>
                    <Typography variant="h4">85%</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </section>
    </Box>
  );
};

export default DesignSystem;
