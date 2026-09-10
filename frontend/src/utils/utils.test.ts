import { describe, expect, it, vi } from "vitest";

import { ApiClient } from "@/utils/api-client";
import { formatCurrency, parseCurrency } from "@/utils/currency";
import { getInitials, humanize, truncate } from "@/utils/format";
import { isNonNegativeNumber, isValidEmail, isValidPhone, isValidSku } from "@/utils/validation";

describe("shared frontend utilities", () => {
  it("formats and parses currency", () => {
    expect(formatCurrency(1250)).toContain("1,250");
    expect(parseCurrency("Rs 1,250.50")).toBe(1250.5);
  });

  it("validates common business inputs", () => {
    expect(isValidEmail("staff@example.com")).toBe(true);
    expect(isValidPhone("+92 300 1234567")).toBe(true);
    expect(isValidSku("MOUSE-001")).toBe(true);
    expect(isNonNegativeNumber(0)).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
  });

  it("formats labels and compact text", () => {
    expect(humanize("low_stock")).toBe("Low stock");
    expect(getInitials("Syed Sayeel Abbas")).toBe("SS");
    expect(truncate("Inventory management", 10)).toBe("Inventory…");
  });

  it("builds authenticated API requests with query parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = new ApiClient("http://api.example.test");
    client.setTokenProvider(() => "test-token");

    await client.get("/products", { query: { page: 2, active: true } });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.example.test/products?page=2&active=true");
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer test-token");
  });

  it("converts failed API responses into ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Product not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const client = new ApiClient("http://api.example.test");

    await expect(client.get("/products/404")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "Product not found",
    });
  });
});
