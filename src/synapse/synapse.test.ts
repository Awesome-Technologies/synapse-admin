import { isValidBaseUrl, splitMxid } from "./synapse";

describe("splitMxid", () => {
  it("splits valid MXIDs", () =>
    expect(splitMxid("@name:domain.tld")).toEqual({
      name: "name",
      domain: "domain.tld",
    }));
  it("rejects invalid MXIDs", () => expect(splitMxid("foo")).toBeUndefined());
});

describe("isValidBaseUrl", () => {
  it("accepts a http URL", () => expect(isValidBaseUrl("http://foo.bar")).toBeTruthy());
  it("accepts a https URL", () => expect(isValidBaseUrl("https://foo.bar")).toBeTruthy());
  it("accepts a valid URL with port", () => expect(isValidBaseUrl("https://foo.bar:1234")).toBeTruthy());
  it("rejects undefined base URLs", () => expect(isValidBaseUrl(undefined)).toBeFalsy());
  it("rejects null base URLs", () => expect(isValidBaseUrl(null)).toBeFalsy());
  it("rejects empty base URLs", () => expect(isValidBaseUrl("")).toBeFalsy());
  it("rejects non-string base URLs", () => expect(isValidBaseUrl({})).toBeFalsy());
  it("rejects base URLs without protocol", () => expect(isValidBaseUrl("foo.bar")).toBeFalsy());
  it("rejects base URLs with path", () => expect(isValidBaseUrl("http://foo.bar/path")).toBeFalsy());
  it("rejects invalid base URLs", () => expect(isValidBaseUrl("http:/foo.bar")).toBeFalsy());
});
