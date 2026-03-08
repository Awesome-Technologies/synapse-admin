import { render, screen } from "@testing-library/react";

const { dataTableColMock, saveButtonMock } = vi.hoisted(() => ({
  dataTableColMock: vi.fn(({ source }: { source: string }) => <span data-testid="data-table-col">{source}</span>),
  saveButtonMock: vi.fn(() => <button type="button">save-button</button>),
}));

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();

  const mockedDataTable = Object.assign(
    ({ children }: { children: React.ReactNode }) => <div data-testid="data-table">{children}</div>,
    {
      Col: dataTableColMock,
    }
  );

  return {
    ...actual,
    BooleanInput: ({ source }: { source: string }) => <span>{source}</span>,
    Create: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DataTable: mockedDataTable,
    DateField: ({ source }: { source: string }) => <span>{source}</span>,
    DateTimeInput: ({ source }: { source: string }) => <span>{source}</span>,
    Edit: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    List: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    NumberInput: ({ source, helperText }: { source: string; helperText?: string }) => (
      <span>
        {source}:{helperText ?? ""}
      </span>
    ),
    SaveButton: saveButtonMock,
    SimpleForm: ({ children, toolbar }: { children: React.ReactNode; toolbar?: React.ReactNode }) => (
      <div>
        {toolbar}
        {children}
      </div>
    ),
    TextInput: ({ source }: { source: string }) => <span>{source}</span>,
    Toolbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    maxValue: () => "maxValue",
    number: () => "number",
    regex: () => "regex",
  };
});

import resource, {
  RegistrationTokenCreate,
  RegistrationTokenEdit,
  RegistrationTokenList,
} from "./registration_tokens";

describe("registration_tokens resource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the list with the expected token columns", () => {
    render(<RegistrationTokenList />);

    expect(screen.getByTestId("data-table")).toBeTruthy();
    expect(dataTableColMock).toHaveBeenCalledWith(expect.objectContaining({ source: "token" }), undefined);
    expect(dataTableColMock).toHaveBeenCalledWith(expect.objectContaining({ source: "uses_allowed" }), undefined);
    expect(dataTableColMock).toHaveBeenCalledWith(expect.objectContaining({ source: "expiry_time" }), undefined);
  });

  it("renders the create form with an always-enabled save button", () => {
    render(<RegistrationTokenCreate />);

    expect(screen.getByText("token")).toBeTruthy();
    expect(screen.getByText("length:resources.registration_tokens.helper.length")).toBeTruthy();
    expect(saveButtonMock).toHaveBeenCalledWith(expect.objectContaining({ alwaysEnable: true }), undefined);
  });

  it("renders the edit form with disabled immutable fields", () => {
    render(<RegistrationTokenEdit />);

    expect(screen.getByText("token")).toBeTruthy();
    expect(screen.getByText("pending:")).toBeTruthy();
    expect(screen.getByText("completed:")).toBeTruthy();
    expect(screen.getByText("expiry_time")).toBeTruthy();
  });

  it("uses the token string as record representation", () => {
    expect(resource.recordRepresentation?.({ token: "reg-token" } as never)).toBe("reg-token");
  });
});
