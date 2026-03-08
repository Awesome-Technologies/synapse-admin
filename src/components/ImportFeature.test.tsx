import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const {
  mockedParseCsv,
  mockedUnparseCsv,
  mockedNotify,
  mockedUseDataProvider,
  mockedUseTranslate,
} = vi.hoisted(() => ({
  mockedParseCsv: vi.fn(),
  mockedUnparseCsv: vi.fn(),
  mockedNotify: vi.fn(),
  mockedUseDataProvider: vi.fn(),
  mockedUseTranslate: vi.fn(),
}));

vi.mock("papaparse", () => ({
  parse: mockedParseCsv,
  unparse: mockedUnparseCsv,
}));

vi.mock("ra-core", async importOriginal => {
  const actual = await importOriginal<typeof import("ra-core")>();

  return {
    ...actual,
    useTranslate: mockedUseTranslate,
  };
});

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();

  return {
    ...actual,
    Title: () => null,
    useDataProvider: mockedUseDataProvider,
    useNotify: () => mockedNotify,
  };
});

import { ImportFeature, doUserImport, verifyImportCsv } from "./ImportFeature";

const translate = (key: string, options?: Record<string, unknown>) => `${key}:${JSON.stringify(options ?? {})}`;

describe("ImportFeature helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects CSV files without the required fields", () => {
    const setError = vi.fn();

    const valid = verifyImportCsv(
      {
        data: [],
        meta: { fields: ["displayname"] },
        errors: [],
      } as never,
      { setError, setStats: vi.fn(), setValues: vi.fn(), translate }
    );

    expect(valid).toBe(false);
    expect(setError).toHaveBeenCalledWith('import_users.error.required_field:{"field":"id"}');
  });

  it("normalizes imported CSV values and collects validation errors", () => {
    const setError = vi.fn();
    const setStats = vi.fn();
    const setValues = vi.fn();
    const rows = [
      {
        id: "@alice:example.com",
        displayname: "Alice",
        user_type: "support",
        name: "duplicate",
        is_admin: "true",
        is_guest: "true",
        admin: "nope",
        deactivated: "",
        password: "secret",
        avatar_url: "mxc://example/alice",
      },
    ];

    const valid = verifyImportCsv(
      {
        data: rows,
        meta: { fields: ["id", "displayname", "name", "user_type", "is_admin", "is_guest", "admin", "deactivated"] },
        errors: [{ message: "csv warning" }],
      } as never,
      { setError, setStats, setValues, translate }
    );

    expect(valid).toBe(true);
    expect(setError).toHaveBeenCalledWith([
      "csv warning",
      'import_users.error.invalid_value:{"field":"admin","row":0}',
    ]);
    expect(setStats).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 1,
        id: 1,
        is_guest: 1,
        admin: 0,
        password: 1,
        avatar_url: 1,
      })
    );
    expect(setValues).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "@alice:example.com",
        displayname: "Alice",
        is_guest: true,
        admin: false,
        deactivated: false,
      }),
    ]);
  });

  it("creates new users during a dry run without calling create", async () => {
    const dataProvider = {
      getOne: vi.fn().mockRejectedValue(new Error("missing")),
      create: vi.fn(),
    };
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await doUserImport(
      dataProvider as never,
      [{ id: "@alice:example.com", displayname: "Alice" }],
      "stop",
      true,
      "update",
      true,
      { setError: vi.fn(), setProgress: vi.fn(), translate }
    );

    expect(result.succeededRecords).toHaveLength(1);
    expect(dataProvider.create).not.toHaveBeenCalled();
  });

  it("skips existing users when conflict mode is skip", async () => {
    const dataProvider = {
      getOne: vi.fn().mockResolvedValue({ data: { id: "@alice:example.com" } }),
      create: vi.fn(),
    };
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await doUserImport(
      dataProvider as never,
      [{ id: "@alice:example.com", displayname: "Alice" }],
      "skip",
      true,
      "update",
      false,
      { setError: vi.fn(), setProgress: vi.fn(), translate }
    );

    expect(result.skippedRecords).toEqual([
      expect.objectContaining({ id: "@alice:example.com", displayname: "Alice" }),
    ]);
    expect(dataProvider.create).not.toHaveBeenCalled();
  });

  it("reports the failing row when conflict mode stops on duplicates", async () => {
    const setError = vi.fn();
    const dataProvider = {
      getOne: vi.fn().mockResolvedValue({ data: { id: "@alice:example.com" } }),
      create: vi.fn(),
    };
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await doUserImport(
      dataProvider as never,
      [{ id: "@alice:example.com", displayname: "Alice" }],
      "stop",
      true,
      "preserve",
      false,
      { setError, setProgress: vi.fn(), translate }
    );

    expect(result.succeededRecords).toHaveLength(0);
    expect(setError).toHaveBeenCalledWith(
      'import_users.error.at_entry:{"entry":1,"message":"import_users.error.id_exists:{\\"id\\":\\"@alice:example.com\\"}"}'
    );
  });
});

describe("ImportFeature UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseTranslate.mockReturnValue((key: string, options?: Record<string, unknown>) =>
      `${key}:${JSON.stringify(options ?? {})}`
    );
    mockedUseDataProvider.mockReturnValue({
      getOne: vi.fn().mockRejectedValue(new Error("missing")),
      create: vi.fn().mockResolvedValue({ data: { id: "@alice:example.com" } }),
    });
    mockedUnparseCsv.mockReturnValue("id,displayname");
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:skipped");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unreasonably large files before parsing", async () => {
    const user = userEvent.setup();
    const { container } = render(<ImportFeature />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["id,displayname"], "users.csv", { type: "text/csv" });

    Object.defineProperty(file, "size", { value: 100000001 });

    await user.upload(input, file);

    expect(mockedParseCsv).not.toHaveBeenCalled();
    expect(mockedNotify).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/import_users.errors.unreasonably_big/)).toBeTruthy();
  });

  it("shows parsed statistics and import controls", async () => {
    const user = userEvent.setup();
    mockedParseCsv.mockImplementation((_file, options) => {
      options.complete({
        data: [{ id: "@alice:example.com", displayname: "Alice", password: "secret" }],
        meta: { fields: ["id", "displayname", "password"] },
        errors: [],
      });
    });

    const { container } = render(<ImportFeature />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["id,displayname\n@alice:example.com,Alice"], "users.csv", { type: "text/csv" });

    await user.upload(input, file);

    expect(await screen.findByText("import_users.cards.importstats.header:{}")).toBeTruthy();
    expect(screen.getByText("import_users.cards.ids.header:{}")).toBeTruthy();
    expect(screen.getByText("import_users.cards.passwords.header:{}")).toBeTruthy();
    expect(screen.getByRole("button", { name: "import_users.cards.startImport.run_import:{}" })).toBeTruthy();
  });

  it("updates user id mode and dry-run settings from the controls", async () => {
    const user = userEvent.setup();
    mockedParseCsv.mockImplementation((_file, options) => {
      options.complete({
        data: [{ id: "@alice:example.com", displayname: "Alice", password: "secret", is_guest: "", admin: "", deactivated: "" }],
        meta: { fields: ["id", "displayname", "password", "is_guest", "admin", "deactivated"] },
        errors: [],
      });
    });

    const { container } = render(<ImportFeature />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["id,displayname"], "users.csv", { type: "text/csv" }));

    const selects = container.querySelectorAll("select");
    const dryRunCheckbox = screen.getByLabelText("import_users.cards.startImport.simulate_only:{}") as HTMLInputElement;

    await user.selectOptions(selects[1] as HTMLSelectElement, "update");
    await user.click(dryRunCheckbox);

    expect((selects[1] as HTMLSelectElement).value).toBe("update");
    expect(dryRunCheckbox.checked).toBe(false);
  });

  it("runs the import and offers skipped-record download", async () => {
    const user = userEvent.setup();
    const getOne = vi.fn().mockResolvedValue({ data: { id: "@alice:example.com" } });
    mockedUseDataProvider.mockReturnValue({
      getOne,
      create: vi.fn(),
    });
    mockedParseCsv.mockImplementation((_file, options) => {
      options.complete({
        data: [{ id: "@alice:example.com", displayname: "Alice", is_guest: "", admin: "", deactivated: "" }],
        meta: { fields: ["id", "displayname", "is_guest", "admin", "deactivated"] },
        errors: [],
      });
    });

    const createElementSpy = vi.spyOn(document, "createElement");
    const appendChildSpy = vi.spyOn(document.body, "appendChild");

    const { container } = render(<ImportFeature />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["id,displayname"], "users.csv", { type: "text/csv" }));

    await user.selectOptions(container.querySelector("select") as HTMLSelectElement, "skip");
    await user.click(screen.getByRole("button", { name: "import_users.cards.startImport.run_import:{}" }));

    expect(await screen.findByText("import_users.cards.results.header:{}")).toBeTruthy();
    expect(
      screen.getAllByText((content, node) => node?.textContent?.includes("import_users.cards.results.skipped:1") ?? false)
        .length
    ).toBeGreaterThan(0);
    expect(mockedUnparseCsv).toHaveBeenCalledWith([expect.objectContaining({ displayname: "Alice" })]);

    await user.click(screen.getByRole("button", { name: "import_users.cards.results.download_skipped:{}" }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(appendChildSpy.mock.calls.length).toBeGreaterThan(0);
  });

});
