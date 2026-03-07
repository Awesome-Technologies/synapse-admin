import { AuthProvider, Options } from "react-admin";

import storage from "../storage";
import { buildUrl, clearStoredAuth, fetchJson, fetchJsonWithAuth, normalizeBaseUrl, splitMxid } from "./synapse";

/** Credentials accepted by the react-admin login form and SSO callback flow. */
interface LoginParams {
  base_url: string;
  loginToken?: string | null;
  password?: string | null;
  username?: string | null;
}

/** Use token presence as the single source of truth for auth state inside the admin shell. */
const hasAccessToken = (): boolean => typeof storage.getItem("access_token") === "string";

/** Build the lightweight identity object react-admin expects from locally cached login data. */
const getStoredIdentity = () => {
  if (!hasAccessToken()) return null;

  const userId = storage.getItem("user_id");
  if (!userId) return null;

  return {
    id: userId,
    fullName: splitMxid(userId)?.name ?? userId,
  };
};

/** React-admin auth provider backed by Synapse password login and token-based SSO callbacks. */
const authProvider: AuthProvider = {
  /** Exchange credentials for an access token and persist the resulting session locally. */
  login: async ({
    base_url,
    username,
    password,
    loginToken,
  }: LoginParams) => {
    const options: Options = {
      method: "POST",
      body: JSON.stringify(
        Object.assign(
          {
            device_id: storage.getItem("device_id"),
            initial_device_display_name: "Synapse Admin",
          },
          loginToken
            ? {
                type: "m.login.token",
                token: loginToken,
              }
            : {
                type: "m.login.password",
                user: username,
                password: password,
                identifier: {
                  type: "m.id.user",
                  user: username,
                },
              }
        )
      ),
    };

    // use the base_url from login instead of the well_known entry from the
    // server, since the admin might want to access the admin API via some
    // private address
    const normalizedBaseUrl = normalizeBaseUrl(base_url);
    storage.setItem("base_url", normalizedBaseUrl);

    const { json } = await fetchJson(buildUrl(normalizedBaseUrl, "/_matrix/client/r0/login"), options);
    storage.setItem("home_server", json.home_server);
    storage.setItem("user_id", json.user_id);
    storage.setItem("access_token", json.access_token);
    storage.setItem("device_id", json.device_id);
  },
  /** Revoke the server session when possible and always clear local auth state afterwards. */
  logout: async () => {
    const access_token = storage.getItem("access_token");
    const baseUrl = storage.getItem("base_url");

    if (typeof access_token === "string" && baseUrl) {
      try {
        await fetchJsonWithAuth(buildUrl(baseUrl, "/_matrix/client/r0/logout"), { method: "POST" });
      } finally {
        clearStoredAuth();
      }
      return;
    }

    clearStoredAuth();
  },
  /** Treat 401/403 responses as an expired or invalid session. */
  checkError: ({ status }: { status: number }) => ((status === 401 || status === 403) ? Promise.reject() : Promise.resolve()),
  /** Guard protected routes by checking whether a session token is cached locally. */
  checkAuth: async () => (hasAccessToken() ? Promise.resolve() : Promise.reject()),
  /** Synapse Admin currently does not model separate permission payloads. */
  getPermissions: () => Promise.resolve(),
  /** Expose the cached user ID so react-admin can render identity-aware UI. */
  getIdentity: () => {
    const identity = getStoredIdentity();
    return identity ? Promise.resolve(identity) : Promise.reject();
  },
  /** Keep access checks aligned with the current all-or-nothing authenticated admin model. */
  canAccess: async () => hasAccessToken(),
};

export default authProvider;
