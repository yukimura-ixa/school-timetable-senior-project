"use client";

import React, { useState, useTransition, useCallback } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getPublishReadinessAction } from "@/features/config/application/actions/config-lifecycle.actions";
import type { PublishReadinessResult } from "@/features/config/domain/types/publish-readiness-types";
import { PublishConfirmDialog } from "./PublishConfirmDialog";

type Props = {
  configId: string;
  onStatusChange?: () => void;
};

export function PublishReadinessCard({ configId, onStatusChange }: Props) {
  const [readiness, setReadiness] = useState<PublishReadinessResult | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchReadiness = useCallback(() => {
    setFetchError(false);
    startTransition(async () => {
      try {
        const result = await getPublishReadinessAction({ configId });
        if (result.success && result.data) {
          setReadiness(result.data);
        } else {
          setFetchError(true);
        }
      } catch {
        setFetchError(true);
      }
    });
  }, [configId]);

  React.useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  const issueCount = readiness?.issues.length ?? 0;
  const isReady = readiness?.status === "ready";

  const renderChip = () => {
    if (isPending) {
      return <CircularProgress size={16} />;
    }
    if (fetchError) {
      return (
        <Chip
          data-testid="readiness-chip"
          label="โหลดไม่สำเร็จ"
          color="default"
          size="small"
          icon={<ErrorIcon />}
        />
      );
    }
    if (!readiness) return <CircularProgress size={16} />;
    return (
      <Chip
        data-testid="readiness-chip"
        label={isReady ? "พร้อมเผยแพร่" : `มีปัญหา ${issueCount} รายการ`}
        color={isReady ? "success" : "warning"}
        size="small"
        icon={isReady ? <CheckCircleIcon /> : <ErrorIcon />}
      />
    );
  };

  return (
    <>
      <Accordion defaultExpanded={false} disableGutters>
        <AccordionSummary
          data-testid="readiness-accordion-summary"
          expandIcon={<ExpandMoreIcon />}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" fontWeight={500}>
              ความพร้อมในการเผยแพร่
            </Typography>
            {renderChip()}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {fetchError ? (
            <Box
              data-testid="readiness-error"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Typography variant="body2" color="error">
                ไม่สามารถโหลดข้อมูลได้
              </Typography>
              <Button
                data-testid="retry-btn"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchReadiness}
                disabled={isPending}
              >
                ลองใหม่
              </Button>
            </Box>
          ) : (
            <>
              <List dense disablePadding>
                <ListItem
                  data-testid="checklist-grades"
                  disablePadding
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {readiness?.details.incompleteGrades.length === 0 ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <ErrorIcon color="warning" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="ชั้นเรียนครบทุกคาบ"
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>

                {readiness?.details.incompleteGrades.map((g) => (
                  <ListItem key={g.gradeName} disablePadding sx={{ pl: 4, py: 0.25 }}>
                    <ListItemText
                      primary={`${g.gradeName}: ${g.scheduledHours}/${g.requiredHours} คาบ`}
                      primaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                    />
                  </ListItem>
                ))}

                <ListItem
                  data-testid="checklist-moe"
                  disablePadding
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {readiness?.details.moeValidationResults.every((r) => r.isValid) ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <ErrorIcon color="warning" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="หลักสูตรผ่าน MoE"
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  data-testid="open-publish-dialog-btn"
                  variant="contained"
                  size="small"
                  disabled={!readiness}
                  onClick={() => setDialogOpen(true)}
                >
                  เผยแพร่
                </Button>
              </Box>
            </>
          )}
        </AccordionDetails>
      </Accordion>

      {readiness && (
        <PublishConfirmDialog
          open={dialogOpen}
          configId={configId}
          readinessResult={readiness}
          onClose={() => setDialogOpen(false)}
          onStatusChange={() => {
            onStatusChange?.();
            fetchReadiness();
          }}
        />
      )}
    </>
  );
}
