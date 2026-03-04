import storage from "../storage";

import { getAuthHeaders, getMediaUrl, isValidBaseUrl, splitMxid } from "./synapse";

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

describe("getAuthHeaders", () => {
  it("returns empty object when no access_token", () => {
    storage.removeItem("access_token");
    expect(getAuthHeaders()).toEqual({});
  });
  it("returns Bearer header when access_token is set", () => {
    storage.setItem("access_token", "syt_abc123");
    expect(getAuthHeaders()).toEqual({ Authorization: "Bearer syt_abc123" });
    storage.removeItem("access_token");
  });
});

describe("getMediaUrl", () => {
  it("returns URL without access_token in query string", () => {
    storage.setItem("base_url", "https://hs.example.com");
    storage.removeItem("access_token");
    const url = getMediaUrl("example.com/abc123");
    expect(url).toBe("https://hs.example.com/_matrix/media/v1/download/example.com/abc123?allow_redirect=true");
    expect(url).not.toContain("access_token");
  });
  it("still does not put token in URL when token is present", () => {
    storage.setItem("base_url", "https://hs.example.com");
    storage.setItem("access_token", "secret");
    const url = getMediaUrl("example.com/xyz");
    expect(url).not.toContain("access_token");
    expect(url).not.toContain("secret");
    storage.removeItem("access_token");
  });
});
