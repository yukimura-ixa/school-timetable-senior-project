# Package Audit Report

**Date**: October 2025  
**Project**: School Timetable Senior Project  
**Audit Type**: Deprecated Packages & Version Audit

---

## Executive Summary

This report documents the findings from a comprehensive package audit of the school timetable project, including deprecated packages, security vulnerabilities, and outdated dependencies.

### Key Findings

✅ **1 Deprecated Package Identified**: `react-beautiful-dnd`  
⚠️ **2 Security Vulnerabilities**: In transitive dependency `undici` (via firebase)  
📦 **Multiple Outdated Packages**: Available for future consideration  
📝 **Documentation Updated**: README.md updated with current information

---

## 1. Deprecated Packages

### react-beautiful-dnd (v13.1.1) 🚨

**Status**: DEPRECATED  
**Maintainer**: Atlassian (no longer maintaining)  
**Severity**: Medium (No immediate impact, but no future updates)

**Usage in Project**:
- `src/app/schedule/[semesterAndyear]/arrange/component/TimeSlot.tsx`
- `src/app/schedule/[semesterAndyear]/arrange/component/SubjectItem.tsx`
- `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`
- `src/components/elements/dnd/StrictModeDroppable.tsx`

**Impact**: 
- ✅ Currently functional and stable
- ⚠️ No future bug fixes or security updates
- ⚠️ May have compatibility issues with future React versions

**Recommended Action**:
- **Short-term**: Continue using (documented in README)
- **Long-term**: Migrate to [@dnd-kit/core](https://dndkit.com/)
  - Modern, actively maintained alternative
  - Better TypeScript support
  - Smaller bundle size
  - Compatible with React 18+

**Migration Complexity**: Medium (estimated 2-3 days of development)

---

## 2. Security Vulnerabilities

### undici (transitive via firebase)

**Found Via**: `pnpm audit --prod`

#### Vulnerability 1: Use of Insufficiently Random Values
- **Severity**: Moderate
- **Package**: undici
- **Vulnerable Versions**: >=6.0.0 <6.21.1
- **Patched Versions**: >=6.21.1
- **Path**: `firebase > @firebase/auth > undici`
- **Advisory**: https://github.com/advisories/GHSA-c76h-2ccp-4975

#### Vulnerability 2: Denial of Service via Bad Certificate Data
- **Severity**: Low
- **Package**: undici
- **Vulnerable Versions**: >=6.0.0 <6.21.2
- **Patched Versions**: >=6.21.2
- **Path**: `firebase > @firebase/auth > undici`
- **Advisory**: https://github.com/advisories/GHSA-cxrh-j4jr-qwg3

**Resolution**:
Updating `firebase` from `10.14.1` to `12.4.0` will resolve both vulnerabilities.

**Risk Assessment**: Low - These vulnerabilities are in authentication flow and have low exploitability in the project's use case.

---

## 3. Outdated Packages

The following packages have major version updates available. These require careful review due to potential breaking changes:

### High Priority (Security/Performance)

| Package | Current | Latest | Major Versions Behind | Notes |
|---------|---------|--------|----------------------|-------|
| firebase | 10.14.1 | 12.4.0 | 2 | Fixes security issues in undici |

### Medium Priority (Framework/Core)

| Package | Current | Latest | Major Versions Behind | Notes |
|---------|---------|--------|----------------------|-------|
| @mui/material | 5.18.0 | 7.3.4 | 2 | Requires migration guide review |
| @mui/icons-material | 5.18.0 | 7.3.4 | 2 | Must update with @mui/material |
| @prisma/client | 5.22.0 | 6.17.1 | 1 | Requires thorough testing |
| prisma (dev) | 5.22.0 | 6.17.1 | 1 | Must update with @prisma/client |
| react | 18.3.1 | 19.2.0 | 1 | Next.js 15 supports React 19 |
| react-dom | 18.3.1 | 19.2.0 | 1 | Must update with react |

### Low Priority (Dev Tools)

| Package | Current | Latest | Major Versions Behind | Notes |
|---------|---------|--------|----------------------|-------|
| eslint (dev) | 8.57.1 | 9.38.0 | 1 | Flat config required |
| @types/react (dev) | 18.3.26 | 19.2.2 | 1 | Update with React |
| @types/react-dom (dev) | 18.3.7 | 19.2.2 | 1 | Update with React |
| jest (dev) | 29.7.0 | 30.2.0 | 1 | Test framework update |

### Minor/Patch Updates Available

- react-icons: 4.12.0 → 5.5.0
- react-to-print: 2.15.1 → 3.2.0
- @testing-library/react: 14.3.1 → 16.3.0
- @testing-library/jest-dom: 5.17.0 → 6.9.1
- prisma-dbml-generator: 0.10.0 → 0.12.0

---

## 4. Actions Taken

### Documentation Updates ✅

**README.md Updated**:
1. ✅ Updated version badges to reflect actual versions:
   - Next.js: 14.2 → 15.5
   - Added React 18.3 badge
   - All badges now accurate

2. ✅ Added "Package Status" section:
   - Comprehensive deprecation notice for react-beautiful-dnd
   - Listed all affected files
   - Impact assessment
   - Migration path suggestions
   - Documented security vulnerabilities
   - Listed outdated packages for planning

3. ✅ Updated Technology Stack section:
   - Added specific version numbers for all libraries
   - Next.js 15.5, React 18.3, Tailwind CSS 4.1, TypeScript 5.x
   - Prisma 5.22 explicitly listed

4. ✅ Updated installation instructions:
   - Changed from npm to pnpm as recommended package manager
   - Added pnpm installation steps
   - Kept npm as alternative option
   - All command examples show both pnpm and npm

5. ✅ Added inline deprecation warning:
   - Warning in Additional Libraries section
   - Links to Package Status section

### Verification ✅

- ✅ All tests pass (3 test suites, 19 tests)
- ✅ Linter runs successfully
- ✅ No code changes required
- ✅ Documentation is comprehensive and accurate

---

## 5. Recommendations

### Immediate Actions (Already Completed)
- [x] Document deprecated package in README
- [x] Update version badges to current versions
- [x] Add comprehensive package status section

### Short-term (Next 1-3 months)
- [ ] Update firebase to 12.4.0 to fix security vulnerabilities
  - Test authentication flows thoroughly
  - Verify all Firebase features still work
  - Risk: Low, Priority: Medium

### Medium-term (Next 3-6 months)
- [ ] Plan migration from react-beautiful-dnd to @dnd-kit
  - Prototype with @dnd-kit in a feature branch
  - Create migration guide
  - Gradually migrate components
  - Risk: Medium, Priority: Medium

### Long-term (Next 6-12 months)
- [ ] Consider React 19 upgrade when ecosystem is fully ready
  - Monitor Next.js and library compatibility
  - Test in development environment first
  - Risk: Medium-High, Priority: Low

- [ ] Consider Material-UI v7 upgrade
  - Review breaking changes in migration guides
  - Significant API changes expected
  - Risk: High, Priority: Low

- [ ] Consider Prisma 6 upgrade
  - Review schema changes
  - Test all database operations
  - Risk: Medium, Priority: Low

---

## 6. Migration Priority Matrix

```
High Impact, Easy Migration:
├── firebase (10.14.1 → 12.4.0) [Security fix]
└── react-icons (4.12.0 → 5.5.0)

High Impact, Medium Migration:
├── react-beautiful-dnd → @dnd-kit [Deprecation fix]
└── eslint (8.57.1 → 9.38.0) [Config changes]

High Impact, Hard Migration:
├── @mui/material (5.18.0 → 7.3.4) [Breaking changes]
├── React (18.3.1 → 19.2.0) [Ecosystem readiness]
└── Prisma (5.22.0 → 6.17.1) [Schema changes]

Medium/Low Impact:
└── Various dev dependencies [Test & verify]
```

---

## 7. Current Package Health Status

### Healthy ✅
- Next.js 15.5.6 (latest major)
- TypeScript 5.x (current)
- Tailwind CSS 4.1.14 (latest)
- NextAuth.js 4.24.11 (stable v4)
- ExcelJS 4.4.0 (current)
- SWR 2.3.6 (current)
- Notistack 3.0.2 (current)

### Needs Attention ⚠️
- react-beautiful-dnd 13.1.1 (deprecated)
- firebase 10.14.1 (security vulnerabilities)

### Outdated but Functional 📦
- Material-UI 5.18.0 (v7 available)
- React 18.3.1 (v19 available)
- Prisma 5.22.0 (v6 available)

---

## 8. Testing & Validation

All changes were validated:
- ✅ Unit tests: 19 passed
- ✅ Linter: No new warnings
- ✅ Build: Successful
- ✅ Documentation: Comprehensive

---

## 9. References

### Documentation
- [react-beautiful-dnd deprecation notice](https://github.com/atlassian/react-beautiful-dnd)
- [@dnd-kit documentation](https://dndkit.com/)
- [Next.js 15 upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Material-UI v7 migration](https://mui.com/material-ui/migration/migration-v6/)

### Security Advisories
- [GHSA-c76h-2ccp-4975](https://github.com/advisories/GHSA-c76h-2ccp-4975)
- [GHSA-cxrh-j4jr-qwg3](https://github.com/advisories/GHSA-cxrh-j4jr-qwg3)

---

## Conclusion

The project's dependency health is **generally good**. The main concern is the deprecated `react-beautiful-dnd` package, which is well-documented and has a clear migration path. Security vulnerabilities are low-risk and can be addressed by a simple firebase update. The codebase is well-maintained with Next.js 15 already integrated successfully.

**Overall Health Score**: 8/10

**Report Prepared By**: GitHub Copilot  
**Last Updated**: October 2025
