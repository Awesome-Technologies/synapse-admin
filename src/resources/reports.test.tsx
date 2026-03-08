import { render, screen } from "@testing-library/react";

const {
  mockedDataTableCol,
  mockedDataTableNumberCol,
  mockedDeleteButton,
  mockedTab,
  mockedTabbedShowLayout,
  mockedTextField,
  mockedDateField,
  mockedNumberField,
  mockedReferenceField,
  mockedPagination,
  mockedList,
  mockedShow,
  mockedTopToolbar,
  mockedUseRecordContext,
  mockedUseTranslate,
} = vi.hoisted(() => ({
  mockedDataTableCol: vi.fn(({ source }: { source: string }) => <span data-testid="data-table-col">{source}</span>),
  mockedDataTableNumberCol: vi.fn(({ source }: { source: string }) => (
    <span data-testid="data-table-number-col">{source}</span>
  )),
  mockedDeleteButton: vi.fn(() => <button type="button">delete</button>),
  mockedTab: vi.fn(({ children, label, path }: { children: React.ReactNode; label: string; path?: string }) => (
    <section data-path={path ?? "default"}>
      <h2>{label}</h2>
      {children}
    </section>
  )),
  mockedTabbedShowLayout: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>),
  mockedTextField: vi.fn(({ source, label }: { source: string; label?: string }) => (
    <span data-testid="text-field">{label ? `${source}:${label}` : source}</span>
  )),
  mockedDateField: vi.fn(({ source }: { source: string }) => <span data-testid="date-field">{source}</span>),
  mockedNumberField: vi.fn(({ source }: { source: string }) => <span data-testid="number-field">{source}</span>),
  mockedReferenceField: vi.fn(({ children, source }: { children: React.ReactNode; source: string }) => (
    <div data-testid="reference-field">{source}{children}</div>
  )),
  mockedPagination: vi.fn(() => <div data-testid="pagination" />),
  mockedList: vi.fn(({ children, pagination }: { children: React.ReactNode; pagination?: React.ReactNode }) => (
    <div data-testid="list">
      {pagination}
      {children}
    </div>
  )),
  mockedShow: vi.fn(({ children, actions }: { children: React.ReactNode; actions: React.ReactNode }) => (
    <div data-testid="show">
      {actions}
      {children}
    </div>
  )),
  mockedTopToolbar: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="toolbar">{children}</div>),
  mockedUseRecordContext: vi.fn(),
  mockedUseTranslate: vi.fn(),
}));

vi.mock("../components/media", () => ({
  MXCField: ({ source }: { source: string }) => <span data-testid="mxc-field">{source}</span>,
}));

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();

  const mockedDataTable = Object.assign(
    ({ children }: { children: React.ReactNode }) => <div data-testid="data-table">{children}</div>,
    {
      Col: mockedDataTableCol,
      NumberCol: mockedDataTableNumberCol,
    }
  );

  return {
    ...actual,
    DataTable: mockedDataTable,
    DateField: mockedDateField,
    DeleteButton: mockedDeleteButton,
    List: mockedList,
    NumberField: mockedNumberField,
    Pagination: mockedPagination,
    ReferenceField: mockedReferenceField,
    Show: mockedShow,
    Tab: mockedTab,
    TabbedShowLayout: mockedTabbedShowLayout,
    TextField: mockedTextField,
    TopToolbar: mockedTopToolbar,
    useRecordContext: mockedUseRecordContext,
    useTranslate: mockedUseTranslate,
  };
});

import reportsResource, { ReportList, ReportShow } from "./reports";

describe("reports resource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseRecordContext.mockReturnValue({ id: "1" });
    mockedUseTranslate.mockReturnValue((key: string) => key);
  });

  it("uses DataTable columns for the report overview", () => {
    render(<ReportList />);

    expect(screen.getByTestId("list")).toBeTruthy();
    expect(screen.getByTestId("data-table")).toBeTruthy();
    expect(mockedPagination).toHaveBeenCalledTimes(1);
    expect(mockedDataTableCol).toHaveBeenCalledWith(expect.objectContaining({ source: "id" }), undefined);
    expect(mockedDataTableCol).toHaveBeenCalledWith(expect.objectContaining({ source: "received_ts" }), undefined);
    expect(mockedDataTableCol).toHaveBeenCalledWith(expect.objectContaining({ source: "user_id" }), undefined);
    expect(mockedDataTableCol).toHaveBeenCalledWith(expect.objectContaining({ source: "name" }), undefined);
    expect(mockedDataTableNumberCol).toHaveBeenCalledWith(expect.objectContaining({ source: "score" }), undefined);
  });

  it("renders the report detail tabs and delete action", () => {
    render(<ReportShow />);

    expect(screen.getByTestId("show")).toBeTruthy();
    expect(screen.getByTestId("toolbar")).toBeTruthy();
    expect(mockedDeleteButton).toHaveBeenCalledWith(
      expect.objectContaining({
        record: { id: "1" },
        mutationMode: "pessimistic",
        confirmTitle: "resources.reports.action.erase.title",
        confirmContent: "resources.reports.action.erase.content",
      }),
      undefined
    );
    expect(mockedTab).toHaveBeenCalledTimes(2);
    expect(screen.getByText("synapseadmin.reports.tabs.basic")).toBeTruthy();
    expect(screen.getByText("synapseadmin.reports.tabs.detail")).toBeTruthy();
    expect(mockedReferenceField).toHaveBeenCalledWith(expect.objectContaining({ source: "user_id" }), undefined);
    expect(mockedReferenceField).toHaveBeenCalledWith(expect.objectContaining({ source: "room_id" }), undefined);
    expect(mockedReferenceField).toHaveBeenCalledWith(expect.objectContaining({ source: "sender" }), undefined);
    expect(screen.getByTestId("mxc-field").textContent).toBe("event_json.content.url");
  });

  it("uses the room id as record representation when present", () => {
    expect(reportsResource.recordRepresentation({ id: "1", room_id: "!room:example.com" })).toBe("!room:example.com");
    expect(reportsResource.recordRepresentation({ id: "1" })).toBe("1");
  });
});
