import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const {
  bulkDeleteButtonMock,
  buttonMock,
  createMock,
  dataProviderMock,
  deleteButtonMock,
  exportButtonMock,
  selectColumnsButtonMock,
  useCreatePathMock,
  useListContextMock,
  useRecordContextMock,
  useUnselectAllMock,
  notifyMock,
  refreshMock,
  unselectAllMock,
  dataTableColMock,
} = vi.hoisted(() => ({
  bulkDeleteButtonMock: vi.fn((props: any) => (
    <div data-testid="bulk-delete">
      {props.label}:{props.resource}:{props.confirmTitle}
    </div>
  )),
  buttonMock: vi.fn(({ label, onClick, disabled, children }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {label}
      {children}
    </button>
  )),
  createMock: vi.fn(),
  dataProviderMock: { createMany: vi.fn() },
  deleteButtonMock: vi.fn((props: any) => (
    <div data-testid="delete-button">
      {props.label}:{props.resource}:{props.confirmTitle}
    </div>
  )),
  exportButtonMock: vi.fn(() => <span>export-button</span>),
  selectColumnsButtonMock: vi.fn(() => <span>select-columns-button</span>),
  useCreatePathMock: vi.fn(({ resource, id, type }: any) => `/${resource}/${id}/${type}`),
  useListContextMock: vi.fn(),
  useRecordContextMock: vi.fn(),
  useUnselectAllMock: vi.fn(),
  notifyMock: vi.fn(),
  refreshMock: vi.fn(),
  unselectAllMock: vi.fn(),
  dataTableColMock: vi.fn(({ source, label }: any) => <span data-testid="data-table-col">{source}:{String(label ?? "")}</span>),
}));

vi.mock("../components/AvatarField", () => ({
  __esModule: true,
  default: () => <span>avatar-field</span>,
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: ({ mutationFn, onSuccess, onError }: any) => ({
    isPending: false,
    mutate: async () => {
      try {
        await mutationFn();
        onSuccess?.();
      } catch (error) {
        onError?.(error);
      }
    },
  }),
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
    BooleanField: () => <span>boolean-field</span>,
    BulkDeleteButton: bulkDeleteButtonMock,
    Button: buttonMock,
    DataTable: mockedDataTable,
    DeleteButton: deleteButtonMock,
    ExportButton: exportButtonMock,
    List: ({ children, actions }: any) => (
      <div>
        {actions}
        {children}
      </div>
    ),
    NumberField: () => <span>number-field</span>,
    Pagination: () => <span>pagination</span>,
    SelectColumnsButton: selectColumnsButtonMock,
    TextField: () => <span>text-field</span>,
    TopToolbar: ({ children }: any) => <div>{children}</div>,
    useCreate: () => [createMock, { isPending: false }],
    useCreatePath: () => useCreatePathMock,
    useDataProvider: () => dataProviderMock,
    useListContext: useListContextMock,
    useNotify: () => notifyMock,
    useRecordContext: useRecordContextMock,
    useRefresh: () => refreshMock,
    useTranslate: () => (key: string) => key,
    useUnselectAll: useUnselectAllMock,
  };
});

import resource, {
  RoomDirectoryBulkPublishButton,
  RoomDirectoryBulkUnpublishButton,
  RoomDirectoryList,
  RoomDirectoryPublishButton,
  RoomDirectoryUnpublishButton,
} from "./room_directory";

describe("room_directory resource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useListContextMock.mockReturnValue({ selectedIds: ["!room:example.com"] });
    useRecordContextMock.mockReturnValue({ id: "!room:example.com", name: "Lobby" });
    useUnselectAllMock.mockReturnValue(unselectAllMock);
  });

  it("renders the unpublish buttons with translated delete props", () => {
    render(
      <>
        <RoomDirectoryUnpublishButton />
        <RoomDirectoryBulkUnpublishButton />
      </>
    );

    expect(deleteButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "resources.room_directory.action.erase",
        resource: "room_directory",
        redirect: false,
        mutationMode: "pessimistic",
      }),
      undefined
    );
    expect(bulkDeleteButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "resources.room_directory.action.erase",
        resource: "room_directory",
        mutationMode: "pessimistic",
      }),
      undefined
    );
  });

  it("publishes selected rooms in bulk", async () => {
    dataProviderMock.createMany.mockResolvedValue({ data: [] });

    render(<RoomDirectoryBulkPublishButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(dataProviderMock.createMany).toHaveBeenCalledWith("room_directory", {
        ids: ["!room:example.com"],
        data: {},
      })
    );
    expect(notifyMock).toHaveBeenCalledWith("resources.room_directory.action.send_success");
    expect(unselectAllMock).toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });

  it("reports bulk publish failures", async () => {
    dataProviderMock.createMany.mockRejectedValue(new Error("boom"));

    render(<RoomDirectoryBulkPublishButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith("resources.room_directory.action.send_failure", { type: "error" })
    );
  });

  it("publishes the current room or renders nothing without a record", async () => {
    createMock.mockImplementation((_resource, _params, options) => options.onSuccess());

    const publish = render(<RoomDirectoryPublishButton />);
    fireEvent.click(publish.getByRole("button"));

    expect(createMock).toHaveBeenCalledWith(
      "room_directory",
      { data: { id: "!room:example.com" } },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
    expect(notifyMock).toHaveBeenCalledWith("resources.room_directory.action.send_success");

    useRecordContextMock.mockReturnValue(undefined);
    const empty = render(<RoomDirectoryPublishButton />);
    expect(empty.container.innerHTML).toBe("");
  });

  it("renders the directory list and room navigation", () => {
    render(<RoomDirectoryList />);

    expect(screen.getByText("select-columns-button")).toBeTruthy();
    expect(screen.getByText("export-button")).toBeTruthy();
    expect(screen.getByTestId("data-table").getAttribute("data-row-click")).toBe("/rooms/!room:example.com/show");
    expect(screen.getByTestId("data-table").getAttribute("data-hidden-columns")).toBe(
      JSON.stringify(["room_id", "canonical_alias", "topic"])
    );
    expect(resource.recordRepresentation?.({ name: "Lobby", room_id: "!room:example.com" } as never)).toBe("Lobby");
    expect(resource.recordRepresentation?.({ room_id: "!room:example.com" } as never)).toBe("!room:example.com");
  });
});
