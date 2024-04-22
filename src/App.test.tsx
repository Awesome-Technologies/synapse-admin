import { render, screen } from "@testing-library/react";

import App from "./App";

describe("App", () => {
  it("renders", async () => {
    render(<App />);
    await screen.findAllByText("Welcome to Synapse-admin");
  });
});
