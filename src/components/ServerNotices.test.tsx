import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const {
  buttonMock,
  createMock,
  dataProviderMock,
  notifyMock,
  simpleFormMock,
  unselectAllMock,
  useDataProviderMock,
  useListContextMock,
  useRecordContextMock,
  useUnselectAllMock,
} = vi.hoisted(() => ({
  buttonMock: vi.fn(({ label, onClick, disabled, children }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {label}
      {children}
    </button>
  )),
  createMock: vi.fn(),
  dataProviderMock: {
    createMany: vi.fn(),
  },
  notifyMock: vi.fn(),
  simpleFormMock: vi.fn(({ onSubmit, children }: any) => (
    <form
      onSubmit={event => {
        event.preventDefault();
        onSubmit({ body: "Hello world" });
      }}
    >
      {children}
      <button type="submit">submit-form</button>
    </form>
  )),
  unselectAllMock: vi.fn(),
  useDataProviderMock: vi.fn(),
  useListContextMock: vi.fn(),
  useRecordContextMock: vi.fn(),
  useUnselectAllMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: ({ mutationFn, onSuccess, onError }: any) => ({
    isPending: false,
    mutate: async (data: unknown) => {
      try {
        await mutationFn(data);
        onSuccess?.();
      } catch (error) {
        onError?.(error);
      }
    },
  }),
}));

vi.mock("@mui/material", () => ({
  Dialog: ({ open, children }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogContentText: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("react-admin", () => ({
  Button: buttonMock,
  RaRecord: {},
  SaveButton: ({ label, disabled }: any) => (
    <button type="button" disabled={disabled}>
      {label}
    </button>
  ),
  SimpleForm: simpleFormMock,
  TextInput: ({ label }: any) => <div>{label}</div>,
  Toolbar: ({ children }: any) => <div>{children}</div>,
  required: () => "required",
  useCreate: () => [createMock, { isLoading: false }],
  useDataProvider: useDataProviderMock,
  useListContext: useListContextMock,
  useNotify: () => notifyMock,
  useRecordContext: useRecordContextMock,
  useTranslate: () => (key: string) => key,
  useUnselectAll: useUnselectAllMock,
}));

import { ServerNoticeBulkButton, ServerNoticeButton } from "./ServerNotices";

describe("ServerNoticeButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRecordContextMock.mockReturnValue({ id: "@alice:example.com" });
    useListContextMock.mockReturnValue({ selectedIds: ["@alice:example.com", "@bob:example.com"] });
    useDataProviderMock.mockReturnValue(dataProviderMock);
    useUnselectAllMock.mockReturnValue(unselectAllMock);
  });

  it("renders nothing without a selected record", () => {
    useRecordContextMock.mockReturnValue(undefined);

    const { container } = render(<ServerNoticeButton />);

    expect(container.innerHTML).toBe("");
  });

  it("sends a server notice for the current record", async () => {
    createMock.mockImplementation((_resource, _params, options) => {
      options.onSuccess();
    });

    render(<ServerNoticeButton />);

    fireEvent.click(screen.getByRole("button", { name: "resources.servernotices.send" }));
    fireEvent.click(screen.getByRole("button", { name: "submit-form" }));

    expect(createMock).toHaveBeenCalledWith(
      "servernotices",
      { data: { id: "@alice:example.com", body: "Hello world" } },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith("resources.servernotices.action.send_success"));
  });

  it("notifies on create failure", async () => {
    createMock.mockImplementation((_resource, _params, options) => {
      options.onError();
    });

    render(<ServerNoticeButton />);

    fireEvent.click(screen.getByRole("button", { name: "resources.servernotices.send" }));
    fireEvent.click(screen.getByRole("button", { name: "submit-form" }));

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith("resources.servernotices.action.send_failure", { type: "error" })
    );
  });
});

describe("ServerNoticeBulkButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRecordContextMock.mockReturnValue({ id: "@alice:example.com" });
    useListContextMock.mockReturnValue({ selectedIds: ["@alice:example.com", "@bob:example.com"] });
    useDataProviderMock.mockReturnValue(dataProviderMock);
    useUnselectAllMock.mockReturnValue(unselectAllMock);
  });

  it("sends notices for all selected users", async () => {
    dataProviderMock.createMany.mockResolvedValue({ data: [] });

    render(<ServerNoticeBulkButton />);

    fireEvent.click(screen.getByRole("button", { name: "resources.servernotices.send" }));
    fireEvent.click(screen.getByRole("button", { name: "submit-form" }));

    await waitFor(() =>
      expect(dataProviderMock.createMany).toHaveBeenCalledWith("servernotices", {
        ids: ["@alice:example.com", "@bob:example.com"],
        data: { body: "Hello world" },
      })
    );
    expect(notifyMock).toHaveBeenCalledWith("resources.servernotices.action.send_success");
    expect(unselectAllMock).toHaveBeenCalled();
  });

  it("notifies on bulk send failure", async () => {
    dataProviderMock.createMany.mockRejectedValue(new Error("boom"));

    render(<ServerNoticeBulkButton />);

    fireEvent.click(screen.getByRole("button", { name: "resources.servernotices.send" }));
    fireEvent.click(screen.getByRole("button", { name: "submit-form" }));

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith("resources.servernotices.action.send_failure", { type: "error" })
    );
  });
});
