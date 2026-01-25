import { render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("./synapse/authProvider", () => ({
  __esModule: true,
  default: {
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("App", () => {
  it("renders", async () => {
    render(<App />);
    await screen.findAllByText("Welcome to Synapse-admin");
  });
});
