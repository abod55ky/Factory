# Dashboard Expansion - Backend Requirements Report

## Executive Summary

This document outlines the **missing backend API endpoints** and **TypeScript interface definitions** needed to support the expanded dashboard features:
1. **Today's Overtime Employees** (موظفو العمل الإضافي اليوم)
2. **Monthly Salary Advances** (السلف المأخوذة هذا الشهر)
3. **Recent Penalties** (العقوبات الأخيرة)

---

## 1. Missing API Routes

### 1.1 Today's Overtime Employees

**Purpose:** Retrieve a list of all employees who worked overtime today, including their overtime minutes and calculated overtime pay.

| Property | Value |
|----------|-------|
| **Route** | `/api/attendance/today/overtime` |
| **HTTP Method** | `GET` |
| **Query Params** | `date` (optional, YYYY-MM-DD, defaults to today)<br>`minMinutes` (optional, minimum overtime minutes to include, defaults to 1) |
| **Authentication** | Required (Bearer token) |

**Expected JSON Response Structure:**

```json
{
  "date": "2026-04-25",
  "summary": {
    "totalEmployees": 18,
    "totalOvertimeMinutes": 540,
    "totalOvertimePay": 125000
  },
  "employees": [
    {
      "employeeId": "EMP012",
      "name": "محمد أحمد الخطيب",
      "department": "الخياطة",
      "profession": "خياط رئيسي",
      "scheduledEnd": "16:00",
      "actualCheckOut": "18:30",
      "overtimeMinutes": 150,
      "overtimeHours": 2.5,
      "hourlyRate": 5000,
      "overtimePay": 12500,
      "avatar": "https://example.com/avatar.jpg"
    },
    {
      "employeeId": "EMP025",
      "name": "فاطمة حسن العلي",
      "department": "القص",
      "profession": "عاملة قص",
      "scheduledEnd": "16:00",
      "actualCheckOut": "17:45",
      "overtimeMinutes": 105,
      "overtimeHours": 1.75,
      "hourlyRate": 4500,
      "overtimePay": 7875,
      "avatar": null
    }
  ]
}
```

**Key Fields:**
- `employeeId`: Unique employee identifier
- `name`: Full employee name
- `department`: Department name (e.g., الخياطة, القص, الكي, التعبئة)
- `profession`: Job title/role
- `scheduledEnd`: Expected end time (HH:mm format)
- `actualCheckOut`: Actual check-out time (HH:mm format)
- `overtimeMinutes`: Calculated overtime minutes (integer)
- `overtimeHours`: Overtime in hours (decimal, for display)
- `hourlyRate`: Employee's hourly rate (number)
- `overtimePay`: Calculated overtime payment (number)
- `avatar`: Profile picture URL (optional)

**Business Logic:**
```javascript
overtimeMinutes = max(0, actualCheckOutMinutes - scheduledEndMinutes)
overtimeHours = overtimeMinutes / 60
overtimePay = overtimeHours * hourlyRate
```

---

### 1.2 Monthly Salary Advances

**Purpose:** Retrieve a list of all salary advances (سلف) taken by employees in the current month.

| Property | Value |
|----------|-------|
| **Route** | `/api/finances/advances/monthly` |
| **HTTP Method** | `GET` |
| **Query Params** | `year` (optional, YYYY, defaults to current year)<br>`month` (optional, 1-12, defaults to current month)<br>`status` (optional, "pending" \| "approved" \| "rejected", defaults to "approved") |
| **Authentication** | Required (Bearer token) |

**Expected JSON Response Structure:**

```json
{
  "year": 2026,
  "month": 4,
  "monthName": "أبريل",
  "summary": {
    "totalAdvances": 12,
    "totalAmount": 3500000,
    "averageAmount": 291666
  },
  "advances": [
    {
      "advanceId": "ADV-2026-04-001",
      "employeeId": "EMP008",
      "name": "خالد محمود السيد",
      "department": "الكي",
      "profession": "عامل كي",
      "amount": 500000,
      "requestDate": "2026-04-05",
      "approvalDate": "2026-04-06",
      "reason": "ظروف عائلية طارئة",
      "status": "approved",
      "repaymentStatus": "pending",
      "remainingBalance": 500000,
      "avatar": null
    },
    {
      "advanceId": "ADV-2026-04-002",
      "employeeId": "EMP019",
      "name": "سارة عبدالله النجار",
      "department": "التعبئة",
      "profession": "مشرفة تعبئة",
      "amount": 350000,
      "requestDate": "2026-04-10",
      "approvalDate": "2026-04-11",
      "reason": "مصاريف تعليمية",
      "status": "approved",
      "repaymentStatus": "partial",
      "remainingBalance": 175000,
      "avatar": "https://example.com/avatar2.jpg"
    }
  ]
}
```

**Key Fields:**
- `advanceId`: Unique advance identifier
- `employeeId`: Employee identifier
- `name`: Full employee name
- `department`: Department name
- `profession`: Job title/role
- `amount`: Advance amount (number, in Syrian Pounds)
- `requestDate`: Date advance was requested (YYYY-MM-DD)
- `approvalDate`: Date advance was approved (YYYY-MM-DD)
- `reason`: Reason for advance request (string)
- `status`: "pending" | "approved" | "rejected"
- `repaymentStatus`: "pending" | "partial" | "completed"
- `remainingBalance`: Amount still owed (number)
- `avatar`: Profile picture URL (optional)

---

### 1.3 Recent Penalties

**Purpose:** Retrieve a list of recent employee penalties (عقوبات) for disciplinary actions.

| Property | Value |
|----------|-------|
| **Route** | `/api/hr/penalties/recent` |
| **HTTP Method** | `GET` |
| **Query Params** | `days` (optional, number of days to look back, defaults to 30)<br>`limit` (optional, max results, defaults to 20)<br>`severity` (optional, "minor" \| "moderate" \| "severe") |
| **Authentication** | Required (Bearer token) |

**Expected JSON Response Structure:**

```json
{
  "period": {
    "startDate": "2026-03-26",
    "endDate": "2026-04-25",
    "days": 30
  },
  "summary": {
    "totalPenalties": 8,
    "totalAmount": 450000,
    "bySeverity": {
      "minor": 3,
      "moderate": 4,
      "severe": 1
    }
  },
  "penalties": [
    {
      "penaltyId": "PEN-2026-04-015",
      "employeeId": "EMP033",
      "name": "أحمد علي الحسن",
      "department": "الخياطة",
      "profession": "خياط",
      "reason": "تأخر متكرر (3 مرات في أسبوع)",
      "severity": "moderate",
      "amount": 75000,
      "date": "2026-04-20",
      "issuedBy": "مدير الموارد البشرية",
      "status": "active",
      "notes": "تحذير نهائي قبل الإجراء التأديبي",
      "avatar": null
    },
    {
      "penaltyId": "PEN-2026-04-012",
      "employeeId": "EMP047",
      "name": "ليلى محمد الشامي",
      "department": "القص",
      "profession": "عاملة قص",
      "reason": "إهمال في العمل أدى لتلف مواد",
      "severity": "severe",
      "amount": 150000,
      "date": "2026-04-18",
      "issuedBy": "مدير الإنتاج",
      "status": "active",
      "notes": "خصم من الراتب على دفعتين",
      "avatar": "https://example.com/avatar3.jpg"
    },
    {
      "penaltyId": "PEN-2026-04-008",
      "employeeId": "EMP021",
      "name": "عمر خالد الدين",
      "department": "الكي",
      "profession": "عامل كي",
      "reason": "مخالفة قواعد السلامة",
      "severity": "minor",
      "amount": 25000,
      "date": "2026-04-15",
      "issuedBy": "مشرف السلامة",
      "status": "active",
      "notes": "تحذير شفهي مع خصم رمزي",
      "avatar": null
    }
  ]
}
```

**Key Fields:**
- `penaltyId`: Unique penalty identifier
- `employeeId`: Employee identifier
- `name`: Full employee name
- `department`: Department name
- `profession`: Job title/role
- `reason`: Detailed reason for penalty (string)
- `severity`: "minor" | "moderate" | "severe"
- `amount`: Penalty amount (number, in Syrian Pounds)
- `date`: Date penalty was issued (YYYY-MM-DD)
- `issuedBy`: Name/title of person who issued penalty
- `status`: "active" | "waived" | "completed"
- `notes`: Additional notes (optional)
- `avatar`: Profile picture URL (optional)

---

## 2. TypeScript Interface Definitions

### 2.1 Overtime Employee Interface

```typescript
/**
 * Represents an employee who worked overtime on a specific date
 */
export interface OvertimeEmployee {
  employeeId: string;
  name: string;
  department: string;
  profession: string;
  scheduledEnd: string; // HH:mm format
  actualCheckOut: string; // HH:mm format
  overtimeMinutes: number;
  overtimeHours: number; // Decimal (e.g., 2.5 hours)
  hourlyRate: number;
  overtimePay: number;
  avatar?: string;
}

/**
 * Response structure for overtime employees endpoint
 */
export interface OvertimeEmployeesResponse {
  date: string; // YYYY-MM-DD
  summary: {
    totalEmployees: number;
    totalOvertimeMinutes: number;
    totalOvertimePay: number;
  };
  employees: OvertimeEmployee[];
}
```

### 2.2 Salary Advance Interface

```typescript
/**
 * Represents a salary advance (سلفة) taken by an employee
 */
export interface SalaryAdvance {
  advanceId: string;
  employeeId: string;
  name: string;
  department: string;
  profession: string;
  amount: number; // In Syrian Pounds
  requestDate: string; // YYYY-MM-DD
  approvalDate: string; // YYYY-MM-DD
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  repaymentStatus: 'pending' | 'partial' | 'completed';
  remainingBalance: number;
  avatar?: string;
}

/**
 * Response structure for monthly advances endpoint
 */
export interface MonthlyAdvancesResponse {
  year: number;
  month: number; // 1-12
  monthName: string; // Arabic month name
  summary: {
    totalAdvances: number;
    totalAmount: number;
    averageAmount: number;
  };
  advances: SalaryAdvance[];
}
```

### 2.3 Employee Penalty Interface

```typescript
/**
 * Severity levels for employee penalties
 */
export type PenaltySeverity = 'minor' | 'moderate' | 'severe';

/**
 * Status of a penalty
 */
export type PenaltyStatus = 'active' | 'waived' | 'completed';

/**
 * Represents an employee penalty (عقوبة)
 */
export interface EmployeePenalty {
  penaltyId: string;
  employeeId: string;
  name: string;
  department: string;
  profession: string;
  reason: string;
  severity: PenaltySeverity;
  amount: number; // In Syrian Pounds
  date: string; // YYYY-MM-DD
  issuedBy: string;
  status: PenaltyStatus;
  notes?: string;
  avatar?: string;
}

/**
 * Response structure for recent penalties endpoint
 */
export interface RecentPenaltiesResponse {
  period: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    days: number;
  };
  summary: {
    totalPenalties: number;
    totalAmount: number;
    bySeverity: {
      minor: number;
      moderate: number;
      severe: number;
    };
  };
  penalties: EmployeePenalty[];
}
```

---

## 3. Database Requirements

### 3.1 Schema Overview

The backend needs to efficiently query and join the following collections/tables:

1. **Employees Collection** (`employees`)
   - Fields: `employeeId`, `name`, `department`, `profession`, `hourlyRate`, `scheduledEnd`, `avatar`
   - Index: `employeeId` (primary), `department` (for filtering)

2. **Attendance Records Collection** (`attendance`)
   - Fields: `employeeId`, `date`, `timestamp`, `type` (IN/OUT), `scheduledEnd`
   - Index: Compound index on `(employeeId, date)` for fast daily lookups
   - Index: `date` (for filtering by specific date)

3. **Salary Advances Collection** (`advances`)
   - Fields: `advanceId`, `employeeId`, `amount`, `requestDate`, `approvalDate`, `reason`, `status`, `repaymentStatus`, `remainingBalance`
   - Index: Compound index on `(approvalDate, status)` for monthly queries
   - Index: `employeeId` (for employee-specific queries)

4. **Penalties Collection** (`penalties`)
   - Fields: `penaltyId`, `employeeId`, `reason`, `severity`, `amount`, `date`, `issuedBy`, `status`, `notes`
   - Index: `date` (for recent queries)
   - Index: Compound index on `(date, severity)` for filtered queries
   - Index: `employeeId` (for employee-specific queries)

### 3.2 Required Queries

#### Query 1: Today's Overtime Employees
```javascript
// Pseudo-code logic
const today = "2026-04-25";

// Step 1: Get all attendance records for today with type="OUT"
const checkOutRecords = await Attendance.find({
  date: today,
  type: "OUT"
}).populate("employeeId"); // Join with employee data

// Step 2: For each record, calculate overtime
const overtimeEmployees = checkOutRecords
  .map(record => {
    const employee = record.employeeId; // Populated employee object
    const scheduledEnd = parseTime(employee.scheduledEnd); // e.g., "16:00"
    const actualCheckOut = parseTime(record.timestamp); // e.g., "18:30"
    
    const overtimeMinutes = calculateMinutesDifference(scheduledEnd, actualCheckOut);
    
    if (overtimeMinutes <= 0) return null; // No overtime
    
    return {
      ...employee,
      actualCheckOut: formatTime(record.timestamp),
      overtimeMinutes,
      overtimeHours: overtimeMinutes / 60,
      overtimePay: (overtimeMinutes / 60) * employee.hourlyRate
    };
  })
  .filter(emp => emp !== null)
  .sort((a, b) => b.overtimeMinutes - a.overtimeMinutes); // Sort by most overtime first
```

**Database Operations:**
- Fetch attendance records for today with `type="OUT"`
- Join with employees collection on `employeeId`
- Calculate overtime minutes by comparing `scheduledEnd` vs actual `checkOut` time
- Filter employees where `overtimeMinutes > 0`
- Sort by `overtimeMinutes` descending

---

#### Query 2: Monthly Salary Advances
```javascript
// Pseudo-code logic
const year = 2026;
const month = 4; // April

// Calculate date range for the month
const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
const endDate = `${year}-${String(month).padStart(2, '0')}-30`; // Adjust for month length

// Step 1: Get all approved advances for the month
const advances = await Advance.find({
  approvalDate: { $gte: startDate, $lte: endDate },
  status: "approved"
}).populate("employeeId"); // Join with employee data

// Step 2: Enrich with employee details
const enrichedAdvances = advances.map(advance => ({
  ...advance,
  name: advance.employeeId.name,
  department: advance.employeeId.department,
  profession: advance.employeeId.profession,
  avatar: advance.employeeId.avatar
}));

// Step 3: Calculate summary
const summary = {
  totalAdvances: enrichedAdvances.length,
  totalAmount: enrichedAdvances.reduce((sum, adv) => sum + adv.amount, 0),
  averageAmount: enrichedAdvances.length > 0 
    ? enrichedAdvances.reduce((sum, adv) => sum + adv.amount, 0) / enrichedAdvances.length 
    : 0
};
```

**Database Operations:**
- Filter advances by `approvalDate` within month range
- Filter by `status="approved"`
- Join with employees collection on `employeeId`
- Aggregate total and average amounts
- Sort by `approvalDate` descending

---

#### Query 3: Recent Penalties
```javascript
// Pseudo-code logic
const days = 30;
const today = new Date();
const startDate = new Date(today);
startDate.setDate(today.getDate() - days);

// Step 1: Get all penalties within the date range
const penalties = await Penalty.find({
  date: { $gte: startDate.toISOString().split('T')[0] }
}).populate("employeeId"); // Join with employee data

// Step 2: Enrich with employee details
const enrichedPenalties = penalties.map(penalty => ({
  ...penalty,
  name: penalty.employeeId.name,
  department: penalty.employeeId.department,
  profession: penalty.employeeId.profession,
  avatar: penalty.employeeId.avatar
}));

// Step 3: Calculate summary
const summary = {
  totalPenalties: enrichedPenalties.length,
  totalAmount: enrichedPenalties.reduce((sum, pen) => sum + pen.amount, 0),
  bySeverity: {
    minor: enrichedPenalties.filter(p => p.severity === 'minor').length,
    moderate: enrichedPenalties.filter(p => p.severity === 'moderate').length,
    severe: enrichedPenalties.filter(p => p.severity === 'severe').length
  }
};

// Step 4: Sort by date descending (most recent first)
enrichedPenalties.sort((a, b) => new Date(b.date) - new Date(a.date));
```

**Database Operations:**
- Filter penalties by `date >= (today - days)`
- Join with employees collection on `employeeId`
- Aggregate counts by severity
- Calculate total amount
- Sort by `date` descending

---

## 4. Performance Considerations

### 4.1 Indexes
- Compound index on `attendance(date, type)` for fast overtime queries
- Compound index on `advances(approvalDate, status)` for monthly queries
- Index on `penalties(date)` for recent queries
- Index on `employees(employeeId)` for joins

### 4.2 Caching
- Cache overtime calculations for 5 minutes (data changes infrequently)
- Cache monthly advances for 10 minutes
- Cache recent penalties for 15 minutes

### 4.3 Pagination
- For large datasets (100+ results), implement pagination:
  - Add `page` and `limit` query params
  - Return `pagination` metadata in response

---

## 5. Testing Checklist

### Overtime Employees
- [ ] Test with employees who have no overtime (0 minutes)
- [ ] Test with employees who left early (negative overtime)
- [ ] Test with employees who have no `scheduledEnd` time
- [ ] Test with employees who didn't check out
- [ ] Test with large datasets (100+ employees)

### Monthly Advances
- [ ] Test with months that have no advances
- [ ] Test with different statuses (pending, approved, rejected)
- [ ] Test with partial repayment scenarios
- [ ] Test with year/month boundaries (December to January)

### Recent Penalties
- [ ] Test with no penalties in the period
- [ ] Test with different severity levels
- [ ] Test with different day ranges (7, 30, 90 days)
- [ ] Test with waived/completed penalties

---

## 6. Summary

To enable the expanded dashboard features, the backend team needs to implement **3 new API endpoints** that:

1. **Join** the `employees` collection with `attendance`, `advances`, and `penalties` collections
2. **Calculate** overtime pay, advance summaries, and penalty statistics
3. **Filter** by date ranges, status, and severity
4. **Return** detailed lists with all necessary fields for the UI

The frontend will call these endpoints **lazily** (only when a modal/section is opened) to avoid unnecessary data fetching on initial page load.

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-25  
**Author:** AI Full-Stack Architect
