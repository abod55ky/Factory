# Employee Profile Page - Refactoring Implementation Guide

## Overview

This guide provides the exact changes needed to refactor the Employee Profile Page while **PRESERVING ALL EXISTING BUSINESS LOGIC**.

---

## Phase 1: Backend Requirements ✅

**Document Created:** `docs/EMPLOYEE_PROFILE_EXPANSION_BACKEND_REQUIREMENTS.md`

**Summary:**
- 4 new Employee schema fields (jobTitle, busSubscription, busRoute, busSubscriptionFee)
- 2 new API endpoints for drill-down modals
- Complete TypeScript interfaces for all new data types

---

## Phase 2: Frontend Refactoring

### Step 1: Add New Imports

**Add to existing imports:**
```typescript
import { DataDrilldownModal } from "@/components/DataDrilldownModal";
import { Bus, Briefcase } from "lucide-react";
```

---

### Step 2: Add TypeScript Interfaces

**Add after imports, before component:**
```typescript
// ============================================================================
// TypeScript Interfaces for Drill-down Data
// ============================================================================

/**
 * Individual bonus or allowance item
 */
interface BonusAllowanceItem {
  id: string;
  type: string;
  nameAr: string;
  amount: number;
  date: string;
  notes?: string;
  isRecurring: boolean;
}

/**
 * Individual deduction item
 */
interface DeductionItem {
  id: string;
  type: string;
  nameAr: string;
  amount: number;
  date: string;
  notes?: string;
  severity: 'minor' | 'moderate' | 'severe';
}

/**
 * Modal drill-down type
 */
type DrilldownType = 'bonuses' | 'deductions' | null;
```

---

### Step 3: Add Modal State Management

**Add after existing state declarations (after `const today = useMemo...`):**
```typescript
// Modal state management
const [activeDrilldown, setActiveDrilldown] = useState<DrilldownType>(null);
const [drilldownData, setDrilldownData] = useState<BonusAllowanceItem[] | DeductionItem[] | null>(null);
const [isDrilldownLoading, setIsDrilldownLoading] = useState(false);
```

---

### Step 4: Add Drill-down Data Fetching Function

**Add after `salaryBreakdown` useMemo (BEFORE the return statement):**
```typescript
/**
 * Lazy data fetching for drill-down modals
 * TODO: Replace setTimeout with actual API calls once backend endpoints are ready
 * Expected endpoints:
 * - /api/employees/:employeeId/salary/bonuses
 * - /api/employees/:employeeId/salary/deductions
 */
const fetchDrilldownData = async (type: DrilldownType) => {
  if (!type) return;

  setIsDrilldownLoading(true);
  setDrilldownData(null);

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (type === 'bonuses') {
      // TODO: Replace with: const response = await api.get(`/employees/${employeeId}/salary/bonuses`);
      const mockBonusesData: BonusAllowanceItem[] = [
        {
          id: 'bonus-001',
          type: 'extra_effort',
          nameAr: 'مكافأة الجهد الإضافي',
          amount: 150000,
          date: '2026-04-15',
          notes: 'تجاوز الهدف الإنتاجي بنسبة 25%',
          isRecurring: false,
        },
        {
          id: 'allowance-001',
          type: 'responsibility',
          nameAr: 'بدل مسؤولية',
          amount: 100000,
          date: '2026-04-01',
          notes: 'بدل شهري ثابت لمشرف الخط',
          isRecurring: true,
        },
        {
          id: 'allowance-002',
          type: 'living_cost',
          nameAr: 'بدل غلاء معيشة',
          amount: 75000,
          date: '2026-04-01',
          notes: 'بدل شهري ثابت',
          isRecurring: true,
        },
        {
          id: 'allowance-003',
          type: 'insurance',
          nameAr: 'بدل تأمين صحي',
          amount: 50000,
          date: '2026-04-01',
          notes: 'تغطية تأمينية شهرية',
          isRecurring: true,
        },
        {
          id: 'allowance-004',
          type: 'food_clothing',
          nameAr: 'بدل طعام وكسوة',
          amount: 75000,
          date: '2026-04-01',
          notes: 'بدل شهري ثابت',
          isRecurring: true,
        },
      ];
      setDrilldownData(mockBonusesData);
    } else if (type === 'deductions') {
      // TODO: Replace with: const response = await api.get(`/employees/${employeeId}/salary/deductions`);
      const mockDeductionsData: DeductionItem[] = [
        {
          id: 'deduction-001',
          type: 'lateness',
          nameAr: 'خصم تأخير',
          amount: 45000,
          date: '2026-04-20',
          notes: 'خصم عن 180 دقيقة تأخير (6 أيام)',
          severity: 'minor',
        },
        {
          id: 'deduction-002',
          type: 'penalty',
          nameAr: 'عقوبة تأديبية',
          amount: 150000,
          date: '2026-04-18',
          notes: 'إهمال في العمل أدى لتلف مواد - خصم على دفعتين',
          severity: 'severe',
        },
        {
          id: 'deduction-003',
          type: 'unpaid_leave',
          nameAr: 'إجازة بدون راتب',
          amount: 90000,
          date: '2026-04-10',
          notes: 'إجازة بدون راتب لمدة 3 أيام (10-12 أبريل)',
          severity: 'minor',
        },
      ];
      setDrilldownData(mockDeductionsData);
    }
  } catch (error) {
    console.error('Error fetching drilldown data:', error);
    setDrilldownData([]);
  } finally {
    setIsDrilldownLoading(false);
  }
};

const handleDrilldownClick = (type: DrilldownType) => {
  if (!type) return;
  setActiveDrilldown(type);
  fetchDrilldownData(type);
};

const handleCloseDrilldown = () => {
  setActiveDrilldown(null);
  setDrilldownData(null);
};
```

---

### Step 5: Update Contact Info Section

**FIND this code (around line 250):**
```typescript
const contactPhone = employee.mobile || employee.phone || "—";
const contactIdentity = employee.email || "—";
```

**REPLACE with:**
```typescript
const contactPhone = employee.mobile || employee.phone || "—";
// Email removed - only show phone
```

**FIND this JSX (in the contact info div):**
```tsx
<div className="flex items-center gap-3">
  <div className="p-1.5 bg-[#1a2530] rounded-lg text-[#C89355]"><Phone size={14} /></div>
  <span dir="ltr" className="tracking-wider">{contactPhone}</span>
</div>
<div className="flex items-center gap-3">
  <div className="p-1.5 bg-[#1a2530] rounded-lg text-[#C89355]"><CreditCard size={14} /></div>
  <span className="tracking-wider text-xs">{contactIdentity}</span>
</div>
```

**REPLACE with:**
```tsx
<div className="flex items-center gap-3">
  <div className="p-1.5 bg-[#1a2530] rounded-lg text-[#C89355]"><Phone size={14} /></div>
  <span dir="ltr" className="tracking-wider">{contactPhone}</span>
</div>
{employee.busSubscription && employee.busRoute && (
  <div className="flex items-center gap-3">
    <div className="p-1.5 bg-blue-500 rounded-lg text-white"><Bus size={14} /></div>
    <span className="text-xs">مشترك بالباص - {employee.busRoute}</span>
  </div>
)}
```

---

### Step 6: Add Job Title Badge

**FIND this code (in the employee name section):**
```tsx
<div className="flex flex-wrap items-center gap-3">
  <span className="bg-white/80 backdrop-blur-md text-[#263544] px-3 py-1.5 rounded-xl text-xs font-black border border-white shadow-sm">
    {employee.department || "القسم غير محدد"}
  </span>
  <span className="text-sm font-bold text-slate-500 font-mono tracking-wider">
    #{employee.employeeId}
  </span>
</div>
```

**REPLACE with:**
```tsx
<div className="flex flex-wrap items-center gap-3">
  <span className="bg-white/80 backdrop-blur-md text-[#263544] px-3 py-1.5 rounded-xl text-xs font-black border border-white shadow-sm">
    {employee.department || "القسم غير محدد"}
  </span>
  {employee.jobTitle && (
    <span className="bg-[#C89355]/10 backdrop-blur-md text-[#C89355] px-3 py-1.5 rounded-xl text-xs font-black border border-[#C89355]/20 shadow-sm flex items-center gap-1.5">
      <Briefcase size={12} />
      {employee.jobTitle}
    </span>
  )}
  <span className="text-sm font-bold text-slate-500 font-mono tracking-wider">
    #{employee.employeeId}
  </span>
</div>
```

---

### Step 7: Make "Bonuses & Extra" Card Clickable

**FIND this code (in the salary breakdown grid):**
```tsx
<div className="bg-[#C89355]/10 p-5 rounded-2xl border border-[#C89355]/20 flex items-start justify-between group/box hover:shadow-md transition-shadow">
  <div>
    <p className="text-xs font-black text-[#C89355] mb-1">الإضافي والمكافآت</p>
    <p className="text-2xl font-black text-[#1a2530]">+{formatMoney(salaryBreakdown.extraAndBonuses)}</p>
  </div>
  <div className="p-2 bg-white/50 rounded-lg text-[#C89355]"><TrendingUp size={20} /></div>
</div>
```

**REPLACE with:**
```tsx
<div 
  className="bg-[#C89355]/10 p-5 rounded-2xl border border-[#C89355]/20 flex items-start justify-between group/box hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(200,147,85,0.2)]"
  onClick={() => handleDrilldownClick('bonuses')}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDrilldownClick('bonuses');
    }
  }}
>
  <div>
    <p className="text-xs font-black text-[#C89355] mb-1">الإضافي والمكافآت</p>
    <p className="text-2xl font-black text-[#1a2530]">+{formatMoney(salaryBreakdown.extraAndBonuses)}</p>
  </div>
  <div className="p-2 bg-white/50 rounded-lg text-[#C89355] group-hover/box:scale-110 group-hover/box:rotate-6 transition-transform"><TrendingUp size={20} /></div>
</div>
```

---

### Step 8: Make "Deductions" Card Clickable

**FIND this code:**
```tsx
<div className="bg-rose-50/80 p-5 rounded-2xl border border-rose-100 flex items-start justify-between group/box hover:shadow-md transition-shadow">
  <div>
    <p className="text-xs font-black text-rose-500 mb-1">الخصومات</p>
    <p className="text-2xl font-black text-rose-700">-{formatMoney(salaryBreakdown.deductions)}</p>
  </div>
  <div className="p-2 bg-white/50 rounded-lg text-rose-400"><TrendingDown size={20} /></div>
</div>
```

**REPLACE with:**
```tsx
<div 
  className="bg-rose-50/80 p-5 rounded-2xl border border-rose-100 flex items-start justify-between group/box hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(225,29,72,0.2)]"
  onClick={() => handleDrilldownClick('deductions')}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDrilldownClick('deductions');
    }
  }}
>
  <div>
    <p className="text-xs font-black text-rose-500 mb-1">الخصومات</p>
    <p className="text-2xl font-black text-rose-700">-{formatMoney(salaryBreakdown.deductions)}</p>
  </div>
  <div className="p-2 bg-white/50 rounded-lg text-rose-400 group-hover/box:scale-110 group-hover/box:rotate-6 transition-transform"><TrendingDown size={20} /></div>
</div>
```

---

### Step 9: Add Modals at End of Component

**ADD before the final closing `</div>` tags (before the last 3 closing divs):**
```tsx
{/* Bonuses & Allowances Drill-down Modal */}
<DataDrilldownModal<BonusAllowanceItem>
  isOpen={activeDrilldown === 'bonuses'}
  onClose={handleCloseDrilldown}
  title="تفاصيل الإضافي والمكافآت"
  icon={TrendingUp}
  isLoading={isDrilldownLoading}
  data={drilldownData as BonusAllowanceItem[] | null}
  emptyMessage="لا توجد مكافآت أو بدلات لهذا الشهر"
  emptyIcon={Coins}
  renderItem={(item) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 hover:border-emerald-300 shadow-sm hover:shadow-[0_8px_20px_rgba(16,185,129,0.15)] transition-all duration-300 group"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-700 shadow-md group-hover:scale-110 transition-transform">
          {item.isRecurring ? '🔄' : '⭐'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-[#263544]">{item.nameAr}</p>
          <p className="text-[10px] text-slate-500 mt-1">{item.notes}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl shadow-md border border-emerald-200">
          +{item.amount.toLocaleString()} ل.س
        </span>
        {item.isRecurring && (
          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
            شهري
          </span>
        )}
      </div>
    </div>
  )}
/>

{/* Deductions Drill-down Modal */}
<DataDrilldownModal<DeductionItem>
  isOpen={activeDrilldown === 'deductions'}
  onClose={handleCloseDrilldown}
  title="تفاصيل الخصومات"
  icon={TrendingDown}
  isLoading={isDrilldownLoading}
  data={drilldownData as DeductionItem[] | null}
  emptyMessage="لا توجد خصومات لهذا الشهر"
  emptyIcon={AlertTriangle}
  renderItem={(item) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 hover:border-rose-300 shadow-sm hover:shadow-[0_8px_20px_rgba(225,29,72,0.1)] transition-all duration-300 group"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-md group-hover:scale-110 transition-transform ${
          item.severity === 'severe' 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-700' 
            : item.severity === 'moderate'
            ? 'bg-orange-500/10 border-orange-500/30 text-orange-700'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-700'
        }`}>
          {item.severity === 'severe' ? '⚠️' : item.severity === 'moderate' ? '⚡' : '📋'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-[#263544]">{item.nameAr}</p>
          <p className="text-[10px] text-slate-500 mt-1">{item.notes}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-extrabold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl shadow-md border border-rose-200">
          -{item.amount.toLocaleString()} ل.س
        </span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
          item.severity === 'severe'
            ? 'text-rose-600 bg-rose-50'
            : item.severity === 'moderate'
            ? 'text-orange-600 bg-orange-50'
            : 'text-amber-600 bg-amber-50'
        }`}>
          {item.severity === 'severe' ? 'خطير' : item.severity === 'moderate' ? 'متوسط' : 'بسيط'}
        </span>
      </div>
    </div>
  )}
/>
```

---

## Summary of Changes

### ✅ Preserved (DO NOT MODIFY):
- All `useMemo` hooks (`attendanceSummary`, `salaryBreakdown`, `attendanceRange`)
- All utility functions (`toNumber`, `toMinutes`, `formatMoney`, etc.)
- All existing business logic and calculations
- All existing data fetching hooks

### ✅ Added:
- TypeScript interfaces for drill-down data
- Modal state management (3 state variables)
- Drill-down data fetching function with mock data
- Job title badge display
- Bus subscription badge display
- Interactive hover effects on Bonuses and Deductions cards
- 2 drill-down modals with detailed breakdowns

### ✅ Removed:
- Email address display (kept only phone number)

### ✅ Modified:
- Contact info section (removed email, added bus subscription)
- Employee name section (added job title badge)
- Bonuses card (made clickable)
- Deductions card (made clickable)

---

## Testing Checklist

- [ ] Job title displays correctly when present
- [ ] Job title badge hidden when not present
- [ ] Bus subscription badge displays when subscribed
- [ ] Bus subscription badge hidden when not subscribed
- [ ] Email address is not displayed
- [ ] Phone number displays correctly
- [ ] Bonuses card is clickable with hover effects
- [ ] Deductions card is clickable with hover effects
- [ ] Advances card remains non-clickable
- [ ] Bonuses modal opens with mock data
- [ ] Deductions modal opens with mock data
- [ ] Modals close correctly (X button, Escape, overlay)
- [ ] All existing calculations still work correctly
- [ ] No TypeScript errors

---

**Status:** Implementation Guide Complete  
**Version:** 1.0  
**Date:** 2026-04-25
