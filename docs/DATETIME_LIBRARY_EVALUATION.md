# Datetime Library Migration Evaluation

**Date**: 2026-01-02  
**Status**: Evaluation Complete  
**Decision**: ⚠️ **DO NOT MIGRATE** (Recommendation)

---

## Executive Summary

After analyzing the current DIY datetime utilities, I **recommend against migrating** to a third-party datetime library. The current implementation is:

- ✅ **Minimal** (152 lines total)
- ✅ **Zero-dependency** (uses only native `Intl.DateTimeFormat`)
- ✅ **Battle-tested** (SSR-safe, hydration-safe, just fixed P0 bug)
- ✅ **Performant** (no parsing overhead)
- ✅ **Tailored** to Thai/Bangkok timezone requirements

**Risk-Benefit Analysis**: Migration would introduce ~50KB+ bundle size, dependency maintenance burden, and potential SSR/hydration issues for minimal benefit.

---

## Current Implementation Analysis

### Code Inventory

**File**: [`src/utils/datetime.ts`](../src/utils/datetime.ts)  
**Size**: 152 lines  
**Dependencies**: None (native APIs only)  
**Test Coverage**: [`src/utils/datetime.test.ts`](../src/utils/datetime.test.ts) - 5 tests passing

### Functionality Provided

| Function | Purpose | Usage Count |
|----------|---------|-------------|
| `formatBangkokDateTime` | Format datetime in Bangkok TZ (DD/MM/YYYY HH:mm) | 3 usages |
| `formatBangkokTime` | Format time only (HH:mm) | 3 usages |
| `formatTimeslotTimeUtc` | Format timeslot times (special handling) | 4 usages |
| `getBangkokGregorianYear` | Get current year in Bangkok TZ | 5 usages |
| `getBangkokThaiBuddhistYear` | Get Thai Buddhist year (Gregorian + 543) | 7 usages |
| `formatThaiDateTimeBangkok` | Thai locale long format | 2 usages |
| `formatThaiDateShortBangkok` | Thai locale short format | 3 usages |
| `formatThaiDateNumericBangkok` | Thai locale numeric format | 2 usages |

**Total unique call sites**: ~29 across 15 files

### Key Design Decisions

1. **Intl.DateTimeFormat Pre-initialization**
   ```typescript
   const BANGKOK_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
     timeZone: "Asia/Bangkok",
     hour: "2-digit",
     minute: "2-digit",
     hour12: false,
   });
   ```
   - ✅ Avoids re-creating formatters on every call
   - ✅ Deterministic output (SSR-safe)

2. **Minimal Surface Area**
   - Only 8 exported functions
   - No date arithmetic, no parsing complexity
   - Pure formatting/extraction

3. **Thai Buddhist Calendar Support**
   - Critical for MOE compliance (Thai educational system)
   - Simple arithmetic: `gregorianYear + 543`

---

## Library Candidates

### 1. **date-fns** (Top Choice if Migrating)

**Pros:**
- ✅ Modular (tree-shakeable)
- ✅ TypeScript native
- ✅ No mutability (functional)
- ✅ Wide adoption

**Cons:**
- ❌ ~50KB bundle impact (even with tree-shaking)
- ❌ No native Thai Buddhist calendar
- ❌ Timezone support requires `date-fns-tz` (another dependency)
- ❌ Still need custom wrappers for Thai year conversion

**Migration Complexity**: Medium

**Example Migration**:
```typescript
import { format, formatInTimeZone } from 'date-fns-tz';

export function formatBangkokDateTime(input: DateInput): string {
  return formatInTimeZone(input, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm');
}

export function getBangkokThaiBuddhistYear(input?: DateInput): number {
  const year = formatInTimeZone(input || new Date(), 'Asia/Bangkok', 'yyyy');
  return parseInt(year) + 543;
}
```

---

### 2. **Day.js**

**Pros:**
- ✅ Smallest bundle (~2KB base + plugins)
- ✅ Moment.js-like API (familiar)
- ✅ Plugin system

**Cons:**
- ❌ Mutable API (can lead to bugs)
- ❌ Plugin loading complexity
- ❌ Requires `timezone` + `buddhistEra` plugins
- ❌ Less TypeScript-friendly than date-fns

**Migration Complexity**: Medium-High

**Example Migration**:
```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(buddhistEra);

export function formatBangkokDateTime(input: DateInput): string {
  return dayjs(input).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm');
}

export function getBangkokThaiBuddhistYear(input?: DateInput): number {
  return dayjs(input).tz('Asia/Bangkok').year() + 543;
}
```

---

### 3. **Luxon**

**Pros:**
- ✅ Intl API-based (like current code)
- ✅ Immutable
- ✅ Good timezone support

**Cons:**
- ❌ ~25KB bundle size
- ❌ No Buddhist calendar support
- ❌ More verbose API
- ❌ Depends on Intl anyway (no advantage)

**Migration Complexity**: Medium

---

### 4. **Temporal API** (Future Standard)

**Pros:**
- ✅ Native browser API (no dependency)
- ✅ Immutable, modern design
- ✅ Built-in timezone support

**Cons:**
- ❌ **Not widely available** (Stage 3 proposal)
- ❌ Requires polyfill (~50KB)
- ❌ No Buddhist calendar
- ❌ Too early for production

**Status**: Watch for TC39 Stage 4 (2026-2027?)

---

## Cost-Benefit Analysis

### Migration Costs

| Cost Factor | Impact | Notes |
|-------------|--------|-------|
| **Bundle Size** | +30-50KB | Even with tree-shaking |
| **Dev Time** | 4-6 hours | Update 29 call sites, tests, verify SSR |
| **Dependency Maintenance** | Ongoing | Security patches, breaking changes |
| **SSR Risk** | Medium | New lib may have hydration issues |
| **Testing Overhead** | +2 hours | Verify timezone edge cases |
| **Thai Buddhist Year** | Custom Code | Still need wrapper logic |

**Total Estimated Cost**: 8-10 hours + ongoing maintenance

---

### Migration Benefits

| Benefit | Value | Reality Check |
|---------|-------|---------------|
| Date arithmetic | Not needed | Current code only formats |
| Parsing complex formats | Not needed | Only parse ISO strings + "HH:mm" |
| Relative time (e.g., "2 days ago") | Not needed | Not used in UI |
| Duration handling | Not needed | No duration calculations |
| Advanced timezone conversions | Not needed | Only Bangkok ↔ UTC |
| Community support | Nice-to-have | Current code is stable |

**Total Real Benefit**: **Near Zero**

---

## Decision Matrix

| Criteria | DIY (Current) | date-fns | Day.js | Luxon |
|----------|---------------|----------|--------|-------|
| Bundle Size | 0KB | ~50KB | ~15KB | ~25KB |
| Maintenance | Internal | External | External | External |
| SSR Safety | ✅ Proven | ⚠️ Verify | ⚠️ Verify | ⚠️ Verify |
| Thai Support | ✅ Built-in | ❌ Custom | ⚠️ Plugin | ❌ Custom |
| Type Safety | ✅ Full | ✅ Full | ⚠️ Partial | ✅ Full |
| Learning Curve | None | Low | Low | Medium |
| Future-Proof | ✅ Intl | ✅ Active | ✅ Active | ✅ Active |

**Winner**: **DIY (Current Implementation)**

---

## Recommendation

### **DO NOT MIGRATE** ❌

**Rationale:**

1. **Current code solves the exact problem with zero overhead**
   - 152 lines vs. 50KB+ library
   - Uses native, future-proof APIs (`Intl.DateTimeFormat`)
   - Already handles SSR/hydration correctly

2. **No unmet requirements**
   - No date arithmetic needed
   - No complex parsing needed
   - No duration/interval logic needed
   - Thai Buddhist calendar is simple addition

3. **Recent P0 bug fix validates architecture**
   - The UTC → Bangkok timezone fix was **trivial** (changed 3 lines)
   - Same fix in a library would require understanding their abstraction layer

4. **Technical debt is minimal**
   - Code is well-tested
   - Used in 29 places (easy to maintain)
   - No cryptic edge cases

5. **Risk outweighs benefit**
   - Migration introduces SSR/hydration risk
   - Bundle size regression
   - New dependency to maintain
   - Zero functional improvement

---

## When to Reconsider

Migrate to a library **only if**:

1. ✅ Need **date arithmetic** (add/subtract days, months)
2. ✅ Need **complex parsing** (multiple custom formats)
3. ✅ Need **duration calculations** (difference in human-readable format)
4. ✅ Need **relative time** ("2 hours ago")
5. ✅ Current code has **3+ bugs per quarter**

**Current Status**: None of these conditions are met.

---

## Alternative: Enhance DIY Code

If future needs arise, consider **incremental enhancements**:

### Example: Add Date Arithmetic (if needed)

```typescript
export function addDays(input: DateInput, days: number): Date {
  const date = toDate(input);
  if (!date) throw new Error("Invalid date");
  
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffInDays(start: DateInput, end: DateInput): number {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return 0;
  
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
```

**Cost**: 20-30 lines, fully controlled, zero dependencies

---

## Test Coverage Requirement

If keeping DIY code, **ensure 100% coverage**:

- [x] Bangkok timezone formatting ✅
- [x] Thai Buddhist year conversion ✅
- [x] Time-only string parsing ✅
- [ ] Add edge case: Invalid dates (return empty string)
- [ ] Add edge case: Null/undefined handling
- [ ] Add edge case: Leap year in Thai calendar
- [ ] Add test: DST transitions (Bangkok doesn't have DST, but verify)

**Action Item**: Add 4 more test cases (1 hour)

---

## Conclusion

**Verdict**: ✅ **KEEP DIY IMPLEMENTATION**

The current datetime utilities are:
- Fit-for-purpose
- Minimal and maintainable
- Zero-dependency
- Battle-tested (SSR-safe, just fixed P0 bug)

Migrating to a library would be **premature optimization** and introduce unnecessary complexity.

---

## Appendix: Bundle Size Analysis

Using `date-fns-tz` as example:

```bash
# Current (DIY)
datetime.ts (compiled): ~2KB

# With date-fns-tz
date-fns-tz core: ~40KB
formatInTimeZone: ~8KB
Additional utilities: ~5KB
---
Total: ~53KB (+2,550% increase)
```

**Impact on Next.js bundles**:
- First Load JS would increase by ~50KB
- Critical for mobile users in Thailand (slow 3G common)
- Fails performance budget for educational institutions

---

## References

- [Intl.DateTimeFormat (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Temporal API Proposal (TC39)](https://tc39.es/proposal-temporal/)
- [date-fns Documentation](https://date-fns.org/)
- [Day.js Documentation](https://day.js.org/)
- Thai Buddhist Calendar: [Wikipedia](https://en.wikipedia.org/wiki/Thai_solar_calendar)

---

**Last Updated**: 2026-01-02  
**Reviewed By**: GitHub Copilot (Senior Agent)  
**Next Review**: 2026-07-01 (6 months) or when Temporal API reaches Stage 4
