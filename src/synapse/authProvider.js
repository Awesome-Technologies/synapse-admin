import { fetchUtils } from "react-admin";

const authProvider = {
  // called when the user attempts to log in
  login: ({ homeserver, username, password }) => {
    console.log("login ");
    const options = {
      method: "POST",
      body: JSON.stringify({
        type: "m.login.password",
        user: username,
        password: password,
      }),
    };

    // add 'https://' to homeserver url if its missing
    let newUrl = window.decodeURIComponent(homeserver);
    newUrl = newUrl.trim().replace(/\s/g, "");
    if (!/^https?:\/\//i.test(newUrl)) {
      homeserver = `https://${newUrl}`;
    }

    const url = homeserver + "/_matrix/client/r0/login";
    return fetchUtils.fetchJson(url, options).then(({ json }) => {
      localStorage.setItem("home_server", json.home_server);
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
