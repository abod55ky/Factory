import { describe, expect, it } from "vitest";
import type { Employee } from "@/types/employee";
import {
  MAX_HOURLY_RATE,
  assertHourlyRate,
  filterEmployeesByOptions,
  toHourlyRateNumber,
} from "@/hooks/useEmployees";

const employeesFixture: Employee[] = [
  { employeeId: "EMP001", name: "Ali", status: "active", hourlyRate: "100" },
  { employeeId: "EMP002", name: "Sara", status: "terminated", hourlyRate: "120" },
  { employeeId: "EMP003", name: "Omar", status: "inactive", hourlyRate: "90" },
];

describe("useEmployees helpers", () => {
  it("excludes terminated employees by default", () => {
    const result = filterEmployeesByOptions(employeesFixture);
    expect(result.map((employee) => employee.employeeId)).toEqual(["EMP001", "EMP003"]);
  });

  it("returns only terminated employees when status is terminated", () => {
    const result = filterEmployeesByOptions(employeesFixture, { status: "terminated" });
    expect(result.map((employee) => employee.employeeId)).toEqual(["EMP002"]);
  });

  it("includes terminated employees when includeTerminated is true", () => {
    const result = filterEmployeesByOptions(employeesFixture, { includeTerminated: true });
    expect(result.map((employee) => employee.employeeId)).toEqual(["EMP001", "EMP002", "EMP003"]);
  });

  it("parses hourly rate from decimal object and comma-formatted string", () => {
    expect(toHourlyRateNumber({ $numberDecimal: "1234.5" })).toBe(1234.5);
    expect(toHourlyRateNumber("1,250.75")).toBe(1250.75);
  });

  it("validates allowed and disallowed hourly rates", () => {
    expect(() => assertHourlyRate(1)).not.toThrow();
    expect(() => assertHourlyRate(0)).toThrow("أجر الساعة يجب أن يكون رقمًا موجبًا أكبر من الصفر");
    expect(() => assertHourlyRate(MAX_HOURLY_RATE + 1)).toThrow("أجر الساعة كبير جدًا");
  });
});
