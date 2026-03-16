import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const {
  buttonMock,
  dataTableColMock,
  dateFieldMock,
  deleteMock,
  listMock,
  notifyMock,
  refreshMock,
  referenceFieldMock,
  referenceManyFieldMock,
  showMock,
  useCreatePathMock,
  useRecordContextMock,
  useThemeMock,
} = vi.hoisted(() => ({
  buttonMock: vi.fn(({ label, onClick, disabled, children }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {label}
      {children}
    </button>
  )),
  dataTableColMock: vi.fn(({ source, label }: any) => <span data-testid="data-table-col">{source}:{String(label ?? "")}</span>),
  dateFieldMock: vi.fn((props: any) => <span data-testid="date-field">{JSON.stringify(props.record ?? { source: props.source })}</span>),
  deleteMock: vi.fn(),
  listMock: vi.fn(({ children }: any) => <div>{children}</div>),
  notifyMock: vi.fn(),
  refreshMock: vi.fn(),
  referenceFieldMock: vi.fn(({ children }: any) => <div>{children}</div>),
  referenceManyFieldMock: vi.fn(({ children }: any) => <div>{children}</div>),
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

vi.mock("@mui/material", async importOriginal => {
  const actual = await importOriginal<typeof import("@mui/material")>();
  return {
    ...actual,
    lighten: vi.fn((_color: string, _amount: number) => "lightened"),
    useTheme: () => useThemeMock(),
  };
});

vi.mock("@mui/material/colors", async importOriginal => {
  const actual = await importOriginal<typeof import("@mui/material/colors")>();
  return {
    ...actual,
    blue: { 700: "#00f" },
  };
});

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();
  const mockedDataTable = Object.assign(
    ({ children, rowSx, rowClick }: any) => (
      <div
        data-testid="data-table"
        data-row-click={typeof rowClick === "function" ? rowClick("!room:example.com") : rowClick}
        data-row-sx={JSON.stringify(rowSx?.({ retry_last_ts: 2 }))}
      >
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
    Button: buttonMock,
    DataTable: mockedDataTable,
    DateField: dateFieldMock,
    List: listMock,
    Pagination: () => <span>pagination</span>,
    ReferenceField: referenceFieldMock,
    ReferenceManyField: referenceManyFieldMock,
    SearchInput: ({ source }: any) => <span>{source}</span>,
    Show: showMock,
    Tab: ({ children }: any) => <div>{children}</div>,
    TabbedShowLayout: ({ children }: any) => <div>{children}</div>,
    TextField: ({ source }: any) => <span>{source}</span>,
    TopToolbar: ({ children }: any) => <div>{children}</div>,
    useCreatePath: () => useCreatePathMock,
    useDelete: () => [deleteMock, { isPending: false }],
    useNotify: () => notifyMock,
    useRecordContext: useRecordContextMock,
    useRefresh: () => refreshMock,
    useTranslate: () => (key: string) => key,
  };
});

import resource, {
  DestinationList,
  DestinationReconnectButton,
  DestinationShow,
} from "./destinations";

describe("destinations resource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useThemeMock.mockReturnValue({
      palette: {
        error: { light: "#f99", dark: "#900" },
        mode: "dark",
      },
    });
    useRecordContextMock.mockReturnValue({
      id: "matrix.example.com",
      destination: "matrix.example.com",
      failure_ts: 123,
      retry_last_ts: 2,
    });
  });

  it("renders nothing for reconnect when no failing destination is selected", () => {
    useRecordContextMock.mockReturnValue({ id: "matrix.example.com", failure_ts: 0 });

    const { container } = render(<DestinationReconnectButton />);

    expect(container.innerHTML).toBe("");
  });

  it("reconnects a failing destination and stops row navigation", async () => {
    deleteMock.mockImplementation((_resource, _params, options) => options.onSuccess());

    render(<DestinationReconnectButton />);
    const event = { stopPropagation: vi.fn() };
    fireEvent.click(screen.getByRole("button"), event);

    expect(deleteMock).toHaveBeenCalledWith(
      "destinations",
      { id: "matrix.example.com" },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith("ra.notification.updated", { messageArgs: { smart_count: 1 } })
    );
    expect(refreshMock).toHaveBeenCalled();
  });

  it("reports reconnect failures", async () => {
    deleteMock.mockImplementation((_resource, _params, options) => options.onError());

    render(<DestinationReconnectButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith("ra.message.error", { type: "error" }));
  });

  it("renders list styling and reconnect column", () => {
    render(<DestinationList />);

    expect(screen.getByTestId("data-table").getAttribute("data-row-click")).toBe("show");
    expect(screen.getByTestId("data-table").getAttribute("data-row-sx")).toContain("lightened");
    expect(dataTableColMock).toHaveBeenCalledWith(expect.objectContaining({ source: "destination" }));
  });

  it("renders the destination show page and room links", () => {
    render(<DestinationShow />);

    expect(showMock).toHaveBeenCalled();
    expect(screen.getByText("resources.destinations.name matrix.example.com")).toBeTruthy();
    expect(referenceManyFieldMock).toHaveBeenCalledWith(
      expect.objectContaining({ reference: "destination_rooms", target: "destination", perPage: 50 }),
      undefined
    );
    expect(resource.recordRepresentation?.({ destination: "matrix.example.com" } as never)).toBe("matrix.example.com");
  });

  it("renders retry date values as null when Synapse returns zero", () => {
    useRecordContextMock.mockReturnValue({ retry_last_ts: 0 });

    render(<DestinationList />);

    const zeroCall = dateFieldMock.mock.calls.find(([props]) => props.record?.retry_last_ts === null);
    expect(zeroCall).toBeTruthy();
  });
});
