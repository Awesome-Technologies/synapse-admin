import type { paths } from "@matrix-org/spec/client-server";
import createClient, { Middleware } from "openapi-fetch";

import { fetchUtils } from "react-admin";

const throwOnError: Middleware = {
  async onResponse(res) {
    if (res.status >= 400) {
      const body = await res.clone().text();
      throw new Error(body);
    }
    return undefined;
  },
};

export const useSynapse = (baseUrl: string) => {
  const client = createClient<paths>({ baseUrl: baseUrl });
  client.use(throwOnError);

  return {
    getWellKnownUrl: async () => {
      const { data } = await client.GET("/.well-known/matrix/client");
      return data ? data["m.homeserver"].base_url : baseUrl;
    },
    getSupportedFeatures: async () => (await client.GET("/_matrix/client/versions")).data,
    getSupportedLoginFlows: async () => (await client.GET("/_matrix/client/v3/login")).data?.flows,
  };
};

export const splitMxid = (mxid: string) => {
  const re = /^@(?<name>[a-zA-Z0-9._=\-/]+):(?<domain>[a-zA-Z0-9\-.]+\.[a-zA-Z]+)$/;
  return re.exec(mxid)?.groups;
};

export const isValidBaseUrl = (baseUrl: string | object | null | undefined) =>
  typeof baseUrl === "string" ? /^(http|https):\/\/[a-zA-Z0-9\-.]+(:\d{1,5})?$/.test(baseUrl) : false;

/**
 * Resolve the homeserver URL using the well-known lookup
 * @param domain  the domain part of an MXID
 * @returns homeserver base URL
 */
export const getWellKnownUrl = async (domain: string): Promise<string> => {
  const client = createClient<paths>({ baseUrl: `https://${domain}` });
  try {
    const { data, error } = await client.GET("/.well-known/matrix/client");
    if (error) throw new Error(error);
    else return data["m.homeserver"].base_url;
  } catch (e) {
    console.warn(e);
  }
  // if there is no .well-known entry, return the domain itself
  return `https://${domain}`;
};

/**
 * Get synapse server version
 * @param base_url  the base URL of the homeserver
 * @returns server version
 */
export const getServerVersion = async (baseUrl: string) => {
  const versionUrl = `${baseUrl}/_synapse/admin/v1/server_version`;
  const response = await fetchUtils.fetchJson(versionUrl, { method: "GET" });
  const data = response.json as { server_version: string };
  return data.server_version;
};

/** Get supported Matrix features */
export const getSupportedFeatures = async (baseUrl: string) => {
  const client = createClient<paths>({ baseUrl: baseUrl });
  const { data } = await client.GET("/_matrix/client/versions");
  return data;
};

/**
 * Get supported login flows
 * @param baseUrl  the base URL of the homeserver
 * @returns array of supported login flows
 */
export const getSupportedLoginFlows = async (baseUrl: string) => {
  const client = createClient<paths>({ baseUrl: baseUrl });
  const { data } = await client.GET("/_matrix/client/v3/login");
  return data?.flows;
};

export const getMediaUrl = (media_id: string) => {
  const baseUrl = localStorage.getItem("base_url");
  return `${baseUrl}/_matrix/media/v1/download/${media_id}?allow_redirect=true`;
};

/**
 * Generate a random MXID for current homeserver
 * @returns full MXID as string
 */
export function generateRandomMxId(): string {
  const homeserver = localStorage.getItem("home_server");
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
