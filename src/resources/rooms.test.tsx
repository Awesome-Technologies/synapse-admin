import { render, screen } from "@testing-library/react";

const {
  bulkDeleteButtonMock,
  dataTableColMock,
  deleteButtonMock,
  exportButtonMock,
  functionFieldMock,
  referenceFieldMock,
  referenceManyFieldMock,
  roomDirectoryBulkPublishButtonMock,
  roomDirectoryBulkUnpublishButtonMock,
  roomDirectoryPublishButtonMock,
  roomDirectoryUnpublishButtonMock,
  selectColumnsButtonMock,
  showMock,
  useCreatePathMock,
  useRecordContextMock,
  useThemeMock,
} = vi.hoisted(() => ({
  bulkDeleteButtonMock: vi.fn((props: any) => <div data-testid="bulk-delete">{props.confirmTitle}</div>),
  dataTableColMock: vi.fn((props: any) => <span data-testid="data-table-col">{props.source ?? props.label}</span>),
  deleteButtonMock: vi.fn((props: any) => <div data-testid="delete-button">{props.confirmTitle}</div>),
  exportButtonMock: vi.fn(() => <span>export-button</span>),
  functionFieldMock: vi.fn(({ render }: any) => <span data-testid="function-field">{render({ canonical_alias: "#room:example.com" })}</span>),
  referenceFieldMock: vi.fn(({ children }: any) => <div>{children}</div>),
  referenceManyFieldMock: vi.fn(({ children }: any) => <div>{children}</div>),
  roomDirectoryBulkPublishButtonMock: vi.fn(() => <span>bulk-publish</span>),
  roomDirectoryBulkUnpublishButtonMock: vi.fn(() => <span>bulk-unpublish</span>),
  roomDirectoryPublishButtonMock: vi.fn(() => <span>publish-room</span>),
  roomDirectoryUnpublishButtonMock: vi.fn(() => <span>unpublish-room</span>),
  selectColumnsButtonMock: vi.fn(() => <span>select-columns-button</span>),
  showMock: vi.fn(({ children, actions, title }: any) => (
    <div>
      {actions}
      {title}
      {children}
    </div>
  )),
  useCreatePathMock: vi.fn(({ resource, id, type }: any) => `/${resource}/${id}/${type}`),
  useRecordContextMock: vi.fn(),
  useThemeMock: vi.fn(),
}));

vi.mock("./room_directory", () => ({
  RoomDirectoryBulkPublishButton: roomDirectoryBulkPublishButtonMock,
  RoomDirectoryBulkUnpublishButton: roomDirectoryBulkUnpublishButtonMock,
  RoomDirectoryPublishButton: roomDirectoryPublishButtonMock,
  RoomDirectoryUnpublishButton: roomDirectoryUnpublishButtonMock,
}));

vi.mock("@mui/material/styles", () => ({
  useTheme: () => useThemeMock(),
}));

vi.mock("@mui/material/Box", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();
  const mockedDataTable = Object.assign(
    ({ children, rowClick, bulkActionButtons, hiddenColumns }: any) => (
      <div
        data-testid="data-table"
        data-row-click={typeof rowClick === "function" ? rowClick("!room:example.com") : rowClick}
        data-hidden-columns={JSON.stringify(hiddenColumns)}
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
    BooleanField: ({ source, sx }: any) => <span data-testid={`boolean-${source}`}>{JSON.stringify(sx ?? {})}</span>,
    BulkDeleteButton: bulkDeleteButtonMock,
    DataTable: mockedDataTable,
    DateField: ({ source }: any) => <span>{source}</span>,
    DeleteButton: deleteButtonMock,
    ExportButton: exportButtonMock,
    FunctionField: functionFieldMock,
    List: ({ children, actions }: any) => (
      <div>
        {actions}
        {children}
      </div>
    ),
    Pagination: () => <span>pagination</span>,
    ReferenceField: referenceFieldMock,
    ReferenceManyField: referenceManyFieldMock,
    SearchInput: ({ source }: any) => <span>{source}</span>,
    SelectColumnsButton: selectColumnsButtonMock,
    SelectField: ({ source }: any) => <span>{source}</span>,
    Show: showMock,
    Tab: ({ children }: any) => <div>{children}</div>,
    TabbedShowLayout: ({ children }: any) => <div>{children}</div>,
    TextField: ({ source, emptyText }: any) => <span>{source ?? emptyText}</span>,
    TopToolbar: ({ children }: any) => <div>{children}</div>,
    useCreatePath: () => useCreatePathMock,
    useRecordContext: useRecordContextMock,
    useTranslate: () => (key: string) => key,
  };
});

import resource, { RoomList, RoomShow } from "./rooms";

describe("rooms resource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useThemeMock.mockReturnValue({
      palette: {
        success: { main: "green" },
        error: { main: "red" },
      },
    });
    useRecordContextMock.mockReturnValue({
      id: "!room:example.com",
      name: "Lobby",
      public: true,
    });
  });

  it("renders the room list actions, bulk actions, and encryption column", () => {
    render(<RoomList />);

    expect(screen.getByText("select-columns-button")).toBeTruthy();
    expect(screen.getByText("export-button")).toBeTruthy();
    expect(screen.getByText("bulk-publish")).toBeTruthy();
    expect(screen.getByText("bulk-unpublish")).toBeTruthy();
    expect(screen.getByTestId("bulk-delete").textContent).toContain("resources.rooms.action.erase.title");
    expect(screen.getByTestId("data-table").getAttribute("data-row-click")).toBe("show");
    expect(screen.getByTestId("data-table").getAttribute("data-hidden-columns")).toBe(
      JSON.stringify(["joined_local_members", "state_events", "version", "federatable"])
    );
    expect(functionFieldMock).toHaveBeenCalled();
  });

  it("renders the room show page with the unpublish action for public rooms", () => {
    render(<RoomShow />);

    expect(showMock).toHaveBeenCalled();
    expect(screen.getByText("unpublish-room")).toBeTruthy();
    expect(screen.getByTestId("delete-button").textContent).toContain("resources.rooms.action.erase.title");
    expect(screen.getByText("resources.rooms.name Lobby")).toBeTruthy();
    expect(referenceManyFieldMock).toHaveBeenCalledWith(
      expect.objectContaining({ reference: "room_members", target: "room_id" }),
      undefined
    );
  });

  it("renders the publish action for private rooms and room navigation links", () => {
    useRecordContextMock.mockReturnValue({
      id: "!room:example.com",
      canonical_alias: "#room:example.com",
      public: false,
    });

    render(<RoomShow />);

    expect(screen.getByText("publish-room")).toBeTruthy();
    expect(screen.getByText("resources.rooms.name !room:example.com")).toBeTruthy();
    expect(screen.getAllByTestId("data-table")[0].getAttribute("data-row-click")).toBe("/users/!room:example.com/edit");
  });

  it("uses the best available room label for record representation", () => {
    expect(resource.recordRepresentation?.({ name: "Lobby", id: "!room:example.com" } as never)).toBe("Lobby");
    expect(resource.recordRepresentation?.({ canonical_alias: "#room:example.com", id: "!room:example.com" } as never)).toBe(
      "#room:example.com"
    );
    expect(resource.recordRepresentation?.({ id: "!room:example.com" } as never)).toBe("!room:example.com");
  });
});
