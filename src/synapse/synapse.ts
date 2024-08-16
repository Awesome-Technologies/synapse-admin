import { fetchUtils } from "react-admin";

import storage from "../storage";

export const splitMxid = mxid => {
  const re = /^@(?<name>[a-zA-Z0-9._=\-/]+):(?<domain>[a-zA-Z0-9\-.]+\.[a-zA-Z]+)$/;
  return re.exec(mxid)?.groups;
};

export const isValidBaseUrl = baseUrl => /^(http|https):\/\/[a-zA-Z0-9\-.]+(:\d{1,5})?$/.test(baseUrl);

/**
 * Resolve the homeserver URL using the well-known lookup
 * @param domain  the domain part of an MXID
 * @returns homeserver base URL
 */
export const getWellKnownUrl = async domain => {
  const wellKnownUrl = `https://${domain}/.well-known/matrix/client`;
  try {
    const response = await fetchUtils.fetchJson(wellKnownUrl, { method: "GET" });
    return response.json["m.homeserver"].base_url;
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
export const getServerVersion = async baseUrl => {
  const versionUrl = `${baseUrl}/_synapse/admin/v1/server_version`;
  const response = await fetchUtils.fetchJson(versionUrl, { method: "GET" });
  return response.json.server_version;
};

/** Get supported Matrix features */
export const getSupportedFeatures = async baseUrl => {
  const versionUrl = `${baseUrl}/_matrix/client/versions`;
  const response = await fetchUtils.fetchJson(versionUrl, { method: "GET" });
  return response.json;
};

/**
 * Get supported login flows
 * @param baseUrl  the base URL of the homeserver
 * @returns array of supported login flows
 */
export const getSupportedLoginFlows = async baseUrl => {
  const loginFlowsUrl = `${baseUrl}/_matrix/client/r0/login`;
  const response = await fetchUtils.fetchJson(loginFlowsUrl, { method: "GET" });
  return response.json.flows;
};

export const getMediaUrl = media_id => {
  const baseUrl = storage.getItem("base_url");
  return `${baseUrl}/_matrix/media/v1/download/${media_id}?allow_redirect=true`;
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
