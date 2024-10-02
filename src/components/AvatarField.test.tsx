import { render, screen, waitFor } from "@testing-library/react";
import { RecordContextProvider } from "react-admin";
import { act } from "react";
import AvatarField from "./AvatarField";

describe("AvatarField", () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(["mock image data"], { type: 'image/jpeg' })),
      })
    ) as jest.Mock;

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => "mock-object-url");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.only("shows image", async () => {
    const value = {
      avatar: "mxc://serverName/mediaId",
    };

    await act(async () => {
      render(
        <RecordContextProvider value={value}>
          <AvatarField source="avatar" />
        </RecordContextProvider>
      );
    });

    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img.getAttribute("src")).toBe("mock-object-url");
    });

    expect(global.fetch).toHaveBeenCalled();
  });
});
