/**
 * Analytics Feature - Public API
 * Clean Architecture exports for analytics dashboard functionality
 */

// Server Actions (Primary entry point for UI)
export * from './application/actions/analytics.actions';

// Validation Schemas
export * from './application/schemas/analytics.schemas';

// Domain Types
export * from './domain/types/analytics.types';

// Domain Services (for advanced usage)
export * from './domain/services/calculation.service';
export * from './domain/services/aggregation.service';

// Repository exports (for direct usage if needed)
export { overviewRepository } from './infrastructure/repositories/overview.repository';
export { teacherRepository } from './infrastructure/repositories/teacher.repository';
export { roomRepository } from './infrastructure/repositories/room.repository';
export { subjectRepository } from './infrastructure/repositories/subject.repository';
export { qualityRepository } from './infrastructure/repositories/quality.repository';
export { timeRepository } from './infrastructure/repositories/time.repository';
export { complianceRepository } from './infrastructure/repositories/compliance.repository';

// Presentation Components
export { OverviewSection } from './presentation/components/OverviewSection';
export { TeacherWorkloadSection } from './presentation/components/TeacherWorkloadSection';
export { RoomUtilizationSection } from './presentation/components/RoomUtilizationSection';
