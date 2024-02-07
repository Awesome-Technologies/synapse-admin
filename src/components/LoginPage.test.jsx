import React from "react";
import { render } from "@testing-library/react";
import { AdminContext } from "react-admin";
import LoginPage from "./LoginPage";

describe("LoginForm", () => {
  it("renders", () => {
    render(
      <AdminContext>
        <LoginPage />
      </AdminContext>
    );
  });
});
