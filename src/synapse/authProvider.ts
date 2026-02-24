import { AuthProvider, Options, fetchUtils } from "react-admin";

import storage from "../storage";
import { exchangeToken, homeserverUrl, refreshToken, whoami } from "./synapse";

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
      storage.setItem("base_url", base_url);

      const decoded_base_url = window.decodeURIComponent(base_url);
      const login_api_url = decoded_base_url + "/_matrix/client/r0/login";

      const { json } = await fetchUtils.fetchJson(login_api_url, options);
      console.log(json);
      storage.setItem("home_server", json.home_server ?? json.user_id.split(':')[1]);
      storage.setItem("user_id", json.user_id);
      storage.setItem("access_token", json.access_token);
      storage.setItem("device_id", json.device_id);
    }
    else if (params.type === 'keyExchange')
    {
      const {code, verifier} = params;
      const response = await exchangeToken(code, verifier);
      // TODO: These should probably be consolidated into 1 object accessed through some kind of getter,
      // instead of having to manage their states individually, e.g. consolidate these into a User object
      storage.setItem('access_token', response.access_token);
      storage.setItem('refresh_token', response.refresh_token);
      storage.setItem('token_type', response.token_type);
      const user = await whoami(response.access_token);
      storage.setItem('user_id', user.user_id);
      storage.setItem('home_server', user.user_id.split(':')[1]);
    }
  },
  // called when the user clicks on the logout button
  logout: async () => {
    console.log("logout");

    const logout_api_url = homeserverUrl() + "/_matrix/client/v3/logout";
    const access_token = storage.getItem("access_token");

    const options: Options = {
      method: "POST",
      user: {
        authenticated: true,
        token: `Bearer ${access_token}`,
      },
    };

    if (typeof access_token === "string") {
      await fetchUtils.fetchJson(logout_api_url, options);
      storage.removeItem("access_token");
    }
  },
  // called when the API returns an error
  checkError: async (error: { status: number, body: any, name: string }) => {
    const {status, body} = error;
    console.log("checkError " + status);
    if(body.errcode === 'M_UNKNOWN_TOKEN')
    {
      const result = await refreshToken();
      storage.setItem('access_token', result.access_token);
      storage.setItem('refresh_token', result.refresh_token);
      return Promise.resolve();
    }

    if (status === 401 || status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },
  // called when the user navigates to a new location, to check for authentication
  checkAuth: () => {
    const access_token = storage.getItem("access_token");
    console.log("checkAuth " + access_token);
    return typeof access_token === "string" ? Promise.resolve() : Promise.reject();
  },
  // called when the user navigates to a new location, to check for permissions / roles
  getPermissions: () => Promise.resolve(),
};

export default authProvider;
