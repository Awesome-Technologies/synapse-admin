import { AuthProvider, Options, fetchUtils } from "react-admin";

const authProvider: AuthProvider = {
  // called when the user attempts to log in
  login: async ({
    base_url,
    username,
    password,
    loginToken,
  }: {
    base_url: string;
    username: string;
    password: string;
    loginToken: string;
  }) => {
    console.log("login ");
    const options: Options = {
      method: "POST",
      body: JSON.stringify(
        Object.assign(
          {
            device_id: localStorage.getItem("device_id"),
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
              }
        )
      ),
    };

    // use the base_url from login instead of the well_known entry from the
    // server, since the admin might want to access the admin API via some
    // private address
    base_url = base_url.replace(/\/+$/g, "");
    localStorage.setItem("base_url", base_url);

    const decoded_base_url = window.decodeURIComponent(base_url);
    const login_api_url = decoded_base_url + "/_matrix/client/r0/login";

    interface LoginResponse {
      home_server: string;
      user_id: string;
      access_token: string;
      device_id: string;
    }
    const response = await fetchUtils.fetchJson(login_api_url, options);
    const data = response.json as LoginResponse;
    localStorage.setItem("home_server", data.home_server);
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("device_id", data.device_id);
  },
  // called when the user clicks on the logout button
  logout: async () => {
    console.log("logout");

    const logout_api_url = localStorage.getItem("base_url") + "/_matrix/client/r0/logout";
    const access_token = localStorage.getItem("access_token");

    const options: Options = {
      method: "POST",
      user: {
        authenticated: true,
        token: `Bearer ${access_token}`,
      },
    };

    if (typeof access_token === "string") {
      await fetchUtils.fetchJson(logout_api_url, options);
      localStorage.removeItem("access_token");
    }
  },
  // called when the API returns an error
  checkError: ({ status }: { status: number }) => {
    console.log("checkError " + status);
    if (status === 401 || status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },
  // called when the user navigates to a new location, to check for authentication
  checkAuth: () => {
    const access_token = localStorage.getItem("access_token");
    console.log("checkAuth " + access_token);
    return typeof access_token === "string" ? Promise.resolve() : Promise.reject();
  },
  // called when the user navigates to a new location, to check for permissions / roles
  getPermissions: () => Promise.resolve(),
};

export default authProvider;
