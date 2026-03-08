import { render, screen } from "@testing-library/react";

const {
  bulkDeleteButtonMock,
  createButtonMock,
  dataTableColMock,
  deleteButtonMock,
  exportButtonMock,
  selectInputMock,
  serverNoticeBulkButtonMock,
  serverNoticeButtonMock,
  useCreatePathMock,
  useListContextMock,
  useRecordContextMock,
} = vi.hoisted(() => ({
  bulkDeleteButtonMock: vi.fn((props: any) => <div data-testid="bulk-delete">{props.label}</div>),
  createButtonMock: vi.fn(() => <span>create-button</span>),
  dataTableColMock: vi.fn((props: any) => <span data-testid="data-table-col">{props.source ?? props.label}</span>),
  deleteButtonMock: vi.fn((props: any) => <div data-testid="delete-button">{props.label}</div>),
  exportButtonMock: vi.fn(({ disabled, maxResults }: any) => (
    <button type="button">{String(disabled)}:{String(maxResults ?? "")}</button>
  )),
  selectInputMock: vi.fn(({ source }: any) => <span>{source}</span>),
  serverNoticeBulkButtonMock: vi.fn(() => <span>server-notice-bulk</span>),
  serverNoticeButtonMock: vi.fn(() => <span>server-notice</span>),
  useCreatePathMock: vi.fn(({ resource, id, type }: any) => `/${resource}/${id}/${type}`),
  useListContextMock: vi.fn(),
  useRecordContextMock: vi.fn(),
}));

vi.mock("../components/AvatarField", () => ({
  __esModule: true,
  default: () => <span>avatar-field</span>,
}));

vi.mock("../components/ServerNotices", () => ({
  ServerNoticeBulkButton: serverNoticeBulkButtonMock,
  ServerNoticeButton: serverNoticeButtonMock,
}));

vi.mock("../components/devices", () => ({
  DeviceRemoveButton: () => <span>device-remove-button</span>,
}));

vi.mock("../components/media", () => ({
  MediaIDField: () => <span>media-id-field</span>,
  ProtectMediaButton: () => <span>protect-media-button</span>,
  QuarantineMediaButton: () => <span>quarantine-media-button</span>,
}));

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();
  const mockedDataTable = Object.assign(
    ({ children, rowClick, bulkActionButtons }: any) => (
      <div
        data-testid="data-table"
        data-row-click={typeof rowClick === "function" ? rowClick("@alice:example.com") : rowClick}
      >
        {bulkActionButtons}
        {children}
      </div>
    ),
    {
      Col: ({ children, ...props }: any) => (
        <div>
          {dataTableColMock(props)}
          {children}
        </div>
      ),
    }
  );

  return {
    ...actual,
    ArrayField: ({ children }: any) => <div>{children}</div>,
    ArrayInput: ({ children }: any) => <div>{children}</div>,
    BooleanField: ({ source }: any) => <span>{source}</span>,
    BooleanInput: ({ source, label }: any) => <span>{source ?? label}</span>,
    BulkDeleteButton: bulkDeleteButtonMock,
    Button: ({ to, label, children }: any) => (
      <button type="button" data-to={to}>
        {label}
        {children}
      </button>
    ),
    Create: ({ children }: any) => <div>{children}</div>,
    CreateButton: createButtonMock,
    DataTable: mockedDataTable,
    DateField: ({ source }: any) => <span>{source}</span>,
    DeleteButton: deleteButtonMock,
    Edit: ({ children, actions, title }: any) => (
      <div>
        {actions}
        {title}
        {children}
      </div>
    ),
    ExportButton: exportButtonMock,
    FormTab: ({ children }: any) => <div>{children}</div>,
    List: ({ children, actions }: any) => (
      <div>
        {actions}
        {children}
      </div>
    ),
    NumberField: ({ source }: any) => <span>{source}</span>,
    Pagination: () => <span>pagination</span>,
    PasswordInput: ({ source }: any) => <span>{source}</span>,
    ReferenceField: ({ children }: any) => <div>{children}</div>,
    ReferenceManyField: ({ children }: any) => <div>{children}</div>,
    SearchInput: ({ source }: any) => <span>{source}</span>,
    SelectInput: selectInputMock,
    SimpleForm: ({ children }: any) => <div>{children}</div>,
    SimpleFormIterator: ({ children }: any) => <div>{children}</div>,
    TabbedForm: ({ children }: any) => <div>{children}</div>,
    TextField: ({ source }: any) => <span>{source}</span>,
    TextInput: ({ source }: any) => <span>{source}</span>,
    TopToolbar: ({ children }: any) => <div>{children}</div>,
    maxLength: () => "maxLength",
    regex: () => "regex",
    required: () => "required",
    useCreatePath: () => useCreatePathMock,
    useListContext: useListContextMock,
    useRecordContext: useRecordContextMock,
    useTranslate: () => (key: string) => key,
  };
});

import users, { UserCreate, UserEdit, UserList } from "./users";

describe("users resource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useListContextMock.mockReturnValue({ isPending: false, total: 2 });
    useRecordContextMock.mockReturnValue({ id: "@alice:example.com", displayname: "Alice", deactivated: false });
  });

  it("renders the list actions, bulk actions, and import button", () => {
    render(<UserList />);

    expect(screen.getByText("create-button")).toBeTruthy();
    expect(screen.getAllByRole("button")[0].textContent).toBe("false:10000");
    expect(screen.getByText("server-notice-bulk")).toBeTruthy();
    expect(screen.getByTestId("bulk-delete").textContent).toBe("resources.users.action.erase");
    expect(screen.getByText("CSV Import")).toBeTruthy();
    expect(screen.getAllByTestId("data-table")[0].getAttribute("data-row-click")).toBe("edit");
  });

  it("disables export when the list is empty or pending", () => {
    useListContextMock.mockReturnValue({ isPending: true, total: 0 });

    render(<UserList />);

    expect(screen.getAllByRole("button")[0].textContent).toBe("true:10000");
  });

  it("renders the create form inputs and SSO fields", () => {
    render(<UserCreate />);

    expect(screen.getByText("id")).toBeTruthy();
    expect(screen.getByText("displayname")).toBeTruthy();
    expect(screen.getByText("password")).toBeTruthy();
    expect(selectInputMock).toHaveBeenCalledWith(expect.objectContaining({ source: "user_type" }), undefined);
    expect(screen.getByText("auth_provider")).toBeTruthy();
    expect(screen.getByText("external_id")).toBeTruthy();
  });

  it("renders edit actions and detail tabs for active users", () => {
    render(<UserEdit />);

    expect(screen.getByText("server-notice")).toBeTruthy();
    expect(screen.getAllByTestId("delete-button")[0].textContent).toBe("resources.users.action.erase");
    expect(screen.getByText('resources.users.name "Alice"')).toBeTruthy();
    expect(screen.getByText("device-remove-button")).toBeTruthy();
    expect(screen.getAllByTestId("data-table-col").some(node => node.textContent === "media_id")).toBe(true);
    expect(screen.getByText("quarantine-media-button")).toBeTruthy();
    expect(screen.getByText("protect-media-button")).toBeTruthy();
    expect(
      screen
        .getAllByTestId("data-table")
        .some(node => node.getAttribute("data-row-click") === "/rooms/@alice:example.com/show")
    ).toBe(true);
  });

  it("hides the server notice action for deactivated users", () => {
    useRecordContextMock.mockReturnValue({ id: "@alice:example.com", displayname: "Alice", deactivated: true });

    render(<UserEdit />);

    expect(screen.queryByText("server-notice")).toBeNull();
  });

  it("prefers the display name for record representation", () => {
    expect(users.recordRepresentation?.({ id: "@alice:example.com", displayname: "Alice" } as never)).toBe("Alice");
  });

  it("falls back to the record ID when no display name is set", () => {
    expect(users.recordRepresentation?.({ id: "@alice:example.com" } as never)).toBe("@alice:example.com");
  });
});
