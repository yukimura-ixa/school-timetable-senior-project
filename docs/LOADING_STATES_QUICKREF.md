# Loading States - Quick Reference

## Available Skeleton Components

### 1. SemesterCardSkeleton
```tsx
import { SemesterCardSkeleton } from "./_components/SemesterCardSkeleton";

<SemesterCardSkeleton />
```
**Use**: Loading state for individual semester cards  
**Props**: None  
**Size**: Matches SemesterCard (300-400px width, auto height)

---

### 2. SemesterSectionSkeleton
```tsx
import { SemesterSectionSkeleton } from "./_components/SemesterSectionSkeleton";

// With title skeleton
<SemesterSectionSkeleton count={3} />

// With fixed title
<SemesterSectionSkeleton title="ล่าสุด" count={3} />

// Without title
<SemesterSectionSkeleton showTitle={false} count={6} />
```
**Use**: Loading state for semester sections (Recent/Pinned/All)  
**Props**:
- `title?: string` - Section title (or skeleton if undefined)
- `count?: number` - Number of cards (default: 3)
- `showTitle?: boolean` - Show title area (default: true)

---

### 3. SemesterFiltersSkeleton
```tsx
import { SemesterFiltersSkeleton } from "./_components/SemesterFiltersSkeleton";

<SemesterFiltersSkeleton />
```
**Use**: Loading state for filter controls  
**Props**: None  
**Elements**: 5 filter controls + title

---

### 4. SelectSemesterPageSkeleton
```tsx
import { SelectSemesterPageSkeleton } from "./_components/SelectSemesterPageSkeleton";

<SelectSemesterPageSkeleton />
```
**Use**: Full page loading state (for Suspense)  
**Props**: None  
**Includes**: Header + Recent + Pinned + Filters + All sections

---

## Usage Patterns

### Pattern 1: Conditional Rendering
```tsx
{loading ? (
  <SemesterSectionSkeleton title="ล่าสุด" count={3} />
) : (
  <SemesterSection data={recentSemesters} />
)}
```

### Pattern 2: Suspense Boundary
```tsx
<Suspense fallback={<SelectSemesterPageSkeleton />}>
  <SemesterContent />
</Suspense>
```

### Pattern 3: Progressive Loading
```tsx
<Suspense fallback={<SemesterSectionSkeleton title="ล่าสุด" count={3} />}>
  <RecentSection />
</Suspense>

<Suspense fallback={<SemesterSectionSkeleton title="ปักหมุด" count={2} />}>
  <PinnedSection />
</Suspense>
```

---

## Current Implementation (page.tsx)

```tsx
// Recent Section
{loading ? (
  <SemesterSectionSkeleton title="ล่าสุด" count={3} />
) : recentSemesters.length > 0 && (
  <Box>
    {/* Actual content */}
  </Box>
)}

// Pinned Section
{loading ? (
  <SemesterSectionSkeleton title="ปักหมุด" count={2} />
) : pinnedSemesters.length > 0 && (
  <Box>
    {/* Actual content */}
  </Box>
)}

// Filters
{loading ? (
  <SemesterFiltersSkeleton />
) : (
  <SemesterFilters filters={filters} onFiltersChange={setFilters} />
)}

// All Semesters
{loading ? (
  <SemesterSectionSkeleton showTitle={false} count={6} />
) : allSemesters.length === 0 ? (
  <EmptyState />
) : (
  <SemesterGrid semesters={allSemesters} />
)}
```

---

## Customization Guide

### Change Card Count
```tsx
// Show more/fewer skeletons
<SemesterSectionSkeleton count={9} />  // 9 cards
```

### Add Animation
```tsx
// In skeleton component
<Skeleton 
  variant="rectangular" 
  animation="wave"  // shimmer effect
  height={180} 
/>
```

### Custom Section Title
```tsx
// Fixed title during loading
<SemesterSectionSkeleton title="กำลังโหลด..." count={3} />

// Or with emoji
<SemesterSectionSkeleton title="⏳ กำลังโหลด" count={3} />
```

---

## Troubleshooting

### Problem: Layout Shift
**Symptom**: Content jumps when skeleton → actual data  
**Solution**: Ensure skeleton dimensions match actual component

```tsx
// Match these values
<Card sx={{ minWidth: 300, maxWidth: 400 }}>  // In SemesterCard
<Card sx={{ minWidth: 300, maxWidth: 400 }}>  // In SemesterCardSkeleton
```

### Problem: Too Many Skeletons
**Symptom**: Page feels heavy during loading  
**Solution**: Reduce skeleton count

```tsx
// Before
<SemesterSectionSkeleton count={12} />  // Too many

// After
<SemesterSectionSkeleton count={6} />   // Better
```

### Problem: Skeleton Flash
**Symptom**: Skeleton appears/disappears too quickly  
**Solution**: Add minimum loading time

```tsx
const [loading, setLoading] = useState(true);
const [minLoadingTime, setMinLoadingTime] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => setMinLoadingTime(false), 300);
  return () => clearTimeout(timer);
}, []);

const showSkeleton = loading || minLoadingTime;
```

---

## Best Practices

### DO ✅
- Match skeleton dimensions to actual components
- Use specific skeletons for each component type
- Show skeletons immediately (no delay)
- Keep skeleton count reasonable (3-6 items)
- Test on slow networks

### DON'T ❌
- Use generic rectangular boxes everywhere
- Show too many skeletons (overwhelming)
- Add artificial delays before skeletons
- Forget to handle empty states
- Ignore responsive behavior

---

## Performance Tips

### Optimize Rendering
```tsx
// Memoize skeleton components if needed
const CardSkeleton = useMemo(() => <SemesterCardSkeleton />, []);

// Or use React.memo
export const SemesterCardSkeleton = React.memo(function SemesterCardSkeleton() {
  // ...
});
```

### Lazy Load Skeletons
```tsx
// Only load skeletons when needed
const SemesterCardSkeleton = lazy(() => 
  import("./_components/SemesterCardSkeleton")
);

// Wrap in Suspense (ironic!)
<Suspense fallback={<SimpleSpinner />}>
  <SemesterCardSkeleton />
</Suspense>
```

---

## Migration Checklist

To add skeletons to other pages:

- [ ] Identify loading sections
- [ ] Create skeleton components matching structure
- [ ] Add loading state to page component
- [ ] Implement conditional rendering
- [ ] Test loading behavior
- [ ] Test empty states
- [ ] Test error states
- [ ] Verify no layout shift
- [ ] Check responsive behavior
- [ ] Review with users

---

## File Locations

```
src/app/dashboard/select-semester/
├── page.tsx                              # Uses skeletons
└── _components/
    ├── SemesterCardSkeleton.tsx         # Individual card
    ├── SemesterSectionSkeleton.tsx      # Section wrapper
    ├── SemesterFiltersSkeleton.tsx      # Filter controls
    └── SelectSemesterPageSkeleton.tsx   # Full page
```

---

## Related Documentation

- [Implementation Guide](./LOADING_STATES_IMPLEMENTATION.md)
- [Visual Comparison](./LOADING_STATES_VISUAL_COMPARISON.md)
- [MUI Skeleton Docs](https://mui.com/material-ui/react-skeleton/)
