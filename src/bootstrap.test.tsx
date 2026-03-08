import { useContext } from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { AppContext } from "./AppContext";
import { Bootstrap } from "./bootstrap";

vi.mock("./App", () => ({
  default: () => {
    const config = useContext(AppContext);
    return <div data-testid="app">{JSON.stringify(config)}</div>;
  },
}));

describe("Bootstrap", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("shows a loading state until the config request resolves", async () => {
    let resolveResponse: ((value: Response) => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveResponse = resolve;
        })
    );

    render(<Bootstrap />);

    expect(screen.getByText("Loading configuration...")).toBeTruthy();

    resolveResponse?.(
      new Response(JSON.stringify({ restrictBaseUrl: "https://matrix.example.com" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    expect((await screen.findByTestId("app")).textContent).toBe(
      JSON.stringify({ restrictBaseUrl: "https://matrix.example.com" })
    );
  });

  it("renders an error state when the config request fails", async () => {
    fetchMock.mockResponseOnce("not found", { status: 404 });

    render(<Bootstrap />);

    expect(await screen.findByText("Failed to load configuration: HTTP 404")).toBeTruthy();
  });

  it("ignores late responses after unmount", async () => {
    let resolveResponse: ((value: Response) => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveResponse = resolve;
        })
    );

    const { unmount } = render(<Bootstrap />);
    unmount();

    resolveResponse?.(
      new Response(JSON.stringify({ restrictBaseUrl: "https://matrix.example.com" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId("app")).toBeNull();
  });
});
