# Dashboard Interactive Modals - Backend Requirements Report

## Executive Summary

This document outlines the **missing backend API endpoints** and **database requirements** needed to support the new interactive dashboard modals for:
1. **Present Employees Today** (Active/Checked-in)
2. **Absent Employees Today**
3. **Late Employees Today**

Currently, the `useDashboard()` hook only returns **aggregated KPI counts**. To populate modals with **full detailed employee lists**, we need new dedicated endpoints.

---

## 1. Missing API Routes

### 1.1 Present Employees Today

**Purpose:** Retrieve a list of all employees who have checked in today (present at work).

| Property | Value |
|----------|-------|
| **Route** | `/api/attendance/today/present` |
| **HTTP Method** | `GET` |
| **Query Params** | `date` (optional, YYYY-MM-DD, defaults to today) |
| **Authentication** | Required (Bearer token) |

**Expected JSON Response Structure:**

```json
{
  "date": "2026-04-25",
  "summary": {
    "totalPresent": 45
  },
  "employees": [
    {
      "employeeId": "EMP001",
      "name": "أحمد محمد",
      "department": "الإنتاج",
      "profession": "خياط",
      "checkIn": "08:15",
      "checkOut": "16:30",
      "status": "present",
      "avatar": "https://example.com/avatar.jpg"
    }
  ]
}
```

**Key Fields:**
- `employeeId`: Unique employee identifier
- `name`: Full employee name
- `department`: Department name
- `profession`: Job title/role
- `checkIn`: Time of check-in (HH:mm format)
- `checkOut`: Time of check-out (HH:mm format, null if still working)
- `status`: "present" (for filtering)
- `avatar`: Profile picture URL (optional)

---

### 1.2 Absent Employees Today

**Purpose:** Retrieve a list of all active employees who have NOT checked in today.

| Property | Value |
|----------|-------|
| **Route** | `/api/attendance/today/absent` |
| **HTTP Method** | `GET` |
| **Query Params** | `date` (optional, YYYY-MM-DD, defaults to today) |
| **Authentication** | Required (Bearer token) |

**Expected JSON Response Structure:**

```json
{
  "date": "2026-04-25",
  "summary": {
    "totalAbsent": 8
  },
  "employees": [
    {
      "employeeId": "EMP042",
      "name": "فاطمة علي",
      "department": "التعبئة",
      "profession": "عاملة تعبئة",
      "scheduledStart": "08:00",
      "status": "absent",
      "avatar": null,
      "lastCheckIn": "2026-04-24"
    }
  ]
}
```

**Key Fields:**
- `employeeId`: Unique employee identifier
- `name`: Full employee name
- `department`: Department name
- `profession`: Job title/role
- `scheduledStart`: Expected start time (HH:mm format)
- `status`: "absent" (for filtering)
- `avatar`: Profile picture URL (optional)
- `lastCheckIn`: Last date they checked in (YYYY-MM-DD, for context)

---

### 1.3 Late Employees Today

**Purpose:** Retrieve a list of all employees who checked in late today (after their scheduled start time).

| Property | Value |
|----------|-------|
| **Route** | `/api/attendance/today/late` |
| **HTTP Method** | `GET` |
| **Query Params** | `date` (optional, YYYY-MM-DD, defaults to today)<br>`threshold` (optional, minutes, defaults to 5) |
| **Authentication** | Required (Bearer token) |

**Expected JSON Response Structure:**

```json
{
  "date": "2026-04-25",
  "lateThresholdMinutes": 5,
  "summary": {
    "totalLate": 12,
    "totalLateMinutes": 145
  },
  "employees": [
    {
      "employeeId": "EMP015",
      "name": "محمد خالد",
      "department": "الإنتاج",
      "profession": "مشرف خط",
      "scheduledStart": "08:00",
      "checkIn": "08:23",
      "minutesLate": 23,
      "status": "late",
      "avatar": "https://example.com/avatar2.jpg"
    }
  ]
}
```

**Key Fields:**
- `employeeId`: Unique employee identifier
- `name`: Full employee name
- `department`: Department name
- `profession`: Job title/role
- `scheduledStart`: Expected start time (HH:mm format)
- `checkIn`: Actual check-in time (HH:mm format)
- `minutesLate`: Calculated late minutes (integer)
- `status`: "late" (for filtering)
- `avatar`: Profile picture URL (optional)

---

## 2. Database Requirements

### 2.1 Schema Overview

The backend needs to efficiently query and join the following collections/tables:

1. **Employees Collection** (`employees`)
   - Fields: `employeeId`, `name`, `department`, `profession`, `status`, `scheduledStart`, `scheduledEnd`, `avatar`
   - Index: `employeeId` (primary), `status` (for filtering active employees)

2. **Attendance Records Collection** (`attendance`)
   - Fields: `employeeId`, `date`, `timestamp`, `type` (IN/OUT), `source`, `verified`
   - Index: Compound index on `(employeeId, date)` for fast daily lookups
   - Index: `date` (for filtering by specific date)

### 2.2 Required Queries

#### Query 1: Present Employees Today
```javascript
// Pseudo-code logic
const today = "2026-04-25";

// Step 1: Get all attendance records for today with type="IN"
const checkedInRecords = await Attendance.find({
  date: today,
  type: "IN"
}).distinct("employeeId");

// Step 2: Join with employees collection
const presentEmployees = await Employee.find({
  employeeId: { $in: checkedInRecords },
  status: "active"
}).populate("department", "profession", "avatar");

// Step 3: Enrich with check-in/check-out times
// For each employee, find their first IN and last OUT for today
```

**Database Operations:**
- Filter attendance by `date` and `type="IN"`
- Join with employees on `employeeId`
- Filter employees by `status="active"`
- Aggregate check-in/check-out times per employee

---

#### Query 2: Absent Employees Today
```javascript
// Pseudo-code logic
const today = "2026-04-25";

// Step 1: Get all active employees
const allActiveEmployees = await Employee.find({
  status: "active"
}).select("employeeId name department profession scheduledStart avatar");

// Step 2: Get employees who checked in today
const checkedInToday = await Attendance.find({
  date: today,
  type: "IN"
}).distinct("employeeId");

// Step 3: Filter out employees who checked in (set difference)
const absentEmployees = allActiveEmployees.filter(
  emp => !checkedInToday.includes(emp.employeeId)
);

// Step 4: Optionally enrich with last check-in date
// For each absent employee, find their most recent attendance record
```

**Database Operations:**
- Fetch all active employees
- Fetch distinct employee IDs who checked in today
- Perform set difference (in-memory or via `$nin` query)
- Optional: Aggregate last check-in date per employee

---

#### Query 3: Late Employees Today
```javascript
// Pseudo-code logic
const today = "2026-04-25";
const lateThreshold = 5; // minutes

// Step 1: Get all attendance records for today with type="IN"
const checkInRecords = await Attendance.find({
  date: today,
  type: "IN"
}).populate("employeeId"); // Join with employee data

// Step 2: For each record, calculate late minutes
const lateEmployees = checkInRecords
  .map(record => {
    const employee = record.employeeId; // Populated employee object
    const scheduledStart = parseTime(employee.scheduledStart); // e.g., "08:00"
    const actualCheckIn = parseTime(record.timestamp); // e.g., "08:23"
    
    const minutesLate = calculateMinutesDifference(scheduledStart, actualCheckIn);
    
    return {
      ...employee,
      checkIn: formatTime(record.timestamp),
      minutesLate
    };
  })
  .filter(emp => emp.minutesLate > lateThreshold)
  .sort((a, b) => b.minutesLate - a.minutesLate); // Sort by most late first
```

**Database Operations:**
- Fetch attendance records for today with `type="IN"`
- Join with employees collection on `employeeId`
- Calculate late minutes by comparing `scheduledStart` vs actual `checkIn` time
- Filter employees where `minutesLate > threshold`
- Sort by `minutesLate` descending

**Time Calculation Logic:**
```javascript
// Helper function to calculate late minutes
function calculateMinutesDifference(scheduledStart, actualCheckIn) {
  // scheduledStart: "08:00"
  // actualCheckIn: "08:23"
  
  const [schedHour, schedMin] = scheduledStart.split(":").map(Number);
  const [actualHour, actualMin] = actualCheckIn.split(":").map(Number);
  
  const scheduledMinutes = schedHour * 60 + schedMin;
  const actualMinutes = actualHour * 60 + actualMin;
  
  return Math.max(0, actualMinutes - scheduledMinutes);
}
```

---

### 2.3 Performance Considerations

1. **Indexes:**
   - Compound index on `attendance(date, type)` for fast filtering
   - Index on `employees(status)` for active employee queries
   - Index on `employees(employeeId)` for joins

2. **Caching:**
   - Consider caching the "active employees list" for 5-10 minutes
   - Cache today's attendance records with a 1-minute TTL

3. **Pagination:**
   - For large factories (500+ employees), implement pagination:
     - Add `page` and `limit` query params
     - Return `pagination` metadata in response

4. **Aggregation Pipeline (MongoDB Example):**
   ```javascript
   // Efficient aggregation for late employees
   db.attendance.aggregate([
     { $match: { date: "2026-04-25", type: "IN" } },
     { $lookup: {
         from: "employees",
         localField: "employeeId",
         foreignField: "employeeId",
         as: "employee"
       }
     },
     { $unwind: "$employee" },
     { $match: { "employee.status": "active" } },
     { $project: {
         employeeId: 1,
         name: "$employee.name",
         department: "$employee.department",
         scheduledStart: "$employee.scheduledStart",
         checkIn: { $dateToString: { format: "%H:%M", date: "$timestamp" } },
         minutesLate: {
           $subtract: [
             { $hour: "$timestamp" } * 60 + { $minute: "$timestamp" },
             // Parse scheduledStart and convert to minutes
           ]
         }
       }
     },
     { $match: { minutesLate: { $gt: 5 } } },
     { $sort: { minutesLate: -1 } }
   ]);
   ```

---

## 3. Implementation Priority

### High Priority (Required for MVP)
1. ✅ `/api/attendance/today/present` - Present employees list
2. ✅ `/api/attendance/today/absent` - Absent employees list
3. ✅ `/api/attendance/today/late` - Late employees list

### Medium Priority (Nice to Have)
- Add `search` query param to filter by employee name
- Add `department` query param to filter by department
- Add `sortBy` query param (e.g., `name`, `minutesLate`)

### Low Priority (Future Enhancement)
- Export endpoints (CSV/Excel) for each modal
- Real-time WebSocket updates for attendance changes
- Historical comparison (e.g., "Late employees this week")

---

## 4. Error Handling

All endpoints should return consistent error responses:

```json
{
  "error": {
    "code": "INVALID_DATE",
    "message": "التاريخ المدخل غير صالح",
    "details": "Date must be in YYYY-MM-DD format"
  }
}
```

**Common Error Codes:**
- `INVALID_DATE` (400) - Invalid date format
- `UNAUTHORIZED` (401) - Missing or invalid token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - No data found for the specified date
- `INTERNAL_ERROR` (500) - Server error

---

## 5. Testing Checklist

- [ ] Test with empty attendance data (no employees checked in)
- [ ] Test with all employees present (no absences)
- [ ] Test with employees who have no `scheduledStart` time
- [ ] Test with employees who checked in exactly on time (0 minutes late)
- [ ] Test with employees who checked in early (negative late minutes)
- [ ] Test with terminated employees (should be excluded)
- [ ] Test with large datasets (500+ employees) for performance
- [ ] Test with invalid date formats
- [ ] Test with future dates (should return empty or error)

---

## 6. Summary

To enable the interactive dashboard modals, the backend team needs to implement **3 new API endpoints** that:

1. **Join** the `employees` and `attendance` collections
2. **Filter** by date (today by default) and employee status (active)
3. **Calculate** late minutes by comparing scheduled vs actual check-in times
4. **Return** detailed employee lists with all necessary fields for the UI

The frontend will call these endpoints **lazily** (only when a modal is opened) to avoid unnecessary data fetching on initial page load.

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-25  
**Author:** AI Full-Stack Architect
