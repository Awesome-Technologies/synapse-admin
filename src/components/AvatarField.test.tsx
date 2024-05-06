import { render, screen } from "@testing-library/react";
import { RecordContextProvider } from "react-admin";

import AvatarField from "./AvatarField";

describe("AvatarField", () => {
  it("shows image", () => {
    const value = {
      avatar: "foo",
    };
    render(
      <RecordContextProvider value={value}>
        <AvatarField source="avatar" />
      </RecordContextProvider>
    );
    expect(screen.getByRole("img").getAttribute("src")).toBe("foo");
  });
});
