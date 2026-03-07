import { cleanup, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import englishMessages from "./i18n/en";

// import { prettyDOM } from "@testing-library/dom";
// import { writeFileSync } from "node:fs";

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

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();

  return {
    ...actual,
    // The custom import route is outside the assertions in this file and is noisy under test.
    CustomRoutes: () => null,
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

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
    cleanup();
    mockedQueryClient.current?.clear();
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
    expect(screen.queryByText(englishMessages.synapseadmin.auth.welcome)).toBeNull();
    await screen.findByText("Alice");
    await waitFor(() => expect(mockedAuthProvider.checkAuth).toHaveBeenCalled());

    //writeFileSync("./logged-in-screen.html", prettyDOM(document.body, 999999, { highlight: false }) ?? "");
  });

  it("renders login page when not authenticated", async () => {
    render(<App />);
    await screen.findByText(englishMessages.synapseadmin.auth.welcome);
    screen.getByRole("textbox", { name: englishMessages.ra.auth.username });
    screen.getByText(englishMessages.ra.auth.password);
    screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url });
    screen.getByRole("button", { name: englishMessages.ra.auth.sign_in });

    await waitFor(() => expect(mockedAuthProvider.checkAuth).toHaveBeenCalled());

    //writeFileSync("./login-screen.html", prettyDOM(document.body, 999999, { highlight: false }) ?? "");
  });
});
