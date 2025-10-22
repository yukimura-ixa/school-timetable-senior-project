/**
 * Empty State Components
 * 
 * User-friendly messages when no data is available.
 * Guides users to next actions.
 * 
 * Created: October 22, 2025
 * Priority: P1 - Critical UX
 */

import { Box, Typography, Button, Stack } from '@mui/material';
import {
  CalendarToday,
  PersonAdd,
  Class,
  Assignment,
  Search,
  FolderOpen,
  EventBusy,
  SchoolOutlined,
} from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

/**
 * Generic empty state component
 * 
 * @example
 * <EmptyState
 *   icon={<CalendarToday />}
 *   title="ยังไม่มีตารางเรียน"
 *   description="เริ่มสร้างตารางเรียนใหม่สำหรับภาคเรียนนี้"
 *   actionLabel="สร้างตารางเรียน"
 *   onAction={handleCreate}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, sm: 8, md: 10 },
        px: 3,
        textAlign: 'center',
        minHeight: 300,
      }}
    >
      {icon && (
        <Box
          sx={{
            fontSize: { xs: 48, sm: 64 },
            color: 'text.disabled',
            mb: 2,
            opacity: 0.6,
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        variant="h5"
        color="text.primary"
        gutterBottom
        sx={{ fontWeight: 600, mb: 1 }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 480, lineHeight: 1.7 }}
      >
        {description}
      </Typography>
      {(actionLabel || secondaryActionLabel) && (
        <Stack direction="row" spacing={2}>
          {actionLabel && onAction && (
            <Button variant="contained" size="large" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outlined" size="large" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}

// ============================================================================
// Preset Empty States for Common Scenarios
// ============================================================================

/**
 * No timetable created yet
 */
export const NoTimetableEmptyState = ({ onCreate }: { onCreate?: () => void }) => (
  <EmptyState
    icon={<CalendarToday />}
    title="ยังไม่มีตารางเรียน"
    description="เริ่มสร้างตารางเรียนใหม่สำหรับภาคเรียนนี้ หรือคัดลอกจากภาคเรียนที่แล้ว"
    actionLabel="สร้างตารางเรียน"
    onAction={onCreate}
  />
);

/**
 * No teachers added
 */
export const NoTeachersEmptyState = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<PersonAdd />}
    title="ยังไม่มีข้อมูลครู"
    description="เพิ่มข้อมูลครูเพื่อเริ่มจัดตารางสอน คุณสามารถเพิ่มครูทีละคนหรือนำเข้าจากไฟล์ CSV"
    actionLabel="เพิ่มครู"
    onAction={onAdd}
  />
);

/**
 * No subjects added
 */
export const NoSubjectsEmptyState = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<Class />}
    title="ยังไม่มีรายวิชา"
    description="เพิ่มรายวิชาที่ต้องการจัดในตารางเรียน พร้อมระบุจำนวนชั่วโมงเรียนต่อสัปดาห์"
    actionLabel="เพิ่มรายวิชา"
    onAction={onAdd}
  />
);

/**
 * No teacher assignments
 */
export const NoAssignmentsEmptyState = ({ onAssign }: { onAssign?: () => void }) => (
  <EmptyState
    icon={<Assignment />}
    title="ยังไม่มีการมอบหมายวิชา"
    description="มอบหมายวิชาให้ครูแต่ละคนก่อนจัดตารางสอน เพื่อให้ระบบตรวจสอบความขัดแย้งได้อย่างถูกต้อง"
    actionLabel="มอบหมายวิชา"
    onAction={onAssign}
  />
);

/**
 * No search results
 */
export const NoSearchResultsEmptyState = ({ 
  searchTerm, 
  onClear 
}: { 
  searchTerm?: string; 
  onClear?: () => void;
}) => (
  <EmptyState
    icon={<Search />}
    title="ไม่พบผลลัพธ์"
    description={
      searchTerm
        ? `ไม่พบข้อมูลที่ตรงกับคำค้นหา "${searchTerm}" กรุณาลองค้นหาด้วยคำอื่น`
        : 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
    }
    actionLabel="ล้างการค้นหา"
    onAction={onClear}
  />
);

/**
 * No data in general
 */
export const NoDataEmptyState = ({ 
  entityName = 'ข้อมูล',
  onAdd 
}: { 
  entityName?: string;
  onAdd?: () => void;
}) => (
  <EmptyState
    icon={<FolderOpen />}
    title={`ยังไม่มี${entityName}`}
    description={`เริ่มต้นใช้งานด้วยการเพิ่ม${entityName}ใหม่`}
    actionLabel={`เพิ่ม${entityName}`}
    onAction={onAdd}
  />
);

/**
 * No schedule conflicts (success state)
 */
export const NoConflictsEmptyState = () => (
  <EmptyState
    icon={<EventBusy sx={{ color: 'success.main' }} />}
    title="ไม่พบความขัดแย้ง"
    description="ตารางเรียนของคุณไม่มีความขัดแย้ง พร้อมใช้งานได้เลย"
  />
);

/**
 * No rooms available
 */
export const NoRoomsEmptyState = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<SchoolOutlined />}
    title="ยังไม่มีข้อมูลห้องเรียน"
    description="เพิ่มข้อมูลห้องเรียนเพื่อจัดสรรให้กับรายวิชาต่างๆ"
    actionLabel="เพิ่มห้องเรียน"
    onAction={onAdd}
  />
);

/**
 * No locked schedules
 */
export const NoLockedSchedulesEmptyState = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<EventBusy />}
    title="ยังไม่มีช่วงเวลาที่ล็อค"
    description="ล็อคช่วงเวลาสำหรับกิจกรรมพิเศษ เช่น ชุมนุม กิจกรรมเช้า หรือการประชุม"
    actionLabel="เพิ่มช่วงเวลาล็อค"
    onAction={onAdd}
  />
);

/**
 * Permission denied empty state
 */
export const PermissionDeniedEmptyState = ({ onGoBack }: { onGoBack?: () => void }) => (
  <EmptyState
    icon={<Box sx={{ fontSize: 64 }}>🔒</Box>}
    title="ไม่มีสิทธิ์เข้าถึง"
    description="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคุณต้องการเข้าถึง"
    actionLabel="กลับหน้าหลัก"
    onAction={onGoBack}
  />
);

/**
 * Network error empty state
 */
export const NetworkErrorEmptyState = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon={<Box sx={{ fontSize: 64 }}>📡</Box>}
    title="ไม่สามารถเชื่อมต่อได้"
    description="เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ"
    actionLabel="ลองอีกครั้ง"
    onAction={onRetry}
  />
);

/**
 * Coming soon empty state
 */
export const ComingSoonEmptyState = () => (
  <EmptyState
    icon={<Box sx={{ fontSize: 64 }}>🚀</Box>}
    title="กำลังพัฒนา"
    description="ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา จะเปิดใช้งานเร็วๆ นี้"
  />
);
