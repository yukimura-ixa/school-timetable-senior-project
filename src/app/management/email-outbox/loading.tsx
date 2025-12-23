import { Box, Container, Skeleton } from "@mui/material";
import { TableSkeleton } from "@/components/feedback";

export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="text" width={250} height={60} />
        <Skeleton variant="text" width={400} height={24} />
      </Box>
      <TableSkeleton rows={10} />
    </Container>
  );
}
