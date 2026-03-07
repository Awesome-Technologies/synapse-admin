import {
  buildUrl,
  clearStoredAuth,
  fetchJson,
  fetchJsonFromAbsoluteUrl,
  fetchJsonFromBaseUrl,
  fetchJsonFromStoredBaseUrl,
  fetchJsonWithAuth,
  fetchJsonWithoutAuth,
  generateRandomMxId,
  generateRandomPassword,
  getMediaUrl,
  getServerVersion,
  getStoredBaseUrl,
  getSupportedFeatures,
  getSupportedLoginFlows,
  getWellKnownUrl,
  isValidBaseUrl,
  normalizeBaseUrl,
  requireStoredBaseUrl,
  requireStoredHomeServer,
  splitMxid,
} from "./synapse";
import storage from "../storage";

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


describe("synapse helpers", () => {
  beforeEach(() => {
    storage.clear();
    fetchMock.resetMocks();
    vi.restoreAllMocks();
  });

  it("normalizes and builds homeserver URLs", () => {
    expect(normalizeBaseUrl("https%3A%2F%2Fmatrix.example.com///")).toBe("https://matrix.example.com");
    expect(buildUrl("https://matrix.example.com/", "/_matrix/client")).toBe("https://matrix.example.com/_matrix/client");
  });

  it("reads and requires stored homeserver information", () => {
    storage.setItem("base_url", "https://matrix.example.com");
    storage.setItem("home_server", "matrix.example.com");

    expect(getStoredBaseUrl()).toBe("https://matrix.example.com");
    expect(requireStoredBaseUrl()).toBe("https://matrix.example.com");
    expect(requireStoredHomeServer()).toBe("matrix.example.com");
  });

  it("throws when required homeserver information is missing", () => {
    expect(() => requireStoredBaseUrl()).toThrow("Homeserver not set");
    expect(() => requireStoredHomeServer()).toThrow("Homeserver not set");
  });

  it("attaches the stored access token to authenticated fetch helpers", async () => {
    storage.setItem("access_token", "secret");
    storage.setItem("base_url", "https://matrix.example.com");
    fetchMock.mockResponse(JSON.stringify({ ok: true }));

    await fetchJsonWithAuth("https://matrix.example.com/_matrix/client");
    await fetchJsonFromBaseUrl("https://matrix.example.com/", "/_matrix/client");
    await fetchJsonFromStoredBaseUrl("/_matrix/client");
    await fetchJsonFromAbsoluteUrl("https://matrix.example.com/_matrix/client");
    await fetchJsonWithoutAuth("https://matrix.example.com", "/_matrix/client");
    await fetchJson("https://matrix.example.com/_matrix/client");

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      user: { authenticated: true, token: "Bearer secret" },
    });
    expect(fetchMock.mock.calls[4]?.[1]).not.toHaveProperty("user");
  });

  it("clears stored auth and builds media URLs from storage", () => {
    storage.setItem("access_token", "secret");
    storage.setItem("base_url", "https://matrix.example.com");

    clearStoredAuth();

    expect(storage.getItem("access_token")).toBeNull();
    expect(getMediaUrl("server/id")).toBe(
      "https://matrix.example.com/_matrix/media/v1/download/server/id?allow_redirect=true"
    );
  });

  it("resolves well-known homeserver data and falls back to the domain", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        "m.homeserver": {
          base_url: "https://hs.example.com",
        },
      })
    );
    fetchMock.mockRejectOnce(new Error("boom"));

    await expect(getWellKnownUrl("example.com")).resolves.toBe("https://hs.example.com");
    await expect(getWellKnownUrl("fallback.example.com")).resolves.toBe("https://fallback.example.com");
  });

  it("fetches supported server metadata", async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify({ server_version: "1.99.0" }))
      .mockResponseOnce(JSON.stringify({ versions: ["r0.6.1"] }))
      .mockResponseOnce(JSON.stringify({ flows: [{ type: "m.login.password" }] }));

    await expect(getServerVersion("https://matrix.example.com")).resolves.toBe("1.99.0");
    await expect(getSupportedFeatures("https://matrix.example.com")).resolves.toEqual({ versions: ["r0.6.1"] });
    await expect(getSupportedLoginFlows("https://matrix.example.com")).resolves.toEqual([
      { type: "m.login.password" },
    ]);
  });

  it("generates random ids and passwords from crypto values", () => {
    storage.setItem("home_server", "matrix.example.com");
    const getRandomValues = vi.spyOn(crypto, "getRandomValues").mockImplementation(array => {
      const typedArray = array as Uint32Array;
      for (let i = 0; i < typedArray.length; i++) {
        typedArray[i] = i;
      }
      return typedArray;
    });

    expect(generateRandomMxId()).toBe("@01234567:matrix.example.com");
    expect(generateRandomPassword(4)).toBe("0123");

    getRandomValues.mockRestore();
  });
});
