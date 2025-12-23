"use client";

/**
 * SignInPageClient - Client Component
 *
 * Renders the premium signin UI with:
 * - Gradient mesh background
 * - Split layout: Welcome panel + Sign-in form
 * - All MUI and design system features
 */

import { Box, Stack, Container, alpha } from "@mui/material";
import WelcomePanel from "./WelcomePanel";
import SignInForm from "./SignInForm";
import { colors } from "@/shared/design-system";

export default function SignInPageClient() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        // Gradient mesh background
        background: `
          radial-gradient(circle at 20% 20%, ${alpha(colors.blue.main, 0.08)} 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, ${alpha(colors.violet.main, 0.06)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha(colors.emerald.main, 0.04)} 0%, transparent 50%),
          linear-gradient(180deg, ${colors.slate[50]} 0%, ${colors.slate[100]} 100%)
        `,
        py: 4,
      }}
    >
      {/* Decorative grid pattern */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${alpha(colors.slate[300], 0.3)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(colors.slate[300], 0.3)} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 4 }}
          sx={{
            width: "100%",
            alignItems: "stretch",
            minHeight: { md: 560 },
          }}
        >
          <Box sx={{ flex: 1, display: "flex" }}>
            <WelcomePanel />
          </Box>
          <Box sx={{ flex: 1, display: "flex" }}>
            <SignInForm />
          </Box>
        </Stack>
      </Container>

      {/* Bottom gradient fade */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: `linear-gradient(to top, ${alpha(colors.slate[200], 0.5)} 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}
