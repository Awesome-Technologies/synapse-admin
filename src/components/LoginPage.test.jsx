import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminContext } from "react-admin";
import LoginPage from "./LoginPage";
import { AppContext } from "../AppContext";

describe("LoginForm", () => {
  it("renders with no restriction to homeserver", () => {
    render(
      <AdminContext>
        <LoginPage />
      </AdminContext>
    );

    screen.getByText("synapseadmin.auth.welcome");
    screen.getByRole("combobox", { name: "" });
    screen.getByRole("textbox", { name: "ra.auth.username" });
    screen.getByText("ra.auth.password");
    const baseUrlInput = screen.getByRole("textbox", {
      name: "synapseadmin.auth.base_url",
    });
    expect(baseUrlInput.className.split(" ")).not.toContain("Mui-readOnly");
    screen.getByRole("button", { name: "ra.auth.sign_in" });
  });

  it("renders with single restricted homeserver", () => {
    render(
      <AppContext.Provider
        value={{ restrictBaseUrl: "https://matrix.example.com" }}
      >
        <AdminContext>
          <LoginPage />
        </AdminContext>
      </AppContext.Provider>
    );

    screen.getByText("synapseadmin.auth.welcome");
    screen.getByRole("combobox", { name: "" });
    screen.getByRole("textbox", { name: "ra.auth.username" });
    screen.getByText("ra.auth.password");
    const baseUrlInput = screen.getByRole("textbox", {
      name: "synapseadmin.auth.base_url",
    });
    expect(baseUrlInput.className.split(" ")).toContain("Mui-readOnly");
    screen.getByRole("button", { name: "ra.auth.sign_in" });
  });

  it("renders with multiple restricted homeservers", async () => {
    render(
      <AppContext.Provider
        value={{
          restrictBaseUrl: [
            "https://matrix.example.com",
            "https://matrix.example.org",
          ],
        }}
      >
        <AdminContext>
          <LoginPage />
        </AdminContext>
      </AppContext.Provider>
    );

    screen.getByText("synapseadmin.auth.welcome");
    screen.getByRole("combobox", { name: "" });
    screen.getByRole("textbox", { name: "ra.auth.username" });
    screen.getByText("ra.auth.password");
    screen.getByRole("combobox", { name: "synapseadmin.auth.base_url" });
    screen.getByRole("button", { name: "ra.auth.sign_in" });
  });
});
