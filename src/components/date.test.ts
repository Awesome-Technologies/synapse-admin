import { dateFormatter, dateParser } from "./date";

describe("date helpers", () => {
  it("parses empty-ish values as null", () => {
    expect(dateParser("")).toBeNull();
    expect(dateParser(null)).toBeNull();
    expect(dateParser(undefined)).toBeNull();
  });

  it("parses valid values into timestamps and rejects invalid ones", () => {
    expect(dateParser("2024-01-02T03:04")).toBe(new Date("2024-01-02T03:04").getTime());
    expect(dateParser("not-a-date")).toBeNull();
  });

  it("formats values for datetime-local inputs", () => {
    expect(dateFormatter(undefined)).toBe("");
    expect(dateFormatter(null)).toBe("");
    expect(dateFormatter(new Date("2024-01-02T03:04:05Z"))).toMatch(/^2024-01-02T\d{2}:\d{2}$/);
  });
});
