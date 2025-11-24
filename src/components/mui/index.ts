/**
 * MUI Components - Index
 *
 * This file re-exports all MUI-based components for easy importing.
 *
 * Usage:
 * import { PrimaryButton, TextField, SearchBar } from '@/components/mui';
 *
 * OR import individually:
 * import PrimaryButton from '@/components/mui/PrimaryButton';
 */

// Buttons
export { default as PrimaryButton } from "./PrimaryButton";

// Form Controls
export { default as TextField } from "./TextField";
export { default as SearchBar } from "./SearchBar";
export { default as CheckBox } from "./CheckBox";

// Feedback
export { default as ErrorState } from "./ErrorState";

// Re-export MUI components for convenience
export {
  Button,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Skeleton,
  type ButtonProps,
} from "@mui/material";

export {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
