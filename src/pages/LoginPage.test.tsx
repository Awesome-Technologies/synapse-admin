import polyglotI18nProvider from "ra-i18n-polyglot";

import { render, screen, waitFor } from "@testing-library/react";
import { AdminContext, AuthProvider } from "react-admin";

import LoginPage from "./LoginPage";
import { AppContext } from "../AppContext";
import englishMessages from "../i18n/en";
import storage from "../storage";

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
    vi.mocked(authProvider.getPermissions).mockResolvedValue(undefined);
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
});
