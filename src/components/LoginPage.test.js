import React from "react";
import { render } from "@testing-library/react";
import { TestContext } from "ra-test";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import LoginPage from "./LoginPage";

const theme = createTheme();

describe("LoginForm", () => {
  it("renders", () => {
    render(
      <ThemeProvider theme={theme}>
        <TestContext>
          <LoginPage />
        </TestContext>
      </ThemeProvider>
    );
  });
});
