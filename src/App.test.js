import React from "react";
import { TestContext } from "react-admin";
import { shallow } from "enzyme";
import App from "./App";

describe("App", () => {
  it("renders", () => {
    shallow(
      <TestContext>
        <App />
      </TestContext>
    );
  });
});
