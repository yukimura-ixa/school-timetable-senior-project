/**
 * MOE Validation Alert Component
 *
 * Displays validation results for Thai Ministry of Education curriculum standards
 * Shows success/warning/error state with detailed messages
 */

import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import type { MoeValidation } from "../hooks/useSubjectAssignment";

interface MOEValidationAlertProps {
  validation: MoeValidation | null;
  programName?: string;
}

/**
 * Renders MOE validation feedback with appropriate severity and icons
 */
export function MOEValidationAlert({
  validation,
  programName,
}: MOEValidationAlertProps) {
  if (!validation) return null;

  const severity = validation.isValid ? "success" : "warning";
  const icon = validation.isValid ? <CheckCircleIcon /> : <WarningIcon />;

  const hasErrors = validation.errors && validation.errors.length > 0;
  const hasWarnings = validation.warnings && validation.warnings.length > 0;

  return (
    <Box sx={{ mt: 3 }}>
      <Alert
        severity={severity}
        icon={icon}
        sx={{
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          {validation.isValid
            ? "✓ ผ่านมาตรฐาน กระทรวงศึกษาธิการ"
            : "⚠ ไม่ผ่านมาตรฐาน กระทรวงศึกษาธิการ"}
        </AlertTitle>

        {programName && (
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            หลักสูตร: {programName}
          </Typography>
        )}

        {validation.isValid && (
          <Typography variant="body2">
            หลักสูตรนี้เป็นไปตามมาตรฐานของกระทรวงศึกษาธิการ พร้อมใช้งาน
          </Typography>
        )}

        {/* Error Messages */}
        {hasErrors && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
            >
              <ErrorIcon fontSize="small" color="error" />
              ข้อผิดพลาด:
            </Typography>
            <List dense sx={{ pl: 2 }}>
              {validation.errors!.map((err, idx) => (
                <ListItem
                  key={idx}
                  sx={{ py: 0.5, display: "list-item", listStyleType: "disc" }}
                >
                  <ListItemText
                    primary={err}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color: "error.main",
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Warning Messages */}
        {hasWarnings && (
          <Box sx={{ mt: hasErrors ? 2 : 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
            >
              <WarningIcon fontSize="small" color="warning" />
              คำเตือน:
            </Typography>
            <List dense sx={{ pl: 2 }}>
              {validation.warnings!.map((warn, idx) => (
                <ListItem
                  key={idx}
                  sx={{ py: 0.5, display: "list-item", listStyleType: "disc" }}
                >
                  <ListItemText
                    primary={warn}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color: "warning.main",
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Alert>
    </Box>
  );
}
