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
export const getWellKnownUrl = async (domain: string) => {
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

export const getMediaUrl = (media_id: string) => {
  const baseUrl = homeserverUrl();
  return `${baseUrl}/_matrix/client/v1/media/download/${media_id}?allow_redirect=true`;
};

// VVVVVVVVVVVV Matrix OAuth implementation VVVVVVVVVVVV
export type AuthMetadata = {
  issuer: string,
  account_management_uri: string,
  authorization_endpoint: string,
  token_endpoint: string,
  jwks_uri: string,
  registration_endpoint: string,
}
export const getAuthMetadata = async (baseUrl?: string): Promise<AuthMetadata | null> => {
  const existing = storage.getItem('auth_metadata');
  if(existing)
    return JSON.parse(existing);
  if(!baseUrl)
    return null;
  const res = await fetch(`${baseUrl}/_matrix/client/v1/auth_metadata`);
  const json = await res.json();
  storage.setItem('auth_metadata', JSON.stringify(json));
  return json as AuthMetadata;
}

export type RegistrationOpts = {
  endpoint: string,
  clientUri: string,
  redirectUri: string,
}
export type ClientRegistration = {
  client_id: string,
  client_id_issued_at: number,
  redirect_uris: string[],
  grant_types: string[],
  application_type: string,
  token_endpoint_auth_method: string,
  client_name: string,
  client_uri: string
}

// Create client registration on the synapse server,
// which can then be used for the OAuth flow for generating a token that works when using MAS
export const registerClient = async (opts: RegistrationOpts): Promise<ClientRegistration | null> => {
  const existing = getClientRegistration();
  if (existing)
    return existing;

  const payload = {
    application_type: 'web',
    client_name: 'Element Admin',
    client_uri: opts.clientUri,
    redirect_uris: [opts.redirectUri],
    token_endpoint_auth_method: 'none',
    grant_types: [
      'authorization_code',
      'refresh_token',
    ],
    response_types: ['code'],
  }
  const res = await fetch(opts.endpoint, {
    method: 'post',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json() as ClientRegistration;
  storage.setItem('client_registration', JSON.stringify(data));
  return data;
}

export const getClientRegistration = (): ClientRegistration | null => {
  const data = storage.getItem('client_registration');
  if(data)
    return JSON.parse(data);
  return null;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const randomString = (len: number): string => {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let result = '';
  for(const value of bytes)
    result += alphabet[value % alphabet.length];
  return result;
}

const generateChallenge = async (verifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);

  let str = ''
  for(const byte of new Uint8Array(hash))
    str += String.fromCodePoint(byte);
  return btoa(str)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

const generateKeyPair = async () => {
  const verifier = randomString(64);
  const challenge = await generateChallenge(verifier);
  return {verifier, challenge};
}

export type AuthSession = {
  state: string,
  verifier: string,
  challenge: string,
  clientId: string,
}
const createAuthSession = async (clientId: string): Promise<AuthSession> => {
  const existing = getAuthSession();
  if(existing && existing.clientId === clientId)
    return existing;

  const state = randomString(32);
  const {verifier, challenge} = await generateKeyPair();
  const session = {state, verifier, challenge, clientId};
  storage.setItem('auth_session', JSON.stringify(session));
  return session;
}

export const getAuthSession = () => {
  const data = storage.getItem('auth_session');
  if(data)
    return JSON.parse(data) as AuthSession;
  return null;
}

export const authoriseClient = async () => {
  const metadata = await getAuthMetadata();
  if(!metadata)
    return null;

  const registration = getClientRegistration();
  if(!registration)
    return null;

  const session = await createAuthSession(registration.client_id);

  const query = new URLSearchParams({
    response_type: 'code',
    client_id: registration.client_id,
    redirect_uri: registration.redirect_uris[0],
    scope: [
      'urn:matrix:org.matrix.msc2967.client:api:*',
      'urn:mas:admin',
      'urn:synapse:admin:*'
    ].join(' '),
    state: session.state,
    code_challenge: session.challenge,
    code_challenge_method: 'S256'
  })
  const url = new URL(metadata.authorization_endpoint);
  url.search = query.toString();
  location.href = url.toString();
}

export type TokenResult = {
  access_token: string,
  refresh_token: string,
  expires_in: number,
  scope: string,
  token_type: string,
}
export const exchangeToken = async (code: string, verifier: string): Promise<TokenResult> =>
{
  const client = getClientRegistration();
  if(!client)
    throw new Error('Missing client registration');
  const auth = await getAuthMetadata();
  if(!auth)
    throw new Error('Missing auth metadata');

  client.token_endpoint_auth_method
  const params = new URLSearchParams({
    code,
    code_verifier: verifier,
    client_id: client.client_id,
    redirect_uri: client.redirect_uris[0],
    grant_type: 'authorization_code'
  });
  const res = await fetch(auth.token_endpoint, {
    method: 'post',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const json = await res.json();
  return json;
}

export const refreshToken = async (refresh: string): Promise<TokenResult> => {
  const auth = await getAuthMetadata();
  if(!auth)
    throw new Error('Missing auth metadata');
  const client = getClientRegistration();
  if(!client)
    throw new Error('Missing client registration');

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: client.client_id,
  });
  const res = await fetch(auth.token_endpoint, {
    method: 'post',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const json = await res.json();
  return json;
}

type Whoami = {
  user_id: string,
  is_guest: boolean
}
export const whoami = async (token: string): Promise<Whoami> => {
  const res = await fetch(`${homeserverUrl()}/_matrix/client/v3/account/whoami`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  return json;
}

export const homeserverUrl = (url?: string) =>
{
  if(url)
    return storage.setItem('homeserver_url', url);

  url = storage.getItem('homeserver_url') ?? '';
  if(!url)
    // throw new Error('Missing homeserver_url');
    return null;
  return url;
}

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
