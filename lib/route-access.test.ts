import {
  getRequiredRolesForPath,
  hasAnyRequiredRole,
  isProtectedRoute,
} from "@/lib/route-access";

describe("route-access", () => {
  it("detects protected routes with trailing slash", () => {
    expect(isProtectedRoute("/home/")).toBe(true);
    expect(isProtectedRoute("/employees/team")).toBe(true);
    expect(isProtectedRoute("/public")).toBe(false);
  });

  it("resolves required roles using prefix matching", () => {
    expect(getRequiredRolesForPath("/settings")).toEqual(["admin"]);
    expect(getRequiredRolesForPath("/inventory/stock")).toEqual([
      "admin",
      "warehouse",
      "manager",
    ]);
    expect(getRequiredRolesForPath("/home")).toBeNull();
  });

  it("matches roles case-insensitively", () => {
    expect(hasAnyRequiredRole(["Admin", "HR"], ["admin"])).toBe(true);
    expect(hasAnyRequiredRole(["Warehouse"], ["finance", "manager"])).toBe(false);
  });
});

