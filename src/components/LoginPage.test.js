import React from "react";
import { TestContext } from "react-admin";
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
