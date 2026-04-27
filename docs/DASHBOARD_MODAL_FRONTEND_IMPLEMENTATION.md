# Dashboard Interactive Modals - Frontend Implementation Guide

## Overview

This document describes the **frontend refactoring** of the Dashboard page to add interactive KPI cards and premium glassmorphism modals. The implementation follows the Factory app's design system and provides a seamless user experience.

---

## 1. Components Created

### 1.1 GlassModal Component (`components/GlassModal.tsx`)

A **highly reusable** modal component that matches the Factory app's premium aesthetic.

**Features:**
- ✅ Dark frosted glass overlay with backdrop blur
- ✅ White/glass content box with dashed inner borders (stitching effect)
- ✅ Brand colors: `#263544` (dark) and `#C89355` (gold)
- ✅ Smooth animations (fade-in, zoom-in)
- ✅ Loading state with spinning loader
- ✅ Empty state with customizable icon and message
- ✅ Keyboard support (Escape to close, Enter/Space to interact)
- ✅ Accessibility features (ARIA labels, focus management)
- ✅ Body scroll lock when modal is open

**Props:**

```typescript
interface GlassModalProps<T = any> {
  isOpen: boolean;              // Controls modal visibility
  onClose: () => void;          // Callback when modal is closed
  title: string;                // Modal header title
  icon: LucideIcon;             // Icon displayed in header
  isLoading: boolean;           // Shows loading spinner
  data: T[] | null;             // Array of data items to display
  renderItem: (item: T, index: number) => React.ReactNode; // Custom render function
  emptyMessage?: string;        // Message shown when data is empty
  emptyIcon?: LucideIcon;       // Icon shown in empty state
}
```

**Usage Example:**

```tsx
<GlassModal<Employee>
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="الموظفون الحاضرون"
  icon={UserCheck}
  isLoading={isLoading}
  data={employees}
  emptyMessage="لا يوجد موظفون"
  emptyIcon={User}
  renderItem={(employee) => (
    <div>{employee.name}</div>
  )}
/>
```

---

### 1.2 Refactored Dashboard Page (`app/(dashboard)/home/page.tsx`)

**Key Changes:**

1. **Interactive Cards:**
   - "Total Employees" → Navigates to `/employees` page
   - "Today's Attendance" → Opens Present Employees modal
   - "Total Absences" → Opens Absent Employees modal
   - "Late Minutes" → Opens Late Employees modal
   - "Due Salaries" & "Overtime" → Static (non-clickable)

2. **Visual Enhancements:**
   - Clickable cards have `cursor-pointer` class
   - Hover effects: scale-up, shadow boost, border color change
   - Top gradient bar appears on hover for clickable cards
   - Icon animations (pulse, rotate, scale) on hover

3. **State Management:**
   ```typescript
   const [activeModal, setActiveModal] = useState<ModalType>(null);
   const [modalData, setModalData] = useState<any[] | null>(null);
   const [isModalLoading, setIsModalLoading] = useState(false);
   ```

4. **Lazy Data Fetching:**
   - Data is **NOT** fetched on initial page load
   - Only fetched when a specific modal is opened
   - Uses `fetchModalData()` function with modal type parameter

---

## 2. Data Flow

### 2.1 Initial Page Load

```
User visits dashboard
  ↓
useDashboard() hook fetches KPI counts only
  ↓
Cards display aggregated numbers
  ↓
No modal data is fetched (performance optimization)
```

### 2.2 User Clicks Card

```
User clicks "Today's Attendance" card
  ↓
handleCardClick('present') is called
  ↓
setActiveModal('present') - Modal opens
  ↓
fetchModalData('present') is called
  ↓
setIsModalLoading(true) - Loading spinner shows
  ↓
API call: GET /api/attendance/today/present
  ↓
setModalData(response.employees) - Data populates
  ↓
setIsModalLoading(false) - Loading spinner hides
  ↓
Modal displays employee list
```

### 2.3 User Closes Modal

```
User clicks X button or presses Escape
  ↓
handleCloseModal() is called
  ↓
setActiveModal(null) - Modal closes
  ↓
setModalData(null) - Data is cleared
```

---

## 3. API Integration (TODO)

### 3.1 Current Implementation (Mock Data)

The current implementation uses **setTimeout** to simulate API calls with mock data:

```typescript
const fetchModalData = async (type: ModalType) => {
  setIsModalLoading(true);
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Mock data
  if (type === 'present') {
    const mockData: PresentEmployee[] = [/* ... */];
    setModalData(mockData);
  }
  
  setIsModalLoading(false);
};
```

### 3.2 Production Implementation (Replace with Real API)

**Step 1:** Import the API client:

```typescript
import { api } from '@/lib/http/api';
```

**Step 2:** Replace mock data with real API calls:

```typescript
const fetchModalData = async (type: ModalType) => {
  if (!type) return;

  setIsModalLoading(true);
  setModalData(null);

  try {
    if (type === 'present') {
      const response = await api.get<{ employees: PresentEmployee[] }>(
        '/attendance/today/present'
      );
      setModalData(response.employees);
    } else if (type === 'absent') {
      const response = await api.get<{ employees: AbsentEmployee[] }>(
        '/attendance/today/absent'
      );
      setModalData(response.employees);
    } else if (type === 'late') {
      const response = await api.get<{ employees: LateEmployeeDetail[] }>(
        '/attendance/today/late'
      );
      setModalData(response.employees);
    }
  } catch (error) {
    console.error('Error fetching modal data:', error);
    setModalData([]); // Show empty state on error
    // Optional: Show toast notification
    // toast.error('فشل تحميل البيانات');
  } finally {
    setIsModalLoading(false);
  }
};
```

**Step 3:** Add error handling with toast notifications (optional):

```typescript
import { toast } from 'react-hot-toast';

// In catch block:
toast.error('فشل تحميل البيانات. يرجى المحاولة مرة أخرى.');
```

---

## 4. Type Definitions

### 4.1 Modal Types

```typescript
type ModalType = 'present' | 'absent' | 'late' | null;
```

### 4.2 Employee Data Types

```typescript
interface PresentEmployee {
  employeeId: string;
  name: string;
  department: string;
  profession: string;
  checkIn: string;          // HH:mm format
  checkOut: string | null;  // HH:mm format or null if still working
  avatar?: string;
}

interface AbsentEmployee {
  employeeId: string;
  name: string;
  department: string;
  profession: string;
  scheduledStart: string;   // HH:mm format
  avatar?: string;
  lastCheckIn?: string;     // YYYY-MM-DD format
}

interface LateEmployeeDetail {
  employeeId: string;
  name: string;
  department: string;
  profession: string;
  scheduledStart: string;   // HH:mm format
  checkIn: string;          // HH:mm format
  minutesLate: number;      // Integer
  avatar?: string;
}
```

---

## 5. Styling & Design System

### 5.1 Brand Colors

```css
--dark-primary: #263544;    /* Dark blue-gray */
--gold-accent: #C89355;     /* Gold/bronze */
--white-glass: rgba(255, 255, 255, 0.95);
--overlay-dark: rgba(38, 53, 68, 0.4);
```

### 5.2 Glassmorphism Effects

```css
/* Card background */
bg-white/60 backdrop-blur-xl

/* Modal overlay */
bg-[#263544]/40 backdrop-blur-sm

/* Modal content */
bg-white/95 backdrop-blur-2xl
```

### 5.3 Stitching Effect (Dashed Inner Border)

```tsx
<div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/40 pointer-events-none" />
```

### 5.4 Hover States (Clickable Cards Only)

```css
/* Scale up */
hover:scale-[1.02]

/* Shadow boost */
hover:shadow-[0_25px_50px_rgba(200,147,85,0.2)]

/* Translate up */
hover:-translate-y-2

/* Border color change */
hover:border-[#C89355]/60
```

---

## 6. Accessibility Features

### 6.1 Keyboard Navigation

- **Escape Key:** Closes the modal
- **Enter/Space:** Activates clickable cards
- **Tab:** Navigates through focusable elements

### 6.2 ARIA Attributes

```tsx
<div
  role={stat.clickable ? 'button' : undefined}
  tabIndex={stat.clickable ? 0 : undefined}
  aria-label="عرض الموظفون الحاضرون"
>
```

### 6.3 Focus Management

- Modal traps focus when open
- Body scroll is locked when modal is open
- Focus returns to trigger element when modal closes

---

## 7. Performance Optimizations

### 7.1 Lazy Loading

- Modal data is **only** fetched when the modal is opened
- Reduces initial page load time
- Minimizes unnecessary API calls

### 7.2 Conditional Rendering

```tsx
{!isLoading && data && data.length > 0 && (
  <div className="flex flex-col gap-3">
    {data.map((item, index) => renderItem(item, index))}
  </div>
)}
```

### 7.3 Memoization (Future Enhancement)

Consider using `useMemo` for expensive computations:

```typescript
const sortedEmployees = useMemo(() => {
  return modalData?.sort((a, b) => b.minutesLate - a.minutesLate);
}, [modalData]);
```

---

## 8. Testing Checklist

### 8.1 Functional Testing

- [ ] Click "Total Employees" card → Navigates to `/employees`
- [ ] Click "Today's Attendance" card → Opens Present modal
- [ ] Click "Total Absences" card → Opens Absent modal
- [ ] Click "Late Minutes" card → Opens Late modal
- [ ] Click "Due Salaries" card → No action (static)
- [ ] Click "Overtime" card → No action (static)
- [ ] Press Escape → Closes modal
- [ ] Click overlay → Closes modal
- [ ] Click X button → Closes modal

### 8.2 Visual Testing

- [ ] Hover effects work on clickable cards only
- [ ] Loading spinner displays correctly
- [ ] Empty state displays correctly
- [ ] Modal animations are smooth
- [ ] Dashed inner borders are visible
- [ ] Brand colors are consistent

### 8.3 Responsive Testing

- [ ] Desktop (1920x1080) → 3 columns
- [ ] Tablet (768x1024) → 2 columns
- [ ] Mobile (375x667) → 1 column
- [ ] Modal is scrollable on small screens

### 8.4 Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces modal title
- [ ] Focus is trapped in modal
- [ ] Body scroll is locked when modal is open

---

## 9. Future Enhancements

### 9.1 Search & Filter

Add search input to modals:

```tsx
<input
  type="text"
  placeholder="ابحث عن موظف..."
  className="w-full p-3 rounded-xl border border-[#263544]/20"
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

### 9.2 Export Functionality

Add export button to modal footer:

```tsx
<button onClick={handleExport}>
  <Download size={16} />
  تصدير إلى Excel
</button>
```

### 9.3 Real-time Updates

Use WebSocket to update modal data in real-time:

```typescript
useEffect(() => {
  const socket = new WebSocket('ws://api.example.com/attendance');
  
  socket.onmessage = (event) => {
    const updatedData = JSON.parse(event.data);
    setModalData(updatedData);
  };
  
  return () => socket.close();
}, [activeModal]);
```

### 9.4 Pagination

For large datasets (500+ employees):

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

---

## 10. Troubleshooting

### Issue: Modal doesn't open

**Solution:** Check that `activeModal` state is being set correctly:

```typescript
console.log('Active modal:', activeModal); // Should be 'present', 'absent', or 'late'
```

### Issue: Loading spinner never stops

**Solution:** Ensure `setIsModalLoading(false)` is called in `finally` block:

```typescript
try {
  // API call
} catch (error) {
  // Error handling
} finally {
  setIsModalLoading(false); // Always called
}
```

### Issue: Empty state shows even with data

**Solution:** Check data structure matches expected type:

```typescript
console.log('Modal data:', modalData);
console.log('Data length:', modalData?.length);
```

### Issue: Hover effects not working

**Solution:** Verify `clickable` property is set correctly:

```typescript
const stats = [
  { 
    title: 'حضور اليوم',
    clickable: true, // Must be true
    onClick: () => handleCardClick('present'),
  },
];
```

---

## 11. Code Comments

The implementation includes comprehensive comments in Arabic and English:

```typescript
/**
 * Lazy data fetching - Only fetch when modal is opened
 * TODO: Replace setTimeout with actual API calls once backend endpoints are ready
 * Expected endpoints:
 * - /api/attendance/today/present
 * - /api/attendance/today/absent
 * - /api/attendance/today/late
 */
```

---

## 12. Summary

This refactoring provides:

✅ **Interactive Dashboard:** 3 clickable KPI cards + 1 navigation card  
✅ **Premium Modals:** Glassmorphism design matching Factory aesthetic  
✅ **Lazy Loading:** Data fetched only when needed  
✅ **Reusable Component:** `GlassModal` can be used across the app  
✅ **Accessibility:** Full keyboard support and ARIA labels  
✅ **Production-Ready:** Clean code with comprehensive comments  
✅ **Type-Safe:** Full TypeScript support with proper interfaces  

**Next Steps:**
1. Backend team implements the 3 API endpoints (see `DASHBOARD_MODAL_BACKEND_REQUIREMENTS.md`)
2. Replace mock data with real API calls in `fetchModalData()`
3. Test with production data
4. Deploy to staging environment

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-25  
**Author:** AI Full-Stack Architect
