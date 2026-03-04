import { ThemeProvider, createTheme } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { ViewMediaButton } from "./media";

const mockFetchWithAuth = vi.fn();
const mockGetMediaUrl = vi.fn((id: string) => `https://hs.example.com/_matrix/media/v1/download/${id}?allow_redirect=true`);
vi.mock("../synapse/synapse", () => ({
  getMediaUrl: (id: string) => mockGetMediaUrl(id),
  fetchWithAuth: (url: string) => mockFetchWithAuth(url),
}));

vi.mock("react-admin", async () => {
  const actual = await vi.importActual("react-admin");
  return {
    ...actual,
    useTranslate: () => (key: string) => key,
    useNotify: () => vi.fn(),
  };
});

const theme = createTheme();

describe("ViewMediaButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["content"], { type: "application/octet-stream" })),
    });
    Object.defineProperty(window, "open", { value: vi.fn(), writable: true });
  });

  it("calls fetchWithAuth on click (no token in URL)", async () => {
    render(
      <ThemeProvider theme={theme}>
        <ViewMediaButton media_id="example.com/abc123" label="media" />
      </ThemeProvider>
    );
    const button = screen.getByRole("button");
    await userEvent.click(button);
    expect(mockGetMediaUrl).toHaveBeenCalledWith("example.com/abc123");
    const url = mockGetMediaUrl("example.com/abc123");
    expect(url).not.toContain("access_token");
    await vi.waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledWith(url);
    });
  });
});
