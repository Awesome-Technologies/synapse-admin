import React from "react";
import { TestContext } from "ra-test";
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
