"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { formatBangkokDateTime } from "@/utils/datetime";

export type EmailOutboxRow = {
  id: string;
  kind: string;
  status: string;
  toEmail: string;
  subject: string;
  verificationUrl: string;
  providerMessageId: string | null;
  lastError: string | null;
  createdAt: string;
  expiresAt: string;
};

function statusColor(status: string) {
  switch (status) {
    case "SENT":
      return "success" as const;
    case "FAILED":
      return "error" as const;
    case "SKIPPED":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export default function EmailOutboxTable({ rows }: { rows: EmailOutboxRow[] }) {
  const [q, setQ] = useState("");
  const [snack, setSnack] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (r) =>
        r.toEmail.toLowerCase().includes(query) ||
        r.subject.toLowerCase().includes(query) ||
        r.status.toLowerCase().includes(query) ||
        r.kind.toLowerCase().includes(query),
    );
  }, [q, rows]);

  return (
    <Stack spacing={2}>
      {snack && (
        <Alert severity="success" onClose={() => setSnack(null)}>
          {snack}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="toEmail / subject / status / kind"
            fullWidth
          />
          <Button variant="outlined" onClick={() => setQ("")}>
            Clear
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Kind</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ py: 4 }}>
                    <Typography color="text.secondary" align="center">
                      No rows
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatBangkokDateTime(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={statusColor(r.status)}
                      label={r.status}
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{r.kind}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{r.toEmail}</TableCell>
                  <TableCell sx={{ minWidth: 240 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{r.subject}</Typography>
                      {r.lastError && (
                        <Typography variant="caption" color="error">
                          {r.lastError}
                        </Typography>
                      )}
                      {r.providerMessageId && (
                        <Typography variant="caption" color="text.secondary">
                          messageId: {r.providerMessageId}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatBangkokDateTime(r.expiresAt)}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={async () => {
                          await navigator.clipboard.writeText(r.verificationUrl);
                          setSnack("Copied verification link");
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          window.open(r.verificationUrl, "_blank", "noopener,noreferrer");
                        }}
                      >
                        Open
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
