import { AuthProvider, HttpError, Options, fetchUtils, useTranslate } from "react-admin";

import storage from "../storage";
import { MatrixError, displayError } from "../components/error";

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
                identifier: {
                  type: "m.id.user",
                  user: username,
                },
                password: password,
              }
        )
      ),
    };

    // use the base_url from login instead of the well_known entry from the
    // server, since the admin might want to access the admin API via some
    // private address
    if (!base_url) {
      // there is some kind of bug with base_url being present in the form, but not submitted
      // ref: https://github.com/etkecc/synapse-admin/issues/14
      storage.removeItem("base_url")
      throw new Error("Homeserver URL is required.");
    }
    base_url = base_url.replace(/\/+$/g, "");
    storage.setItem("base_url", base_url);

    const decoded_base_url = window.decodeURIComponent(base_url);
    const login_api_url = decoded_base_url + "/_matrix/client/r0/login";

    let response;
    try {
      response = await fetchUtils.fetchJson(login_api_url, options);
    } catch(err) {
      const error = err as HttpError;
      const errorStatus = error.status;
      const errorBody = error.body as MatrixError;
      const errMsg = !!errorBody?.errcode ? displayError(errorBody.errcode, errorStatus, errorBody.error) : displayError("M_INVALID", errorStatus, error.message);

      return Promise.reject(
        new HttpError(
          errMsg,
          errorStatus,
        )
    );
    }

    const json = response.json;
    storage.setItem("home_server", json.home_server);
    storage.setItem("user_id", json.user_id);
    storage.setItem("access_token", json.access_token);
    storage.setItem("device_id", json.device_id);
  },
  // called when the user clicks on the logout button
  logout: async () => {
    console.log("logout");

    const logout_api_url = storage.getItem("base_url") + "/_matrix/client/r0/logout";
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
  checkError: (err: HttpError) => {
    const errorBody = err.body as MatrixError;
    const status = err.status;

    if (status === 401 || status === 403) {
      return Promise.reject({message: displayError(errorBody.errcode, status, errorBody.error)});
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
