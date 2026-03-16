import { cleanup, render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import App from "./App";
import englishMessages from "./i18n/en";

// Keep auth decisions deterministic so each test can choose the logged-in state explicitly.
const mockedAuthProvider = vi.hoisted(() => ({
  checkAuth: vi.fn(),
  checkError: vi.fn(),
  getPermissions: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

// React-admin touches multiple data provider methods while booting the admin shell.
const mockedDataProvider = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  getList: vi.fn(),
  getMany: vi.fn(),
  getManyReference: vi.fn(),
  getOne: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
}));

// App creates its QueryClient at module scope, so tests clear the shared cache between renders.
const mockedQueryClient = vi.hoisted(() => ({
  current: null as { clear: () => void } | null,
}));

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

vi.mock("@tanstack/react-query", async importOriginal => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();

  class TestQueryClient extends actual.QueryClient {
    constructor(...args: ConstructorParameters<typeof actual.QueryClient>) {
      super(...args);
      mockedQueryClient.current = this;
    }
  }

  return {
    ...actual,
    QueryClient: TestQueryClient,
  };
});

vi.mock("./synapse/authProvider", () => ({
  __esModule: true,
  default: mockedAuthProvider,
}));

vi.mock("./synapse/dataProvider", () => ({
  __esModule: true,
  default: mockedDataProvider,
}));

describe.sequential("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = "";
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    mockedAuthProvider.login.mockResolvedValue(undefined);
    mockedAuthProvider.logout.mockResolvedValue(undefined);
    mockedAuthProvider.checkAuth.mockRejectedValue(undefined);
    mockedAuthProvider.checkError.mockResolvedValue(undefined);
    mockedAuthProvider.getPermissions.mockResolvedValue(undefined);

    mockedDataProvider.getList.mockResolvedValue({ data: [], total: 0 });
    mockedDataProvider.getManyReference.mockResolvedValue({ data: [], total: 0 });
    mockedDataProvider.getMany.mockResolvedValue({ data: [] });
    mockedDataProvider.getOne.mockResolvedValue({ data: { id: "1" } });
    mockedDataProvider.create.mockResolvedValue({ data: { id: "1" } });
    mockedDataProvider.update.mockResolvedValue({ data: { id: "1" } });
    mockedDataProvider.updateMany.mockResolvedValue({ data: [] });
    mockedDataProvider.delete.mockResolvedValue({ data: { id: "1" } });
    mockedDataProvider.deleteMany.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    const consoleOutput = [...consoleErrorSpy.mock.calls, ...consoleWarnSpy.mock.calls].flat().join("\n");

    cleanup();
    mockedQueryClient.current?.clear();
    vi.restoreAllMocks();

    expect(consoleOutput).not.toContain("Error:");
    expect(consoleOutput).not.toContain("Warn");
  });

  it("renders the app after successful login", async () => {
    mockedAuthProvider.checkAuth.mockResolvedValue(undefined);
    mockedDataProvider.getList.mockResolvedValue({
      data: [
        {
          id: "@alice:example.com",
          displayname: "Alice",
          avatar_src: "mxc://example.com/alice",
          is_guest: false,
          admin: true,
          deactivated: false,
          locked: false,
          erased: false,
          creation_ts: "2024-01-01T00:00:00.000Z",
        },
      ],
      total: 1,
    });

    render(<App />);

    await screen.findByLabelText("Close menu");
    await screen.findByText("Alice");
    expect(screen.queryByText(englishMessages.synapseadmin.auth.welcome)).toBeNull();
    await waitFor(() => expect(mockedAuthProvider.checkAuth).toHaveBeenCalled());
  });

  it("renders login page when not authenticated", async () => {
    render(<App />);
    const progressBar = screen.queryByRole('progressbar');
    if (progressBar) {
      await waitForElementToBeRemoved(progressBar);
    }
    expect(await screen.findByText(englishMessages.synapseadmin.auth.welcome, undefined, { timeout: 5000 })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: englishMessages.ra.auth.username })).toBeTruthy();
    expect(screen.getByText(englishMessages.ra.auth.password)).toBeTruthy();
    expect(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url })).toBeTruthy();
    expect(screen.getByRole("button", { name: englishMessages.ra.auth.sign_in })).toBeTruthy();

    await waitFor(() => expect(mockedAuthProvider.checkAuth).toHaveBeenCalled());
  });

  it("renders the import route for authenticated users", async () => {
    window.location.hash = "#/import_users";
    mockedAuthProvider.checkAuth.mockResolvedValue(undefined);

    render(<App />);

    expect(await screen.findByText(englishMessages.import_users.title)).toBeTruthy();
  });

  it("keeps the import route behind authentication", async () => {
    window.location.hash = "#/import_users";

    render(<App />);

    const progressBar = screen.queryByRole('progressbar');
    if (progressBar) {
      await waitForElementToBeRemoved(progressBar);
    }
    expect(await screen.findByText(englishMessages.synapseadmin.auth.welcome, undefined, { timeout: 5000 })).toBeTruthy();
    expect(screen.queryByText(englishMessages.import_users.title)).toBeNull();
  });
});
