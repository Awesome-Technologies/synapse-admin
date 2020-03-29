import { fetchUtils } from "react-admin";

const ensureHttpsForUrl = url => {
  if (/^https:\/\//i.test(url)) {
    return url;
  }
  const domain = url.replace(/http.?:\/\//g, "");
  return "https://" + domain;
};

const stripTrailingSlash = str => {
  if (!str) {
    return;
  }
  return str.endsWith("/") ? str.slice(0, -1) : str;
};

const getBaseUrl = (login_base_url, json_base_url, force_server) => {
  if (force_server) {
    return ensureHttpsForUrl(login_base_url);
  } else {
    return json_base_url;
  }
};

const authProvider = {
  // called when the user attempts to log in
  login: ({ homeserver, force_server, username, password }) => {
    console.log("login ");
    const options = {
      method: "POST",
      body: JSON.stringify({
        type: "m.login.password",
        user: username,
        password: password,
      }),
    };

    const url = window.decodeURIComponent(homeserver);
    const trimmed_url = url.trim().replace(/\s/g, "");
    const login_api_url =
      ensureHttpsForUrl(trimmed_url) + "/_matrix/client/r0/login";

    return fetchUtils.fetchJson(login_api_url, options).then(({ json }) => {
      const normalized_base_url = stripTrailingSlash(
        getBaseUrl(
          trimmed_url,
          json.well_known["m.homeserver"].base_url,
          force_server
        )
      );

      localStorage.setItem("base_url", normalized_base_url);
      localStorage.setItem("home_server_url", json.home_server);
      localStorage.setItem("force_server", force_server);
      localStorage.setItem("user_id", json.user_id);
      localStorage.setItem("access_token", json.access_token);
      localStorage.setItem("device_id", json.device_id);
    });
  },
  // called when the user clicks on the logout button
  logout: () => {
    console.log("logout ");
    localStorage.removeItem("access_token");
    return Promise.resolve();
  },
  // called when the API returns an error
  checkError: ({ status }) => {
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
    return typeof access_token == "string"
      ? Promise.resolve()
      : Promise.reject();
  },
  // called when the user navigates to a new location, to check for permissions / roles
  getPermissions: () => Promise.resolve(),
};

export default authProvider;
