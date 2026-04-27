# Employee Profile Expansion - Backend Requirements Report

## Executive Summary

This document outlines the **missing database schema fields**, **new API endpoints**, and **TypeScript interface updates** needed to support the expanded Employee Profile Page with interactive drill-downs for salary breakdowns.

---

## 1. Missing Schema Fields in Employee Model

### Current Employee Schema Issues:
The current `Employee` interface has `profession` but lacks a dedicated `jobTitle` field. Additionally, there are no fields for bus subscription tracking.

### Required New Fields:

| Field Name | Type | Description | Example Values | Required |
|------------|------|-------------|----------------|----------|
| `jobTitle` | `string` | Official job title in Arabic (الوظيفة) | "خياط رئيسي", "مشرف إنتاج", "عامل قص" | No |
| `busSubscription` | `boolean` | Whether employee subscribes to company bus | `true`, `false` | No (default: false) |
| `busRoute` | `string` | Bus route name if subscribed | "خط الميدان", "خط المزة", "خط الزبلطاني" | No (null if not subscribed) |
| `busSubscriptionFee` | `number` | Monthly bus subscription fee | `50000`, `75000` | No (0 if not subscribed) |

### Updated Employee Schema:

```typescript
export interface Employee {
  id?: string;
  _id?: string;
  employeeId: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string | null;
  nationalId?: string | null;
  employmentStartDate?: string | null;
  terminationDate?: string | null;
  department?: string;
  profession?: string;
  jobTitle?: string; // NEW: الوظيفة
  roleId?: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  hourlyRate?: number | string | { $numberDecimal: string };
  scheduledStart?: string;
  scheduledEnd?: string;
  avatar?: string;
  currency?: string;
  busSubscription?: boolean; // NEW: مشترك بالباص
  busRoute?: string | null; // NEW: خط الباص
  busSubscriptionFee?: number; // NEW: رسم الاشتراك
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 2. Missing API Routes for Modal Drill-downs

### 2.1 Detailed Bonuses/Allowances Breakdown

**Purpose:** Retrieve a detailed breakdown of all bonuses and allowances for an employee in the current month.

| Property | Value |
|----------|-------|
| **Route** | `/api/employees/:employeeId/salary/bonuses` |
| **HTTP Method** | `GET` |
| **Query Params** | `year` (optional, YYYY, defaults to current year)<br>`month` (optional, 1-12, defaults to current month) |
| **Authentication** | Required (Bearer token) |

**Expected JSON Response Structure:**

```json
{
  "employeeId": "EMP012",
  "employeeName": "محمد أحمد الخطيب",
  "period": "2026-04",
  "summary": {
    "totalBonuses": 450000,
    "itemCount": 5
  },
  "breakdown": [
    {
      "id": "bonus-001",
      "type": "extra_effort",
      "nameAr": "مكافأة الجهد الإضافي",
      "nameEn": "Extra Effort Bonus",
      "amount": 150000,
      "date": "2026-04-15",
      "notes": "تجاوز الهدف الإنتاجي بنسبة 25%",
      "isRecurring": false
    },
    {
      "id": "allowance-001",
      "type": "responsibility",
      "nameAr": "بدل مسؤولية",
      "nameEn": "Responsibility Allowance",
      "amount": 100000,
      "date": "2026-04-01",
      "notes": "بدل شهري ثابت لمشرف الخط",
      "isRecurring": true
    },
    {
      "id": "allowance-002",
      "type": "living_cost",
      "nameAr": "بدل غلاء معيشة",
      "nameEn": "Living Cost Allowance",
      "amount": 75000,
      "date": "2026-04-01",
      "notes": "بدل شهري ثابت",
      "isRecurring": true
    },
    {
      "id": "allowance-003",
      "type": "insurance",
      "nameAr": "بدل تأمين صحي",
      "nameEn": "Health Insurance Allowance",
      "amount": 50000,
      "date": "2026-04-01",
      "notes": "تغطية تأمينية شهرية",
      "isRecurring": true
    },
    {
      "id": "allowance-004",
      "type": "food_clothing",
      "nameAr": "بدل طعام وكسوة",
      "nameEn": "Food & Clothing Allowance",
      "amount": 75000,
      "date": "2026-04-01",
      "notes": "بدل شهري ثابت",
      "isRecurring": true
    }
  ]
}
```

**Key Fields:**
- `type`: Bonus/allowance type identifier
- `nameAr`: Arabic display name
- `nameEn`: English display name (for reference)
- `amount`: Amount in Syrian Pounds
- `date`: Date bonus/allowance was issued
- `notes`: Additional notes or reason
- `isRecurring`: Whether this is a monthly recurring item

**Bonus/Allowance Types:**
- `extra_effort` - مكافأة الجهد الإضافي
- `responsibility` - بدل مسؤولية
- `living_cost` - بدل غلاء معيشة
- `insurance` - بدل تأمين صحي
- `food_clothing` - بدل طعام وكسوة
- `transport` - بدل مواصلات
- `production_incentive` - حافز إنتاج
- `quality_bonus` - مكافأة جودة
- `attendance_bonus` - مكافأة التزام بالحضور

---

### 2.2 Detailed Deductions Breakdown

**Purpose:** Retrieve a detailed breakdown of all deductions for an employee in the current month.

| Property | Value |
|----------|-------|
| **Route** | `/api/employees/:employeeId/salary/deductions` |
| **HTTP Method** | `GET` |
| **Query Params** | `year` (optional, YYYY, defaults to current year)<br>`month` (optional, 1-12, defaults to current month) |
| **Authentication** | Required (Bearer token) |

**Expected JSON Response Structure:**

```json
{
  "employeeId": "EMP012",
  "employeeName": "محمد أحمد الخطيب",
  "period": "2026-04",
  "summary": {
    "totalDeductions": 285000,
    "itemCount": 4,
    "byCategory": {
      "lateness": 45000,
      "penalties": 150000,
      "unpaidLeaves": 90000,
      "other": 0
    }
  },
  "breakdown": [
    {
      "id": "deduction-001",
      "type": "lateness",
      "nameAr": "خصم تأخير",
      "nameEn": "Lateness Deduction",
      "amount": 45000,
      "date": "2026-04-20",
      "details": {
        "totalLateMinutes": 180,
        "lateDays": 6,
        "deductionRate": 250
      },
      "notes": "خصم عن 180 دقيقة تأخير (6 أيام)",
      "severity": "minor"
    },
    {
      "id": "deduction-002",
      "type": "penalty",
      "nameAr": "عقوبة تأديبية",
      "nameEn": "Disciplinary Penalty",
      "amount": 150000,
      "date": "2026-04-18",
      "details": {
        "penaltyId": "PEN-2026-04-012",
        "reason": "إهمال في العمل أدى لتلف مواد",
        "severity": "severe",
        "issuedBy": "مدير الإنتاج"
      },
      "notes": "خصم على دفعتين (75,000 × 2)",
      "severity": "severe"
    },
    {
      "id": "deduction-003",
      "type": "unpaid_leave",
      "nameAr": "إجازة بدون راتب",
      "nameEn": "Unpaid Leave",
      "amount": 90000,
      "date": "2026-04-10",
      "details": {
        "leaveDays": 3,
        "dailyRate": 30000,
        "leaveStartDate": "2026-04-10",
        "leaveEndDate": "2026-04-12"
      },
      "notes": "إجازة بدون راتب لمدة 3 أيام",
      "severity": "minor"
    }
  ]
}
```

**Key Fields:**
- `type`: Deduction type identifier
- `nameAr`: Arabic display name
- `nameEn`: English display name (for reference)
- `amount`: Deduction amount in Syrian Pounds
- `date`: Date deduction was applied
- `details`: Type-specific details object
- `notes`: Additional notes or explanation
- `severity`: "minor" | "moderate" | "severe"

**Deduction Types:**
- `lateness` - خصم تأخير
- `penalty` - عقوبة تأديبية
- `unpaid_leave` - إجازة بدون راتب
- `absence` - خصم غياب
- `damage` - خصم تلفيات
- `advance_installment` - قسط سلفة (already handled separately)
- `social_security` - اشتراك ضمان اجتماعي
- `tax` - ضريبة دخل

---

## 3. TypeScript Interface Definitions

### 3.1 Updated Employee Interface

```typescript
/**
 * Employee model with new fields for job title and bus subscription
 */
export interface Employee {
  id?: string;
  _id?: string;
  employeeId: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string | null;
  nationalId?: string | null;
  employmentStartDate?: string | null;
  terminationDate?: string | null;
  department?: string;
  profession?: string;
  jobTitle?: string; // NEW: Official job title (الوظيفة)
  roleId?: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  hourlyRate?: number | string | { $numberDecimal: string };
  scheduledStart?: string;
  scheduledEnd?: string;
  avatar?: string;
  currency?: string;
  busSubscription?: boolean; // NEW: Bus subscription status
  busRoute?: string | null; // NEW: Bus route name
  busSubscriptionFee?: number; // NEW: Monthly bus fee
  createdAt?: string;
  updatedAt?: string;
}
```

---

### 3.2 Bonus/Allowance Breakdown Interfaces

```typescript
/**
 * Types of bonuses and allowances
 */
export type BonusAllowanceType =
  | 'extra_effort'
  | 'responsibility'
  | 'living_cost'
  | 'insurance'
  | 'food_clothing'
  | 'transport'
  | 'production_incentive'
  | 'quality_bonus'
  | 'attendance_bonus';

/**
 * Individual bonus or allowance item
 */
export interface BonusAllowanceItem {
  id: string;
  type: BonusAllowanceType;
  nameAr: string;
  nameEn: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  isRecurring: boolean;
}

/**
 * Response structure for bonuses/allowances breakdown
 */
export interface BonusesBreakdownResponse {
  employeeId: string;
  employeeName: string;
  period: string; // YYYY-MM
  summary: {
    totalBonuses: number;
    itemCount: number;
  };
  breakdown: BonusAllowanceItem[];
}
```

---

### 3.3 Deduction Breakdown Interfaces

```typescript
/**
 * Types of deductions
 */
export type DeductionType =
  | 'lateness'
  | 'penalty'
  | 'unpaid_leave'
  | 'absence'
  | 'damage'
  | 'advance_installment'
  | 'social_security'
  | 'tax';

/**
 * Severity levels for deductions
 */
export type DeductionSeverity = 'minor' | 'moderate' | 'severe';

/**
 * Details for lateness deduction
 */
export interface LatenessDeductionDetails {
  totalLateMinutes: number;
  lateDays: number;
  deductionRate: number; // Amount per minute
}

/**
 * Details for penalty deduction
 */
export interface PenaltyDeductionDetails {
  penaltyId: string;
  reason: string;
  severity: 'minor' | 'moderate' | 'severe';
  issuedBy: string;
}

/**
 * Details for unpaid leave deduction
 */
export interface UnpaidLeaveDeductionDetails {
  leaveDays: number;
  dailyRate: number;
  leaveStartDate: string; // YYYY-MM-DD
  leaveEndDate: string; // YYYY-MM-DD
}

/**
 * Individual deduction item
 */
export interface DeductionItem {
  id: string;
  type: DeductionType;
  nameAr: string;
  nameEn: string;
  amount: number;
  date: string; // YYYY-MM-DD
  details?: LatenessDeductionDetails | PenaltyDeductionDetails | UnpaidLeaveDeductionDetails | Record<string, any>;
  notes?: string;
  severity: DeductionSeverity;
}

/**
 * Response structure for deductions breakdown
 */
export interface DeductionsBreakdownResponse {
  employeeId: string;
  employeeName: string;
  period: string; // YYYY-MM
  summary: {
    totalDeductions: number;
    itemCount: number;
    byCategory: {
      lateness: number;
      penalties: number;
      unpaidLeaves: number;
      other: number;
    };
  };
  breakdown: DeductionItem[];
}
```

---

## 4. Database Requirements

### 4.1 Schema Changes

#### Employees Collection:
```javascript
{
  employeeId: String,
  name: String,
  // ... existing fields ...
  jobTitle: String, // NEW
  busSubscription: { type: Boolean, default: false }, // NEW
  busRoute: String, // NEW
  busSubscriptionFee: { type: Number, default: 0 }, // NEW
}
```

#### Bonuses/Allowances Collection (if not exists):
```javascript
{
  bonusId: String,
  employeeId: String,
  type: String, // enum: BonusAllowanceType
  nameAr: String,
  nameEn: String,
  amount: Number,
  date: Date,
  period: String, // YYYY-MM
  notes: String,
  isRecurring: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Deductions Collection (if not exists):
```javascript
{
  deductionId: String,
  employeeId: String,
  type: String, // enum: DeductionType
  nameAr: String,
  nameEn: String,
  amount: Number,
  date: Date,
  period: String, // YYYY-MM
  details: Object, // Type-specific details
  notes: String,
  severity: String, // enum: minor, moderate, severe
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Required Queries

#### Query 1: Get Bonuses Breakdown
```javascript
// Pseudo-code
const getBonusesBreakdown = async (employeeId, year, month) => {
  const period = `${year}-${String(month).padStart(2, '0')}`;
  
  const bonuses = await Bonus.find({
    employeeId,
    period
  }).sort({ date: -1 });
  
  const totalBonuses = bonuses.reduce((sum, item) => sum + item.amount, 0);
  
  return {
    employeeId,
    period,
    summary: {
      totalBonuses,
      itemCount: bonuses.length
    },
    breakdown: bonuses
  };
};
```

#### Query 2: Get Deductions Breakdown
```javascript
// Pseudo-code
const getDeductionsBreakdown = async (employeeId, year, month) => {
  const period = `${year}-${String(month).padStart(2, '0')}`;
  
  const deductions = await Deduction.find({
    employeeId,
    period
  }).sort({ date: -1 });
  
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  
  const byCategory = {
    lateness: deductions.filter(d => d.type === 'lateness').reduce((sum, d) => sum + d.amount, 0),
    penalties: deductions.filter(d => d.type === 'penalty').reduce((sum, d) => sum + d.amount, 0),
    unpaidLeaves: deductions.filter(d => d.type === 'unpaid_leave').reduce((sum, d) => sum + d.amount, 0),
    other: deductions.filter(d => !['lateness', 'penalty', 'unpaid_leave'].includes(d.type)).reduce((sum, d) => sum + d.amount, 0)
  };
  
  return {
    employeeId,
    period,
    summary: {
      totalDeductions,
      itemCount: deductions.length,
      byCategory
    },
    breakdown: deductions
  };
};
```

### 4.3 Indexes

**Recommended Indexes:**
- `employees(employeeId)` - Primary key
- `bonuses(employeeId, period)` - Compound index for fast monthly queries
- `deductions(employeeId, period)` - Compound index for fast monthly queries
- `bonuses(date)` - For date-based queries
- `deductions(date)` - For date-based queries

---

## 5. Business Logic Considerations

### 5.1 Bonus/Allowance Calculation
- **Recurring items** (e.g., responsibility allowance) should be automatically added each month
- **One-time bonuses** (e.g., extra effort) are manually added by HR
- Total bonuses = Sum of all bonus/allowance amounts for the period

### 5.2 Deduction Calculation

**Lateness Deduction:**
```javascript
latenessDeduction = totalLateMinutes * deductionRatePerMinute
// Example: 180 minutes × 250 ل.س/minute = 45,000 ل.س
```

**Unpaid Leave Deduction:**
```javascript
unpaidLeaveDeduction = leaveDays * dailyRate
// Example: 3 days × 30,000 ل.س/day = 90,000 ل.س
```

**Penalty Deduction:**
- Applied based on severity and company policy
- Can be split into multiple installments
- Linked to penalty records in penalties collection

### 5.3 Bus Subscription
- If `busSubscription = true`, display badge with route name
- Bus fee can be deducted from salary or paid separately
- Route names should be standardized (e.g., "خط الميدان", "خط المزة")

---

## 6. Testing Checklist

### Employee Schema:
- [ ] Test with employees who have `jobTitle` set
- [ ] Test with employees who have `busSubscription = true`
- [ ] Test with employees who have `busSubscription = false`
- [ ] Test with employees who have no bus route (null)

### Bonuses Breakdown:
- [ ] Test with employee who has multiple bonuses
- [ ] Test with employee who has no bonuses
- [ ] Test with recurring vs one-time bonuses
- [ ] Test with different bonus types

### Deductions Breakdown:
- [ ] Test with employee who has multiple deductions
- [ ] Test with employee who has no deductions
- [ ] Test with different deduction types
- [ ] Test with different severity levels
- [ ] Test lateness calculation logic
- [ ] Test unpaid leave calculation logic

---

## 7. Summary

To enable the expanded Employee Profile Page with interactive drill-downs, the backend team needs to:

1. **Add 4 new fields** to the Employee model (jobTitle, busSubscription, busRoute, busSubscriptionFee)
2. **Implement 2 new API endpoints**:
   - `/api/employees/:employeeId/salary/bonuses` - Bonuses breakdown
   - `/api/employees/:employeeId/salary/deductions` - Deductions breakdown
3. **Create/update database collections** for bonuses and deductions
4. **Implement calculation logic** for lateness, unpaid leaves, and penalties

The frontend will call these endpoints **lazily** (only when modals are opened) to maintain performance.

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-25  
**Author:** AI Full-Stack Architect
