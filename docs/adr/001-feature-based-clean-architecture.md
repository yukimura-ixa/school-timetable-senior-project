# ADR 001: Feature-Based Architecture with Clean Architecture Principles

**Status**: Accepted
**Date**: 2025-10-21
**Deciders**: Solo Developer
**Context**: School Timetable Management System Refactoring

---

## Context and Problem Statement

The current codebase has several architectural issues:
1. API routes mix HTTP concerns, business logic, and data access
2. Components have excessive state (34+ useState in one component)
3. Business logic is scattered across the codebase
4. No clear separation of concerns
5. Difficult to test critical functionality (conflict detection)
6. TypeScript strict mode disabled due to type safety issues

**Question**: How should we reorganize the codebase to improve maintainability, testability, and scalability?

---

## Decision Drivers

- **Testability**: Critical business logic (conflict detection) must be easily testable
- **Maintainability**: Code should be easy to understand and modify
- **Scalability**: Architecture should support future growth
- **Solo Development**: Must be practical for a single developer
- **Best Practices**: Must follow industry-standard patterns
- **TypeScript Safety**: Enable strict mode incrementally

---

## Considered Options

### Option 1: Type-Based Organization (Current)
```
src/
  ├── components/
  ├── api/
  ├── hooks/
  └── functions/
```

**Pros**:
- Simple to understand initially
- Common in small projects
- Easy to find all components/APIs

**Cons**:
- Features scattered across multiple directories
- Hard to understand feature boundaries
- Difficult to test features in isolation
- Encourages tight coupling

### Option 2: Feature-Based Organization (Simple)
```
src/
  └── features/
      ├── teachers/
      ├── schedules/
      └── exports/
```

**Pros**:
- Features are self-contained
- Easier to understand feature scope
- Better than type-based

**Cons**:
- No guidance on internal structure
- Business logic can still mix with UI
- Testing not enforced by structure

### Option 3: Feature-Based + Clean Architecture (CHOSEN)
```
src/
  └── features/
      └── schedule-arrangement/
          ├── domain/        # Pure business logic
          ├── application/   # Use cases, Server Actions
          ├── infrastructure/# Data access, external services
          └── presentation/  # UI components, stores
```

**Pros**:
- Clear separation of concerns
- Business logic isolated and testable
- Enforces dependency direction (presentation → application → domain)
- Scalable and maintainable
- Follows industry best practices

**Cons**:
- More upfront structure
- Learning curve for Clean Architecture
- More files/folders to navigate

---

## Decision Outcome

**Chosen option**: Feature-Based + Clean Architecture

### Architectural Layers

#### 1. Domain Layer
- **Purpose**: Pure business logic and rules
- **No dependencies** on frameworks, UI, or external services
- **Contains**:
  - Business models (TypeScript types/interfaces)
  - Domain services (pure functions)
  - Business rules (validation, calculations)
- **Example**: Conflict detection service that checks scheduling conflicts

#### 2. Application Layer
- **Purpose**: Use cases and orchestration
- **Depends on**: Domain layer
- **Contains**:
  - Server Actions (Next.js)
  - Input/output schemas (Valibot)
  - Use case orchestration
- **Example**: Arrange schedule action that validates input, checks conflicts, saves to DB

#### 3. Infrastructure Layer
- **Purpose**: External dependencies and data access
- **Depends on**: Domain layer (through interfaces)
- **Contains**:
  - Repositories (Prisma)
  - External API clients
  - File system access
- **Example**: Schedule repository that reads/writes to MySQL

#### 4. Presentation Layer
- **Purpose**: UI components and user interaction
- **Depends on**: Application layer
- **Contains**:
  - React components
  - Zustand stores (UI state)
  - Custom hooks
  - Component styles
- **Example**: Timetable grid component with drag & drop

### Simplified Structure for Simple Features

For simple CRUD features, we can use a simplified 3-layer structure:
```
features/teacher-management/
├── application/     # Server Actions + Schemas
├── infrastructure/  # Repository
└── presentation/    # Components + Stores
```

No separate domain layer if there's no complex business logic.

---

## Consequences

### Positive

1. ✅ **Better Testability**: Pure functions in domain layer easy to test
2. ✅ **Clear Boundaries**: Each layer has specific responsibilities
3. ✅ **Independent Testing**: Can test layers in isolation
4. ✅ **Maintainability**: Easy to locate and modify code
5. ✅ **Scalability**: New features follow same pattern
6. ✅ **Type Safety**: Easier to enable TypeScript strict mode progressively
7. ✅ **Onboarding**: New developers understand structure quickly

### Negative

1. ⚠️ **More Boilerplate**: More files and folders
2. ⚠️ **Learning Curve**: Need to understand Clean Architecture
3. ⚠️ **Over-Engineering Risk**: Simple features might not need all layers

### Mitigation

- Use simplified 3-layer structure for simple CRUD
- Provide clear examples and documentation
- Create code templates/snippets
- Incremental migration (not big bang)

---

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- Create folder structure
- Set up shared utilities
- Create reusable helpers (action wrapper)

### Phase 2: First Feature (Weeks 3-6)
- Implement schedule-arrangement with full 4-layer architecture
- Serves as reference for other features

### Phase 3-4: Remaining Features (Weeks 7-13)
- Migrate other features using established patterns
- Use simplified structure where appropriate

### Phase 5: Polish (Week 14)
- Enable full TypeScript strict mode
- Performance optimization
- Documentation

---

## Links

- [Clean Architecture by Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Next.js App Router Best Practices](https://nextjs.org/docs/app/building-your-application)

---

## Related ADRs

- ADR 002: Zustand for UI State Management
- ADR 003: Server Actions Over API Routes
- ADR 004: Valibot for Runtime Validation
- ADR 005: @dnd-kit for Drag & Drop

---

## Notes

This architecture balances best practices with pragmatism for a solo developer hobby project. The structure provides room to grow while remaining approachable.
