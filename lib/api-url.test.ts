import { describe, expect, it } from "vitest";
import { normalizeApiUrl } from "@/lib/api-url";

describe("api-url", () => {
  it("adds /api when missing", () => {
    expect(normalizeApiUrl("http://127.0.0.1:5001", "http://127.0.0.1:5001/api")).toBe(
      "http://127.0.0.1:5001/api",
    );
  });

  it("keeps /api path when already provided", () => {
    expect(
      normalizeApiUrl(
        "https://werehouse-production-f4f4.up.railway.app/api",
        "http://127.0.0.1:5001/api",
      ),
    ).toBe("https://werehouse-production-f4f4.up.railway.app/api");
  });

  it("supports relative api URLs", () => {
    expect(normalizeApiUrl("/api", "http://127.0.0.1:5001/api")).toBe("/api");
  });
});
