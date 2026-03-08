import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import storage from "../storage";

const {
  buttonMock,
  createMock,
  deleteMock,
  notifyMock,
  recordContextMock,
  refreshMock,
  simpleFormMock,
  useDataProviderMock,
} = vi.hoisted(() => ({
  buttonMock: vi.fn(({ label, onClick, disabled, to, children }: any) => (
    <button type="button" onClick={onClick} disabled={disabled} data-to={to}>
      {label}
      {children}
    </button>
  )),
  createMock: vi.fn(),
  deleteMock: vi.fn(),
  notifyMock: vi.fn(),
  recordContextMock: vi.fn(),
  refreshMock: vi.fn(),
  simpleFormMock: vi.fn(({ onSubmit, children }: any) => (
    <form
      onSubmit={event => {
        event.preventDefault();
        onSubmit({ before_ts: 123, size_gt: 4096, keep_profiles: false });
      }}
    >
      {children}
      <button type="submit">submit-form</button>
    </form>
  )),
  useDataProviderMock: vi.fn(),
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
  Box: ({ children }: any) => <div>{children}</div>,
  Dialog: ({ open, children }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogContentText: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@mui/material/styles", () => ({
  alpha: () => "hover",
  useTheme: () => ({
    palette: {
      error: {
        main: "#f00",
      },
    },
  }),
}));

vi.mock("@mui/icons-material/Block", () => ({ default: () => <span>block-icon</span> }));
vi.mock("@mui/icons-material/Cancel", () => ({ default: () => <span>cancel-icon</span> }));
vi.mock("@mui/icons-material/Clear", () => ({ default: () => <span>clear-icon</span> }));
vi.mock("@mui/icons-material/DeleteSweep", () => ({ default: () => <span>delete-sweep-icon</span> }));
vi.mock("@mui/icons-material/FileOpen", () => ({ default: () => <span>file-open-icon</span> }));
vi.mock("@mui/icons-material/Lock", () => ({ default: () => <span>lock-icon</span> }));
vi.mock("@mui/icons-material/LockOpen", () => ({ default: () => <span>lock-open-icon</span> }));

vi.mock("react-router-dom", () => ({
  Link: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("react-admin", () => ({
  BooleanInput: ({ label }: any) => <div>{label}</div>,
  Button: buttonMock,
  DateTimeInput: ({ label }: any) => <div>{label}</div>,
  NumberInput: ({ label }: any) => <div>{label}</div>,
  SaveButton: ({ label }: any) => <button type="button">{label}</button>,
  SimpleForm: simpleFormMock,
  Toolbar: ({ children }: any) => <div>{children}</div>,
  useCreate: () => [createMock, { isLoading: false }],
  useDataProvider: useDataProviderMock,
  useDelete: () => [deleteMock, { isLoading: false }],
  useNotify: () => notifyMock,
  useRecordContext: recordContextMock,
  useRefresh: () => refreshMock,
  useTranslate: () => (key: string) => key,
}));

vi.mock("../synapse/synapse", async importOriginal => {
  const actual = await importOriginal<typeof import("../synapse/synapse")>();

  return {
    ...actual,
    getMediaUrl: vi.fn((mediaId: string) => `https://media.example/${mediaId}`),
  };
});

import {
  DeleteMediaButton,
  MediaIDField,
  MXCField,
  ProtectMediaButton,
  QuarantineMediaButton,
  ViewMediaButton,
} from "./media";

describe("media components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.clear();
    storage.setItem("base_url", "https://matrix.example.com");
    storage.setItem("home_server", "matrix.example.com");
    useDataProviderMock.mockReturnValue({
      deleteMedia: vi.fn().mockResolvedValue({ deleted_media: [], total: 0 }),
    });
  });

  it("submits the bulk delete media action", async () => {
    const deleteMediaMock = vi.fn().mockResolvedValue({ deleted_media: [], total: 0 });
    useDataProviderMock.mockReturnValue({ deleteMedia: deleteMediaMock });

    render(<DeleteMediaButton />);

    fireEvent.click(screen.getByRole("button", { name: "delete_media.action.send delete-sweep-icon" }));
    fireEvent.click(screen.getByRole("button", { name: "submit-form" }));

    await waitFor(() =>
      expect(deleteMediaMock).toHaveBeenCalledWith({
        before_ts: 123,
        size_gt: 4096,
        keep_profiles: false,
      })
    );
    expect(notifyMock).toHaveBeenCalledWith("delete_media.action.send_success");
  });

  it("notifies when bulk media deletion fails", async () => {
    const deleteMediaMock = vi.fn().mockRejectedValue(new Error("boom"));
    useDataProviderMock.mockReturnValue({ deleteMedia: deleteMediaMock });

    render(<DeleteMediaButton />);

    fireEvent.click(screen.getByRole("button", { name: "delete_media.action.send delete-sweep-icon" }));
    fireEvent.click(screen.getByRole("button", { name: "submit-form" }));

    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith("delete_media.action.send_failure", { type: "error" }));
  });

  it("returns nothing for protect and quarantine buttons without a record", () => {
    recordContextMock.mockReturnValue(undefined);

    const protect = render(<ProtectMediaButton />);
    const quarantine = render(<QuarantineMediaButton />);

    expect(protect.container.innerHTML).toBe("");
    expect(quarantine.container.innerHTML).toBe("");
  });

  it("renders disabled protect button for quarantined media", () => {
    recordContextMock.mockReturnValue({ id: "m1", quarantined_by: "@admin:example.com" });

    render(<ProtectMediaButton />);

    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("clear-icon")).toBeTruthy();
  });

  it("protects unprotected media", async () => {
    recordContextMock.mockReturnValue({ id: "m1", safe_from_quarantine: false, quarantined_by: null });
    createMock.mockImplementation((_resource, _params, options) => options.onSuccess());

    render(<ProtectMediaButton />);
    fireEvent.click(screen.getByRole("button"));

    expect(createMock).toHaveBeenCalledWith(
      "protect_media",
      { data: { id: "m1", safe_from_quarantine: false, quarantined_by: null } },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith("resources.protect_media.action.send_success"));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("unprotects protected media and reports failures", async () => {
    recordContextMock.mockReturnValue({ id: "m1", safe_from_quarantine: true });
    deleteMock.mockImplementation((_resource, _params, options) => options.onError());

    render(<ProtectMediaButton />);
    fireEvent.click(screen.getByRole("button"));

    expect(deleteMock).toHaveBeenCalledWith(
      "protect_media",
      { id: "m1" },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith("resources.protect_media.action.send_failure", { type: "error" })
    );
  });

  it("renders disabled quarantine button for protected media", () => {
    recordContextMock.mockReturnValue({ id: "m1", safe_from_quarantine: true });

    render(<QuarantineMediaButton />);

    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("clear-icon")).toBeTruthy();
  });

  it("quarantines and unquarantines media", async () => {
    recordContextMock.mockReturnValue({ id: "m1", safe_from_quarantine: false, quarantined_by: null });
    createMock.mockImplementation((_resource, _params, options) => options.onSuccess());

    const { rerender } = render(<QuarantineMediaButton />);
    fireEvent.click(screen.getByRole("button"));

    expect(createMock).toHaveBeenCalledWith(
      "quarantine_media",
      { data: { id: "m1", safe_from_quarantine: false, quarantined_by: null } },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith("resources.quarantine_media.action.send_success"));

    vi.clearAllMocks();
    recordContextMock.mockReturnValue({ id: "m1", quarantined_by: "@admin:example.com" });
    deleteMock.mockImplementation((_resource, _params, options) => options.onSuccess());

    rerender(<QuarantineMediaButton />);
    fireEvent.click(screen.getByRole("button"));

    expect(deleteMock).toHaveBeenCalledWith(
      "quarantine_media",
      { id: "m1", previousData: { id: "m1", quarantined_by: "@admin:example.com" } },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith("resources.quarantine_media.action.send_success"));
  });

  it("renders media links for direct and derived media ids", () => {
    recordContextMock.mockReturnValue({ media_id: "abc123", event: { content: { url: "mxc://server/xyz" } } });

    const direct = render(<ViewMediaButton media_id="server/id" label="server/id" />);
    const mediaId = render(<MediaIDField source="media_id" />);
    const mxc = render(<MXCField source="event.content.url" />);

    expect(direct.getByText("server/id")).toBeTruthy();
    expect(mediaId.container.querySelector("button")?.getAttribute("data-to")).toBe(
      "https://media.example/matrix.example.com/abc123"
    );
    expect(mxc.container.querySelector("button")?.getAttribute("data-to")).toBe("https://media.example/server/xyz");
  });
});
