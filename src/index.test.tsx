const { createRootMock, renderMock } = vi.hoisted(() => ({
  createRootMock: vi.fn(),
  renderMock: vi.fn(),
}));

vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
}));

vi.mock("./bootstrap", () => ({
  Bootstrap: () => <div data-testid="bootstrap">bootstrap</div>,
}));

describe("index", () => {
  beforeEach(() => {
    vi.resetModules();
    createRootMock.mockReset();
    renderMock.mockReset();
    createRootMock.mockReturnValue({ render: renderMock });
    document.body.innerHTML = "";
  });

  it("mounts Bootstrap into the root element", async () => {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    await import("./index");

    expect(createRootMock).toHaveBeenCalledWith(root);
    expect(renderMock).toHaveBeenCalledTimes(1);
  });

  it("throws when the root element is missing", async () => {
    await expect(import("./index")).rejects.toThrow("Root element #root not found");
  });
});
