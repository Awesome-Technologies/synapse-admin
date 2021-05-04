import React from "react";
import { TestContext } from "ra-test";
import { shallow } from "enzyme";
import LoginPage from "./LoginPage";

describe("LoginForm", () => {
  it("renders", () => {
    shallow(
      <TestContext>
        <LoginPage />
      </TestContext>
    );
  });
});
