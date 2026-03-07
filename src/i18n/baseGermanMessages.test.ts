import englishMessages from "ra-language-english";
import { describe, expect, it } from "vitest";

import baseGermanMessages from "./baseGermanMessages";

const flatten = (obj: unknown, prefix = "", out = new Map<string, unknown>()) => {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    out.set(prefix, obj);
    return out;
  }

  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, nextKey, out);
    } else {
      out.set(nextKey, value);
    }
  }

  return out;
};

describe("baseGermanMessages", () => {
  it("covers all upstream react-admin english keys", () => {
    const upstreamRa = flatten(englishMessages.ra, "ra");
    const germanRa = flatten(baseGermanMessages.ra, "ra");

    const missing = [...upstreamRa.keys()].filter(key => !germanRa.has(key));

    expect(missing).toEqual([]);
  });
});
