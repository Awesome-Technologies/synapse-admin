import { render, screen } from "@testing-library/react";
import { RecordContextProvider } from "react-admin";
import { vi } from "vitest";

import AvatarField from "./AvatarField";

const mockFetchWithAuth = vi.fn();
vi.mock("../synapse/synapse", () => ({
  fetchWithAuth: (url: string) => mockFetchWithAuth(url),
}));

const storageGetItem = vi.fn();
vi.mock("../storage", () => ({
  default: {
    getItem: (key: string) => storageGetItem(key),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("AvatarField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows image from src when no token", () => {
    storageGetItem.mockReturnValue(null);
    const value = { avatar: "https://hs.example.com/thumb.png" };
    render(
      <RecordContextProvider value={value}>
        <AvatarField source="avatar" />
      </RecordContextProvider>
    );
    expect(screen.getByRole("img").getAttribute("src")).toBe("https://hs.example.com/thumb.png");
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
  });

  it("fetches with auth when token present and uses blob URL", async () => {
    storageGetItem.mockImplementation((key: string) => (key === "access_token" ? "token123" : null));
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["fake"], { type: "image/png" })),
    });
    const value = { avatar_src: "https://hs.example.com/_matrix/media/r0/thumbnail/hs/id" };
    render(
      <RecordContextProvider value={value}>
        <AvatarField source="avatar_src" />
      </RecordContextProvider>
    );
    expect(mockFetchWithAuth).toHaveBeenCalledWith("https://hs.example.com/_matrix/media/r0/thumbnail/hs/id");
    await vi.waitFor(() => {
      const img = screen.getByRole("img");
      expect(img.getAttribute("src")).toMatch(/^blob:/);
    });
  });

  it("falls back to src when fetch fails", async () => {
    storageGetItem.mockImplementation((key: string) => (key === "access_token" ? "token123" : null));
    mockFetchWithAuth.mockRejectedValue(new Error("network error"));
    const value = { avatar_src: "https://hs.example.com/thumb.png" };
    render(
      <RecordContextProvider value={value}>
        <AvatarField source="avatar_src" />
      </RecordContextProvider>
    );
    await vi.waitFor(() => {
      expect(screen.getByRole("img").getAttribute("src")).toBe("https://hs.example.com/thumb.png");
    });
  });
});
