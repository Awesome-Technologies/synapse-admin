import { render, screen } from "@testing-library/react";

const { deleteWithConfirmButtonMock, useRecordContextMock } = vi.hoisted(() => ({
  deleteWithConfirmButtonMock: vi.fn(({ translateOptions }: { translateOptions: { id: string; name: string } }) => (
    <div data-testid="delete-button">{JSON.stringify(translateOptions)}</div>
  )),
  useRecordContextMock: vi.fn(),
}));

vi.mock("react-admin", () => ({
  DeleteWithConfirmButton: deleteWithConfirmButtonMock,
  useRecordContext: useRecordContextMock,
}));

import { DeviceRemoveButton } from "./devices";

describe("DeviceRemoveButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing without a record", () => {
    useRecordContextMock.mockReturnValue(undefined);

    const { container } = render(<DeviceRemoveButton />);

    expect(container.innerHTML).toBe("");
    expect(deleteWithConfirmButtonMock).not.toHaveBeenCalled();
  });

  it("passes translated confirm props with the display name fallback", () => {
    useRecordContextMock.mockReturnValue({
      id: "device-1",
      display_name: "Alice phone",
    });

    render(<DeviceRemoveButton />);

    expect(deleteWithConfirmButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "ra.action.remove",
        confirmTitle: "resources.devices.action.erase.title",
        confirmContent: "resources.devices.action.erase.content",
        mutationMode: "pessimistic",
        redirect: false,
        translateOptions: {
          id: "device-1",
          name: "Alice phone",
        },
      }),
      undefined
    );
    expect(screen.getByTestId("delete-button").textContent).toContain('"name":"Alice phone"');
  });

  it("falls back to the device id when no display name is set", () => {
    useRecordContextMock.mockReturnValue({
      id: "device-2",
    });

    render(<DeviceRemoveButton />);

    expect(screen.getByTestId("delete-button").textContent).toContain('"name":"device-2"');
  });
});
