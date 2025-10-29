"use client";

/**
 * Select Semester Page - Redesigned
 * Modern card-based layout with filters and quick actions
 */

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
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
import { CreateSemesterWizard } from "./_components/CreateSemesterWizard";
import { CopySemesterModal } from "./_components/CopySemesterModal";
import { SemesterExportButton } from "./_components/SemesterExportButton";
import { SemesterSectionSkeleton } from "./_components/SemesterSectionSkeleton";
import { SemesterFiltersSkeleton } from "./_components/SemesterFiltersSkeleton";
import { SelectSemesterPageSkeleton } from "./_components/SelectSemesterPageSkeleton";
import { SemesterAnalyticsDashboard } from "./_components/SemesterAnalyticsDashboard";
import { SemesterAnalyticsDashboardSkeleton } from "./_components/SemesterAnalyticsDashboardSkeleton";
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

export default function SelectSemesterPage() {
  const router = useRouter();

  // State
  const [recentSemesters, setRecentSemesters] = useState<SemesterDTO[]>([]);
  const [pinnedSemesters, setPinnedSemesters] = useState<SemesterDTO[]>([]);
  const [allSemesters, setAllSemesters] = useState<SemesterDTO[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InferOutput<typeof SemesterFilterSchema>>({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedForCopy, setSelectedForCopy] = useState<SemesterDTO | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recentResult, pinnedResult, allResult] = await Promise.all([
        getRecentSemestersAction(5),
        getPinnedSemestersAction(),
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
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSemester = async (semester: SemesterDTO) => {
    // Track access
    await trackSemesterAccessAction({ configId: semester.configId });
    
    // Navigate to student table
    router.push(`/dashboard/${semester.semester}-${semester.academicYear}/student-table`);
  };

  const handleCopyClick = (semester: SemesterDTO) => {
    setSelectedForCopy(semester);
    setCopyModalOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          เลือกปีการศึกษาและภาคเรียน
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <SemesterExportButton semesters={allSemesters} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            สร้างภาคเรียนใหม่
          </Button>
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
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              📊 แดชบอร์ดวิเคราะห์
            </Typography>
            <IconButton
              onClick={() => setShowAnalytics(!showAnalytics)}
              size="small"
              sx={{ 
                bgcolor: showAnalytics ? "primary.50" : "grey.100",
                "&:hover": { bgcolor: showAnalytics ? "primary.100" : "grey.200" }
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
      ) : recentSemesters.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            ล่าสุด
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {recentSemesters.map((semester) => (
              <Box key={semester.configId} sx={{ flex: '1 1 300px', maxWidth: 400 }}>
                <SemesterCard
                  semester={semester}
                  onSelect={handleSelectSemester}
                  onCopy={handleCopyClick}
                  onUpdate={loadData}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Pinned Semesters Section */}
      {loading ? (
        <SemesterSectionSkeleton title="ปักหมุด" count={2} />
      ) : pinnedSemesters.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            ปักหมุด
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {pinnedSemesters.map((semester) => (
              <Box key={semester.configId} sx={{ flex: '1 1 300px', maxWidth: 400 }}>
                <SemesterCard
                  semester={semester}
                  onSelect={handleSelectSemester}
                  onCopy={handleCopyClick}
                  onUpdate={loadData}
                />
              </Box>
            ))}
          </Box>
        </Box>
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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {allSemesters.map((semester) => (
            <Box key={semester.configId} sx={{ flex: '1 1 300px', maxWidth: 400 }}>
              <SemesterCard
                semester={semester}
                onSelect={handleSelectSemester}
                onCopy={handleCopyClick}
                onUpdate={loadData}
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
          loadData();
          handleSelectSemester(newSemester);
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
          loadData();
          handleSelectSemester(newSemester);
        }}
      />
    </Container>
  );
}