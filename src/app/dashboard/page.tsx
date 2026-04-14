"use client";

/**
 * Select Semester Page - Redesigned
 * Modern card-based layout with filters and quick actions
 */

import React, { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { SemesterCard } from "./_components/SemesterCard";
import { SemesterFilters } from "./_components/SemesterFilters";
import { SemesterExportButton } from "./_components/SemesterExportButton";
import { SemesterSectionSkeleton } from "./_components/SemesterSectionSkeleton";
import { SemesterFiltersSkeleton } from "./_components/SemesterFiltersSkeleton";
import { SemesterAnalyticsDashboardSkeleton } from "./_components/SemesterAnalyticsDashboardSkeleton";
import { SkipLink } from "@/components/elements/SkipLink";
import {
  getSemestersAction,
  getRecentSemestersAction,
  getPinnedSemestersAction,
  trackSemesterAccessAction,
} from "@/features/semester/application/actions/semester.actions";
import type {
  SemesterDTO,
  SemesterFilterSchema,
} from "@/features/semester/application/schemas/semester.schemas";
import type { InferOutput } from "valibot";

const SemesterAnalyticsDashboard = dynamic(
  () =>
    import("./_components/SemesterAnalyticsDashboard").then(
      (mod) => mod.SemesterAnalyticsDashboard,
    ),
  {
    loading: () => <SemesterAnalyticsDashboardSkeleton />,
  },
);

const CreateSemesterWizard = dynamic(
  () =>
    import("./_components/CreateSemesterWizard").then(
      (mod) => mod.CreateSemesterWizard,
    ),
);

const CopySemesterModal = dynamic(
  () =>
    import("./_components/CopySemesterModal").then(
      (mod) => mod.CopySemesterModal,
    ),
);

export default function SelectSemesterPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isHydrated, setIsHydrated] = useState(false);
  const isAdmin =
    isHydrated && isAdminRole(normalizeAppRole(session?.user?.role));

  // State
  const [recentSemesters, setRecentSemesters] = useState<SemesterDTO[]>([]);
  const [pinnedSemesters, setPinnedSemesters] = useState<SemesterDTO[]>([]);
  const [allSemesters, setAllSemesters] = useState<SemesterDTO[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<
    InferOutput<typeof SemesterFilterSchema>
  >({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedForCopy, setSelectedForCopy] = useState<SemesterDTO | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recentResult, pinnedResult, allResult] = await Promise.all([
        getRecentSemestersAction({ limit: 5 }),
        getPinnedSemestersAction({}),
        getSemestersAction(filters),
      ]);

      if (recentResult.success && recentResult.data) {
        setRecentSemesters(recentResult.data);
      }
      if (pinnedResult.success && pinnedResult.data) {
        setPinnedSemesters(pinnedResult.data);
      }
      if (allResult.success && allResult.data) {
        setAllSemesters(allResult.data);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load initial data
  useEffect(() => {
    setIsHydrated(true);
    void loadData();
  }, [loadData]);

  const handleSelectSemester = async (semester: SemesterDTO) => {
    // Navigate first for instant UX, track access in the background.
    router.push(
      `/dashboard/${semester.academicYear}/${semester.semester}/student-table`,
    );
    void trackSemesterAccessAction({ configId: semester.configId }).catch(
      () => undefined,
    );
  };

  const handleCopyClick = (semester: SemesterDTO) => {
    setSelectedForCopy(semester);
    setCopyModalOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <SkipLink />
      {/* Header */}
      <Box
        id="main-content"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          เลือกปีการศึกษาและภาคเรียน
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {isAdmin && <SemesterExportButton semesters={allSemesters} />}
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
            >
              สร้างภาคเรียนใหม่
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Analytics Dashboard */}
      {allSemesters.length > 0 && (
        <Box sx={{ mb: 4 }} data-testid="analytics-dashboard">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              📊 แดชบอร์ดวิเคราะห์
            </Typography>
            <IconButton
              onClick={() => setShowAnalytics(!showAnalytics)}
              size="small"
              sx={{
                bgcolor: showAnalytics ? "primary.50" : "grey.100",
                "&:hover": {
                  bgcolor: showAnalytics ? "primary.100" : "grey.200",
                },
              }}
            >
              {showAnalytics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={showAnalytics}>
            {loading ? (
              <SemesterAnalyticsDashboardSkeleton />
            ) : (
              <SemesterAnalyticsDashboard semesters={allSemesters} />
            )}
          </Collapse>
        </Box>
      )}

      {/* Recent Semesters Section */}
      {loading ? (
        <SemesterSectionSkeleton title="ล่าสุด" count={3} />
      ) : (
        recentSemesters.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              ล่าสุด
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {recentSemesters.map((semester) => (
                <Box
                  key={semester.configId}
                  sx={{ flex: "1 1 300px", maxWidth: 400 }}
                >
                  <SemesterCard
                    semester={semester}
                    onSelect={(s) => {
                      void handleSelectSemester(s);
                    }}
                    onCopy={handleCopyClick}
                    onUpdate={() => {
                      void loadData();
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )
      )}

      {/* Pinned Semesters Section */}
      {loading ? (
        <SemesterSectionSkeleton title="ปักหมุด" count={2} />
      ) : (
        pinnedSemesters.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              ปักหมุด
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {pinnedSemesters.map((semester) => (
                <Box
                  key={semester.configId}
                  sx={{ flex: "1 1 300px", maxWidth: 400 }}
                >
                  <SemesterCard
                    semester={semester}
                    onSelect={(s) => {
                      void handleSelectSemester(s);
                    }}
                    onCopy={handleCopyClick}
                    onUpdate={() => {
                      void loadData();
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )
      )}

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        {loading ? (
          <SemesterFiltersSkeleton />
        ) : (
          <SemesterFilters filters={filters} onFiltersChange={setFilters} />
        )}
      </Box>

      {/* All Semesters Grid */}
      {loading ? (
        <SemesterSectionSkeleton showTitle={false} count={6} />
      ) : allSemesters.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            ไม่พบภาคเรียน
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{ mt: 2 }}
          >
            สร้างภาคเรียนใหม่
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {allSemesters.map((semester) => (
            <Box
              key={semester.configId}
              sx={{ flex: "1 1 300px", maxWidth: 400 }}
            >
              <SemesterCard
                semester={semester}
                onSelect={(s) => {
                  void handleSelectSemester(s);
                }}
                onCopy={handleCopyClick}
                onUpdate={() => {
                  void loadData();
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Modals */}
      <CreateSemesterWizard
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newSemester) => {
          void loadData();
          void handleSelectSemester(newSemester);
        }}
      />

      <CopySemesterModal
        open={copyModalOpen}
        onClose={() => {
          setCopyModalOpen(false);
          setSelectedForCopy(null);
        }}
        sourceSemester={selectedForCopy}
        onSuccess={(newSemester) => {
          void loadData();
          void handleSelectSemester(newSemester);
        }}
      />
    </Container>
  );
}
