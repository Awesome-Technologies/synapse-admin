import fetchMock from "jest-fetch-mock";

import authProvider from "./authProvider";
import storage from "../storage";

fetchMock.enableMocks();

describe("authProvider", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    storage.clear();
  });

  describe("login", () => {
    it("should successfully login with username and password", async () => {
      fetchMock.once(
        JSON.stringify({
          home_server: "example.com",
          user_id: "@user:example.com",
          access_token: "foobar",
          device_id: "some_device",
        })
      );

      const ret: undefined = await authProvider.login({
        base_url: "http://example.com",
        username: "@user:example.com",
        password: "secret",
      });

      expect(ret).toBe(undefined);
      expect(fetch).toBeCalledWith("http://example.com/_matrix/client/r0/login", {
        body: JSON.stringify({
          device_id: null,
          initial_device_display_name: "Synapse Admin",
          type: "m.login.password",
          user: "@user:example.com",
          password: "secret",
          identifier: {
            type: "m.id.user",
            user: "@user:example.com",
          }
        }),
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        method: "POST",
      });
      expect(storage.getItem("base_url")).toEqual("http://example.com");
      expect(storage.getItem("user_id")).toEqual("@user:example.com");
      expect(storage.getItem("access_token")).toEqual("foobar");
      expect(storage.getItem("device_id")).toEqual("some_device");
    });
  });

  it("should successfully login with token", async () => {
    fetchMock.once(
      JSON.stringify({
        home_server: "example.com",
        user_id: "@user:example.com",
        access_token: "foobar",
        device_id: "some_device",
      })
    );

    const ret: undefined = await authProvider.login({
      base_url: "https://example.com/",
      loginToken: "login_token",
    });

    expect(ret).toBe(undefined);
    expect(fetch).toHaveBeenCalledWith("https://example.com/_matrix/client/r0/login", {
      body: '{"device_id":null,"initial_device_display_name":"Synapse Admin","type":"m.login.token","token":"login_token"}',
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      method: "POST",
    });
    expect(storage.getItem("base_url")).toEqual("https://example.com");
    expect(storage.getItem("user_id")).toEqual("@user:example.com");
    expect(storage.getItem("access_token")).toEqual("foobar");
    expect(storage.getItem("device_id")).toEqual("some_device");
  });

  describe("logout", () => {
    it("should remove the access_token from storage", async () => {
      storage.setItem("base_url", "example.com");
      storage.setItem("access_token", "foo");
      fetchMock.mockResponse(JSON.stringify({}));

      await authProvider.logout(null);

      expect(fetch).toBeCalledWith("example.com/_matrix/client/r0/logout", {
        headers: new Headers({
          Accept: "application/json",
          Authorization: "Bearer foo",
        }),
        method: "POST",
        user: { authenticated: true, token: "Bearer foo" },
      });
      expect(storage.getItem("access_token")).toBeNull();
    });
  });

  describe("checkError", () => {
    it("should resolve if error.status is not 401 or 403", async () => {
      await expect(authProvider.checkError({ status: 200 })).resolves.toBeUndefined();
    });

    it("should reject if error.status is 401", async () => {
      await expect(authProvider.checkError({ status: 401 })).rejects.toBeUndefined();
    });

    it("should reject if error.status is 403", async () => {
      await expect(authProvider.checkError({ status: 403 })).rejects.toBeUndefined();
    });
  });

  describe("checkAuth", () => {
    it("should reject when not logged in", async () => {
      await expect(authProvider.checkAuth({})).rejects.toBeUndefined();
    });

    it("should resolve when logged in", async () => {
      storage.setItem("access_token", "foobar");

      await expect(authProvider.checkAuth({})).resolves.toBeUndefined();
    });
  });

  describe("getPermissions", () => {
    it("should do nothing", async () => {
      await expect(authProvider.getPermissions(null)).resolves.toBeUndefined();
    });
  });
});
