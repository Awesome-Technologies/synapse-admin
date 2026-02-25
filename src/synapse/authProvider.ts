import { AuthProvider, Options, fetchUtils } from "react-admin";

import storage from "../storage";
import { exchangeToken, homeserverUrl, refreshToken, TokenResult, whoami } from "./synapse";

type OldLoginParams = {
  type: 'loginToken'
  base_url: string;
  username: string;
  password: string;
  loginToken: string;
}

type KeyExchangeParams = {
  type: 'keyExchange',
  code: string,
  verifier: string,
}
type LoginParams = OldLoginParams | KeyExchangeParams

type Session = {
  accessToken: string,
  refreshToken: string,
  tokenType: string,
  expires: number | null,
  userId: string,
  homeserver: string,
}
const createSession = async (params: TokenResult) => {
  const expiry = params.expires_in ? Date.now() + (params.expires_in) * 1000 : null;
  const user = await whoami(params.access_token);
  const session: Session = {
    accessToken: params.access_token,
    refreshToken: params.refresh_token,
    tokenType: params.token_type,
    expires: expiry,
    userId: user.user_id,
    homeserver: user.user_id.split(':')[1]
  }
  storage.setItem('session', JSON.stringify(session));
  return session;
}

const updateSession = (update: Partial<Session>) => {
  let session = getSession();
  if(!session)
    throw new Error('Cannot update non-existen session')

  session = {...session, ...update};
  storage.setItem('session', JSON.stringify(session));
}

export const getSession = (): Session | null => {
  const data = storage.getItem('session');
  if(!data)
    // throw new Error('No active session');
    return null;
  const session = JSON.parse(data);
  return session;
}

const destroySession = async () => {
  storage.removeItem('session');
}

const refreshSession = async () => {
  const session = getSession();
  if(!session)
    return;

  const result = await refreshToken(session.refreshToken);
  updateSession({
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    expires: Date.now () + result.expires_in * 1000,
  })
}

const authProvider: AuthProvider = {
  // called when the user attempts to log in
  login: async (params: LoginParams) => {
    console.log("login ");

    if (params.type === 'loginToken') {
      const { loginToken, username, password } = params;
      let { base_url } = params;
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
      base_url = base_url.replace(/\/+$/g, "");
      homeserverUrl(base_url);

      const decoded_base_url = window.decodeURIComponent(base_url);
      const login_api_url = decoded_base_url + "/_matrix/client/r0/login";

      const { json } = await fetchUtils.fetchJson(login_api_url, options);
      // console.log(json);
      // storage.setItem("home_server", json.home_server ?? json.user_id.split(':')[1]);
      // storage.setItem("user_id", json.user_id);
      // storage.setItem("access_token", json.access_token);
      // storage.setItem("device_id", json.device_id);
      await createSession({
        access_token: json.access_token,
        refresh_token: '',
        expires_in: 0,
        scope: '',
        token_type: 'Bearer'
      })
    }
    else if (params.type === 'keyExchange') {
      const { code, verifier } = params;
      const response = await exchangeToken(code, verifier);
      // TODO: These should probably be consolidated into 1 object accessed through some kind of getter,
      // instead of having to manage their states individually, e.g. consolidate these into a User object
      await createSession(response);
    }
  },
  // called when the user clicks on the logout button
  logout: async () => {
    console.log("logout");

    const logout_api_url = homeserverUrl() + "/_matrix/client/v3/logout";
    const session = getSession();
    if(!session)
      return;
    // const access_token = storage.getItem("access_token");

    const options: Options = {
      method: "POST",
      user: {
        authenticated: true,
        token: `${session.tokenType} ${session.accessToken}`,
      },
    };

    // if (typeof access_token === "string") {
      await fetchUtils.fetchJson(logout_api_url, options);
      // storage.removeItem("access_token");
      destroySession();
    // }
  },
  // called when the API returns an error
  checkError: async (error: { status: number, body: any, name: string }) => {
    const { status } = error;
    console.log("checkError " + status);

    if (status === 401 || status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },
  // called when the user navigates to a new location, to check for authentication
  checkAuth: async () => {
    const session = getSession();
    if(!session)
      return Promise.reject();

    const expiry = session.expires || null;

    // Shift expiry by 15 in an effort to avoid race conditions with token validity
    if(expiry && (expiry - 15) < Date.now())
      await refreshSession();

    // const access_token = storage.getItem("access_token");
    const access_token = session.accessToken;
    console.log("checkAuth " + access_token);
    return typeof access_token === "string" ? Promise.resolve() : Promise.reject();
  },
  // called when the user navigates to a new location, to check for permissions / roles
  getPermissions: () => Promise.resolve(),
};

export default authProvider;
