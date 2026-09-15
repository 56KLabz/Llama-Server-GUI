## 2026-09-12 - Prevent full flag grid re-renders with React.memo & O(N) category count aggregation

**Learning:** In React applications with large dynamic item grids (e.g. 60+ `FlagCard` items) and continuous background polling (e.g. 2.5s system metrics interval in `App.tsx`), passing inline arrow functions or unmemoized handlers causes every grid item to re-render on every poll or state change. Additionally, computing counts per category with `.filter()` inside iteration methods leads to redundant $O(C \times N)$ array operations.

**Action:** Wrap grid item components in `React.memo`, pass stable `useCallback` functions taking item IDs, and aggregate list metrics using a single $O(N)$ pass inside `useMemo`.
