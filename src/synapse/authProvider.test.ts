import authProvider from "./authProvider";
import storage from "../storage";

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
      expect(fetch).toHaveBeenCalledWith("http://example.com/_matrix/client/r0/login", {
        body: JSON.stringify({
          device_id: null,
          initial_device_display_name: "Synapse Admin",
          type: "m.login.password",
          user: "@user:example.com",
          password: "secret",
          identifier: {
            type: "m.id.user",
            user: "@user:example.com",
          },
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

  describe("login with stale device_id", () => {
    it("should retry login without device_id when the first attempt fails", async () => {
      // A stale device_id is present from a previous session that was
      // externally revoked (e.g. via Element "Remove Device").
      storage.setItem("device_id", "REVOKED_DEVICE");

      // First call with the stale device_id fails.
      fetchMock.mockRejectOnce(new Error("M_UNKNOWN_DEVICE"));

      // Second call without device_id succeeds.
      fetchMock.mockResponseOnce(
        JSON.stringify({
          home_server: "example.com",
          user_id: "@user:example.com",
          access_token: "fresh_token",
          device_id: "NEW_DEVICE",
        })
      );

      await authProvider.login({
        base_url: "http://example.com",
        username: "@user:example.com",
        password: "secret",
      });

      // The first call should include the stale device_id.
      expect(fetch).toHaveBeenCalledTimes(2);
      const firstBody = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
      expect(firstBody.device_id).toBe("REVOKED_DEVICE");

      // The retry should use null device_id.
      const secondBody = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
      expect(secondBody.device_id).toBeNull();

      // Storage should reflect the fresh session.
      expect(storage.getItem("access_token")).toBe("fresh_token");
      expect(storage.getItem("device_id")).toBe("NEW_DEVICE");
    });

    it("should clear stale device_id from storage after retry", async () => {
      storage.setItem("device_id", "STALE_DEVICE");

      fetchMock.mockRejectOnce(new Error("M_UNKNOWN_DEVICE"));
      fetchMock.mockResponseOnce(
        JSON.stringify({
          home_server: "example.com",
          user_id: "@user:example.com",
          access_token: "new_token",
          device_id: "FRESH_DEVICE",
        })
      );

      await authProvider.login({
        base_url: "http://example.com",
        username: "@user:example.com",
        password: "secret",
      });

      // The stale device_id should have been removed before the retry and
      // replaced by the new one from the server response.
      expect(storage.getItem("device_id")).toBe("FRESH_DEVICE");
    });

    it("should propagate the error when login fails without a stored device_id", async () => {
      // No stored device_id — there is nothing to retry with.
      fetchMock.mockRejectOnce(new Error("M_FORBIDDEN"));

      await expect(
        authProvider.login({
          base_url: "http://example.com",
          username: "@user:example.com",
          password: "wrong",
        })
      ).rejects.toThrow("M_FORBIDDEN");

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should propagate the error when both login attempts fail", async () => {
      storage.setItem("device_id", "STALE");

      fetchMock.mockRejectOnce(new Error("first failure"));
      fetchMock.mockRejectOnce(new Error("second failure"));

      await expect(
        authProvider.login({
          base_url: "http://example.com",
          username: "@user:example.com",
          password: "wrong",
        })
      ).rejects.toThrow("second failure");

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("logout", () => {
    it("should remove the access_token and device_id from storage", async () => {
      storage.setItem("base_url", "example.com");
      storage.setItem("access_token", "foo");
      storage.setItem("device_id", "some_device");
      fetchMock.mockResponse(JSON.stringify({}));

      await authProvider.logout(null);

      expect(fetch).toHaveBeenCalledWith("example.com/_matrix/client/r0/logout", {
        headers: new Headers({
          Accept: "application/json",
          Authorization: "Bearer foo",
        }),
        method: "POST",
        user: { authenticated: true, token: "Bearer foo" },
      });
      expect(storage.getItem("access_token")).toBeNull();
      expect(storage.getItem("device_id")).toBeNull();
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
      if (!authProvider.getPermissions) {
        throw new Error("getPermissions must be defined");
      }

      await expect(authProvider.getPermissions(null)).resolves.toBeUndefined();
    });
  });

  describe("getIdentity", () => {
    it("should reject when not logged in", async () => {
      await expect(authProvider.getIdentity!()).rejects.toBeUndefined();
    });

    it("should return the stored identity for logged-in users", async () => {
      storage.setItem("access_token", "foobar");
      storage.setItem("user_id", "@user:example.com");

      await expect(authProvider.getIdentity!()).resolves.toEqual({
        id: "@user:example.com",
        fullName: "user",
      });
    });
  });

  describe("canAccess", () => {
    it("should deny access when logged out", async () => {
      await expect(authProvider.canAccess!({ action: "list", resource: "users" })).resolves.toBe(false);
    });

    it("should allow access when logged in", async () => {
      storage.setItem("access_token", "foobar");

      await expect(authProvider.canAccess!({ action: "list", resource: "users" })).resolves.toBe(true);
    });
  });
});
