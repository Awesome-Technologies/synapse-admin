import { merge } from "lodash";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { describe, expect, it as test } from "vitest";

import de from "./de";
import en from "./en";
import fa from "./fa";
import fr from "./fr";
import italianMessages from "./it";
import ru from "./ru";
import zh from "./zh";

const locales: Record<string, { messages: Record<string, unknown>; name: string }> = {
  en: { messages: en, name: "English" },
  de: { messages: de, name: "German" },
  fr: { messages: fr, name: "French" },
  it: { messages: italianMessages, name: "Italian" },
  fa: { messages: fa, name: "Farsi" },
  ru: { messages: ru, name: "Russian" },
  zh: { messages: zh, name: "Chinese" },
};

/**
 * Build a polyglot i18n provider for a given locale, mirroring the
 * merge strategy used in App.tsx:
 *   locale => merge({}, messages.en, messages[locale])
 */
function buildProvider(locale: string) {
  const resolved = merge({}, en, locales[locale].messages);
  const provider = polyglotI18nProvider(() => resolved, locale);
  return provider;
}

describe("sort tooltip translations", () => {
  describe.each(
    Object.entries(locales).map(([locale, { name }]) => [locale, name] as const),
  )("%s (%s)", (locale, name) => {
    test("ra.sort.sort_by does not contain %{field_lower_first}", () => {
      const provider = buildProvider(locale);
      // Retrieve the raw translation string by providing only the fallback
      // interpolation options – omitting field_lower_first intentionally.
      const result = provider.translate("ra.sort.sort_by", {
        field: "TEST_FIELD",
        order: "TEST_ORDER",
        _: "FALLBACK",
      });

      expect(result).not.toContain("%{field_lower_first}");
    });

    test("ra.sort.sort_by interpolates %{field} correctly", () => {
      const provider = buildProvider(locale);
      const result = provider.translate("ra.sort.sort_by", {
        field: "Name",
        field_lower_first: "name",
        order: provider.translate("ra.sort.ASC"),
        _: "Sort",
      });

      expect(result).toContain("Name");
      expect(result).not.toContain("%{field}");
      expect(result).not.toContain("%{order}");
      expect(result).not.toContain("%{field_lower_first}");
    });

    test("ra.sort.sort_by still works when field_lower_first is undefined", () => {
      const provider = buildProvider(locale);
      const result = provider.translate("ra.sort.sort_by", {
        field: "Name",
        field_lower_first: undefined,
        order: provider.translate("ra.sort.ASC"),
        _: "Sort",
      });

      // The key assertion: no raw placeholder leaks into the output
      expect(result).toContain("Name");
      expect(result).not.toContain("%{");
    });

    test("ra.sort.sort_by still works when field_lower_first is omitted", () => {
      const provider = buildProvider(locale);
      const result = provider.translate("ra.sort.sort_by", {
        field: "Name",
        order: provider.translate("ra.sort.DESC"),
        _: "Sort",
      });

      expect(result).toContain("Name");
      expect(result).not.toContain("%{");
    });

    test("ra.sort.ASC is defined and non-empty", () => {
      const provider = buildProvider(locale);
      const result = provider.translate("ra.sort.ASC");
      expect(result).toBeTruthy();
      expect(result).not.toBe("ra.sort.ASC");
    });

    test("ra.sort.DESC is defined and non-empty", () => {
      const provider = buildProvider(locale);
      const result = provider.translate("ra.sort.DESC");
      expect(result).toBeTruthy();
      expect(result).not.toBe("ra.sort.DESC");
    });
  });
});
