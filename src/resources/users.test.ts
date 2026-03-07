import users from "./users";

describe("users resource", () => {
  it("prefers the display name for record representation", () => {
    expect(users.recordRepresentation?.({ id: "@alice:example.com", displayname: "Alice" })).toBe("Alice");
  });

  it("falls back to the record ID when no display name is set", () => {
    expect(users.recordRepresentation?.({ id: "@alice:example.com" })).toBe("@alice:example.com");
  });
});
