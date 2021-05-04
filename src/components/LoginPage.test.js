import React from "react";
import { render } from "@testing-library/react";
import { TestContext } from "ra-test";
import LoginPage from "./LoginPage";

describe("LoginForm", () => {
  it("renders", () => {
    render(
      <TestContext>
        <LoginPage />
      </TestContext>
    );
  });
});
