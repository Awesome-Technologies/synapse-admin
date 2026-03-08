import userEvent from "@testing-library/user-event";
import polyglotI18nProvider from "ra-i18n-polyglot";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminContext, AuthProvider } from "react-admin";

import LoginPage from "./LoginPage";
import { AppContext } from "../AppContext";
import englishMessages from "../i18n/en";
import storage from "../storage";

const {
  mockedNotify,
  mockedSetLocale,
  mockedGetServerVersion,
  mockedGetSupportedFeatures,
  mockedGetSupportedLoginFlows,
  mockedGetWellKnownUrl,
  mockedIsValidBaseUrl,
  mockedSplitMxid,
} = vi.hoisted(() => ({
  mockedNotify: vi.fn(),
  mockedSetLocale: vi.fn(),
  mockedGetServerVersion: vi.fn(),
  mockedGetSupportedFeatures: vi.fn(),
  mockedGetSupportedLoginFlows: vi.fn(),
  mockedGetWellKnownUrl: vi.fn(),
  mockedIsValidBaseUrl: vi.fn(),
  mockedSplitMxid: vi.fn(),
}));

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();

  return {
    ...actual,
    useNotify: () => mockedNotify,
    useLocaleState: () => ["en", mockedSetLocale],
    useLocales: () => [
      { locale: "en", name: "English" },
      { locale: "de", name: "Deutsch" },
    ],
  };
});

vi.mock("../synapse/synapse", () => ({
  getServerVersion: mockedGetServerVersion,
  getSupportedFeatures: mockedGetSupportedFeatures,
  getSupportedLoginFlows: mockedGetSupportedLoginFlows,
  getWellKnownUrl: mockedGetWellKnownUrl,
  isValidBaseUrl: mockedIsValidBaseUrl,
  splitMxid: mockedSplitMxid,
}));

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en", [{ locale: "en", name: "English" }]);

const authProvider: AuthProvider = {
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  checkError: vi.fn(),
  getPermissions: vi.fn(),
};

const renderLoginPage = (restrictBaseUrl?: string | string[]) =>
  render(
    <AppContext.Provider value={{ restrictBaseUrl }}>
      <AdminContext authProvider={authProvider} i18nProvider={i18nProvider}>
        <LoginPage />
      </AdminContext>
    </AppContext.Provider>
  );

describe("LoginForm", () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
    globalThis.alert = vi.fn();
    window.history.replaceState({}, "", "/");
    vi.mocked(authProvider.login).mockResolvedValue(undefined);
    vi.mocked(authProvider.logout).mockResolvedValue(undefined);
    vi.mocked(authProvider.checkAuth).mockResolvedValue(undefined);
    vi.mocked(authProvider.checkError).mockResolvedValue(undefined);
    vi.mocked(authProvider.getPermissions!).mockResolvedValue(undefined);
    mockedGetServerVersion.mockResolvedValue("1.99.0");
    mockedGetSupportedFeatures.mockResolvedValue({ versions: ["v1.11", "v1.12"] });
    mockedGetSupportedLoginFlows.mockResolvedValue([{ type: "m.login.password" }]);
    mockedGetWellKnownUrl.mockResolvedValue("https://matrix.example.com");
    mockedIsValidBaseUrl.mockImplementation(
      (value?: string) => typeof value === "string" && /^https?:\/\/[a-zA-Z0-9\-.]+(:\d+)?/.test(value)
    );
    mockedSplitMxid.mockImplementation((value?: string) => {
      if (!value?.includes(":")) {
        return undefined;
      }

      return { domain: value.split(":")[1] };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with no restriction to homeserver", () => {
    renderLoginPage();

    screen.getByText(englishMessages.synapseadmin.auth.welcome);
    screen.getByRole("combobox", { name: "" });
    screen.getByRole("textbox", { name: englishMessages.ra.auth.username });
    screen.getByText(englishMessages.ra.auth.password);
    const baseUrlInput = screen.getByRole("textbox", {
      name: englishMessages.synapseadmin.auth.base_url,
    });
    expect(baseUrlInput.className.split(" ")).not.toContain("Mui-readOnly");
    screen.getByRole("button", { name: englishMessages.ra.auth.sign_in });
  });

  it("renders with single restricted homeserver", () => {
    renderLoginPage("https://matrix.example.com");

    screen.getByText(englishMessages.synapseadmin.auth.welcome);
    screen.getByRole("combobox", { name: "" });
    screen.getByRole("textbox", { name: englishMessages.ra.auth.username });
    screen.getByText(englishMessages.ra.auth.password);
    const baseUrlInput = screen.getByRole("textbox", {
      name: englishMessages.synapseadmin.auth.base_url,
    });
    expect(baseUrlInput.className.split(" ")).toContain("Mui-readOnly");
    screen.getByRole("button", { name: englishMessages.ra.auth.sign_in });
  });

  it("renders with multiple restricted homeservers", async () => {
    renderLoginPage(["https://matrix.example.com", "https://matrix.example.org"]);

    screen.getByText(englishMessages.synapseadmin.auth.welcome);
    screen.getByRole("combobox", { name: "" });
    screen.getByRole("textbox", { name: englishMessages.ra.auth.username });
    screen.getByText(englishMessages.ra.auth.password);
    screen.getByRole("combobox", {
      name: englishMessages.synapseadmin.auth.base_url,
    });
    screen.getByRole("button", { name: englishMessages.ra.auth.sign_in });
  });

  it("uses the SSO login token from the callback URL", async () => {
    storage.setItem("sso_base_url", "https://matrix.example.com");
    window.history.replaceState({}, "", "/?loginToken=sso_token");

    renderLoginPage();

    await waitFor(() =>
      expect(authProvider.login).toHaveBeenCalledWith({
        base_url: "https://matrix.example.com",
        username: null,
        password: null,
        loginToken: "sso_token",
      })
    );
    expect(storage.getItem("sso_base_url")).toBeNull();
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("");
  });

  it("ignores SSO callback URLs without a stored base URL", async () => {
    window.history.replaceState({}, "", "/?loginToken=sso_token");

    renderLoginPage();

    await waitFor(() => expect(storage.getItem("sso_base_url")).toBeNull());
    expect(authProvider.login).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("");
  });

  it("loads server metadata and enables SSO when supported", async () => {
    mockedGetSupportedLoginFlows.mockResolvedValue([{ type: "m.login.password" }, { type: "m.login.sso" }]);

    renderLoginPage();

    fireEvent.change(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }), {
      target: { value: "https://matrix.example.com" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }));

    await waitFor(() => expect(mockedGetServerVersion).toHaveBeenCalledWith("https://matrix.example.com"));
    await waitFor(() =>
      expect(mockedGetSupportedFeatures).toHaveBeenCalledWith("https://matrix.example.com")
    );
    await waitFor(() =>
      expect(mockedGetSupportedLoginFlows).toHaveBeenCalledWith("https://matrix.example.com")
    );
    expect(screen.getByText(/1\.99\.0/)).toBeTruthy();
    expect(screen.getByText(/v1\.11, v1\.12/)).toBeTruthy();
    expect(screen.getByRole("button", { name: englishMessages.synapseadmin.auth.sso_sign_in }).hasAttribute("disabled")).toBe(false);
  });

  it("submits credentials and reports login errors via notify", async () => {
    const user = userEvent.setup();
    vi.mocked(authProvider.login).mockRejectedValueOnce(new Error("bad credentials"));

    renderLoginPage();

    await user.type(screen.getByRole("textbox", { name: englishMessages.ra.auth.username }), "admin");
    await user.type(document.querySelector('input[name="password"]') as HTMLInputElement, "secret");
    fireEvent.change(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }), {
      target: { value: "https://matrix.example.com" },
    });
    await user.click(screen.getByRole("button", { name: englishMessages.ra.auth.sign_in }));

    await waitFor(() =>
      expect(authProvider.login).toHaveBeenCalledWith({
        username: "admin",
        password: "secret",
        base_url: "https://matrix.example.com",
      })
    );
    await waitFor(() => expect(mockedNotify).toHaveBeenCalledWith("bad credentials", { type: "warning" }));
  });

  it("stores the SSO base url before redirecting", async () => {
    const user = userEvent.setup();
    mockedGetSupportedLoginFlows.mockResolvedValue([{ type: "m.login.sso" }]);

    renderLoginPage();

    fireEvent.change(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }), {
      target: { value: "https://matrix.example.com" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }));

    const originalHref = window.location.href;
    await waitFor(() =>
      expect(screen.getByRole("button", { name: englishMessages.synapseadmin.auth.sso_sign_in }).hasAttribute("disabled")).toBe(false)
    );
    await user.click(screen.getByRole("button", { name: englishMessages.synapseadmin.auth.sso_sign_in }));

    expect(storage.getItem("sso_base_url")).toBe("https://matrix.example.com");
    expect(window.location.href).not.toBe(originalHref);
    expect(window.location.href).toContain("/_matrix/client/r0/login/sso/redirect");
  });

  it("clears server details when metadata requests fail", async () => {
    mockedGetServerVersion.mockRejectedValueOnce(new Error("version failed"));
    mockedGetSupportedFeatures.mockRejectedValueOnce(new Error("features failed"));
    mockedGetSupportedLoginFlows.mockRejectedValueOnce(new Error("flows failed"));

    renderLoginPage();

    fireEvent.change(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }), {
      target: { value: "https://matrix.example.com" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }));

    await waitFor(() => expect(mockedGetServerVersion).toHaveBeenCalledWith("https://matrix.example.com"));
    await waitFor(() =>
      expect(mockedGetSupportedFeatures).toHaveBeenCalledWith("https://matrix.example.com")
    );
    await waitFor(() =>
      expect(mockedGetSupportedLoginFlows).toHaveBeenCalledWith("https://matrix.example.com")
    );
    expect(screen.queryByText(/1\.99\.0/)).toBeNull();
    expect(screen.queryByText(/v1\.11/)).toBeNull();
    expect(screen.getByRole("button", { name: englishMessages.synapseadmin.auth.sso_sign_in }).hasAttribute("disabled")).toBe(true);
  });

  it("changes the locale from the language select", async () => {
    const user = userEvent.setup();

    renderLoginPage();

    await user.click(screen.getByRole("combobox", { name: "" }));
    await user.click(screen.getByRole("option", { name: "Deutsch" }));

    expect(mockedSetLocale).toHaveBeenCalledWith("de");
  });
});
