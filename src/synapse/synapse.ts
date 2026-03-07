import { Options, fetchUtils } from "react-admin";

import storage from "../storage";

/** Parsed Matrix user ID parts used by login discovery and identity display. */
export interface MxidParts {
  domain: string;
  name: string;
}

/** Minimal shape of the Matrix client well-known response used by discovery. */
export interface MatrixClientWellKnown {
  "m.homeserver"?: {
    base_url?: string;
  };
}

/** Matrix version payload used to display supported protocol versions on login. */
export interface MatrixFeatures {
  unstable_features?: Record<string, boolean>;
  versions: string[];
}

/** Matrix login flow descriptor returned by `/_matrix/client/r0/login`. */
export interface MatrixLoginFlow {
  type: string;
}

/** Split an MXID into localpart and domain when the value is syntactically valid. */
export const splitMxid = (mxid: string | null | undefined): MxidParts | undefined => {
  if (typeof mxid !== "string") {
    return undefined;
  }

  const re = /^@(?<name>[a-zA-Z0-9._=\-/]+):(?<domain>[a-zA-Z0-9\-.]+\.[a-zA-Z]+)$/;
  const groups = re.exec(mxid)?.groups;

  if (!groups?.name || !groups?.domain) {
    return undefined;
  }

  return {
    name: groups.name,
    domain: groups.domain,
  };
};

/** Validate homeserver base URLs before discovery or login requests are issued. */
export const isValidBaseUrl = (baseUrl: unknown): baseUrl is string =>
  typeof baseUrl === "string" && /^(http|https):\/\/[a-zA-Z0-9\-.]+(:\d{1,5})?$/.test(baseUrl);

/** Normalize configured homeserver URLs so providers build stable request paths. */
export const normalizeBaseUrl = (baseUrl: string): string => window.decodeURIComponent(baseUrl).replace(/\/+$/g, "");

/** Join a homeserver base URL with an API endpoint using the normalized base URL. */
export const buildUrl = (baseUrl: string, endpoint: string): string => `${normalizeBaseUrl(baseUrl)}${endpoint}`;

/** Inject the stored access token into a react-admin fetch option bag. */
const withAccessToken = (options: Options = {}): Options => {
  const accessToken = storage.getItem("access_token");

  if (!accessToken) {
    return options;
  }

  return {
    ...options,
    user: {
      ...options.user,
      authenticated: true,
      token: `Bearer ${accessToken}`,
    },
  };
};

/** Plain JSON fetch helper shared by discovery calls and provider requests. */
export const fetchJson = (url: string, options: Options = {}) => fetchUtils.fetchJson(url, options);

/** Authenticated variant of `fetchJson` that reuses the stored bearer token. */
export const fetchJsonWithAuth = (url: string, options: Options = {}) => fetchJson(url, withAccessToken(options));

/** Read the configured homeserver base URL from local storage. */
export const getStoredBaseUrl = (): string | null => storage.getItem("base_url");

/** Return the stored homeserver base URL or fail fast when bootstrap is incomplete. */
export const requireStoredBaseUrl = (): string => {
  const baseUrl = getStoredBaseUrl();

  if (!baseUrl) {
    throw new Error("Homeserver not set");
  }

  return baseUrl;
};

/** Return the discovered home server name used by older Synapse admin endpoints. */
export const requireStoredHomeServer = (): string => {
  const homeServer = storage.getItem("home_server");

  if (!homeServer) {
    throw new Error("Homeserver not set");
  }

  return homeServer;
};

/**
 * Resolve the homeserver URL using the well-known lookup
 * @param domain  the domain part of an MXID
 * @returns homeserver base URL
 */
export const getWellKnownUrl = async (domain: string): Promise<string> => {
  const wellKnownUrl = `https://${domain}/.well-known/matrix/client`;
  try {
    const response = await fetchJson(wellKnownUrl, { method: "GET" });
    const baseUrl = (response.json as MatrixClientWellKnown)["m.homeserver"]?.base_url;
    return typeof baseUrl === "string" ? baseUrl : `https://${domain}`;
  } catch {
    // if there is no .well-known entry, return the domain itself
    return `https://${domain}`;
  }
};

/**
 * Get synapse server version
 * @param base_url  the base URL of the homeserver
 * @returns server version
 */
export const getServerVersion = async (baseUrl: string): Promise<string> => {
  const response = await fetchJson(buildUrl(baseUrl, "/_synapse/admin/v1/server_version"), { method: "GET" });
  return response.json.server_version as string;
};

/** Get supported Matrix features */
export const getSupportedFeatures = async (baseUrl: string): Promise<MatrixFeatures> => {
  const response = await fetchJson(buildUrl(baseUrl, "/_matrix/client/versions"), { method: "GET" });
  return response.json as MatrixFeatures;
};

/**
 * Get supported login flows
 * @param baseUrl  the base URL of the homeserver
 * @returns array of supported login flows
 */
export const getSupportedLoginFlows = async (baseUrl: string): Promise<MatrixLoginFlow[]> => {
  const response = await fetchJson(buildUrl(baseUrl, "/_matrix/client/r0/login"), { method: "GET" });
  return (response.json.flows as MatrixLoginFlow[]) ?? [];
};

/** Resolve a media download URL against the currently selected homeserver. */
export const getMediaUrl = (media_id: string): string =>
  buildUrl(requireStoredBaseUrl(), `/_matrix/media/v1/download/${media_id}?allow_redirect=true`);

/** Run an authenticated request against an explicit homeserver base URL. */
export const fetchJsonFromBaseUrl = (baseUrl: string, endpoint: string, options: Options = {}) =>
  fetchJsonWithAuth(buildUrl(baseUrl, endpoint), options);

/** Run an authenticated request against the homeserver stored in local storage. */
export const fetchJsonFromStoredBaseUrl = (endpoint: string, options: Options = {}) =>
  fetchJsonFromBaseUrl(requireStoredBaseUrl(), endpoint, options);

/** Run an authenticated request against a fully assembled absolute URL. */
export const fetchJsonFromAbsoluteUrl = (url: string, options: Options = {}) => fetchJsonWithAuth(url, options);

/** Run an unauthenticated request against an explicit homeserver base URL. */
export const fetchJsonWithoutAuth = (baseUrl: string, endpoint: string, options: Options = {}) =>
  fetchJson(buildUrl(baseUrl, endpoint), options);

/** Clear credentials that should not survive logout or failed auth recovery. */
export const clearStoredAuth = (): void => {
  storage.removeItem("access_token");
};

/**
 * Generate a random MXID for current homeserver
 * @returns full MXID as string
 */
export function generateRandomMxId(): string {
  const homeserver = storage.getItem("home_server");
  const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
  const localpart = Array.from(crypto.getRandomValues(new Uint32Array(8)))
    .map(x => characters[x % characters.length])
    .join("");
  return `@${localpart}:${homeserver}`;
}

/**
 * Generate a random user password
 * @returns a new random password as string
 */
export function generateRandomPassword(length = 20): string {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$";
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map(x => characters[x % characters.length])
    .join("");
}
