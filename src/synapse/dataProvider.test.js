import dataProvider from "./dataProvider";

beforeEach(() => {
  fetch.resetMocks();
});

describe("dataProvider", () => {
  localStorage.setItem("base_url", "http://localhost");
  localStorage.setItem("access_token", "access_token");

  it("fetches all users", async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        users: [
          {
            name: "user_id1",
            password_hash: "password_hash1",
            is_guest: 0,
            admin: 0,
            user_type: null,
            deactivated: 0,
            displayname: "User One",
          },
          {
            name: "user_id2",
            password_hash: "password_hash2",
            is_guest: 0,
            admin: 1,
            user_type: null,
            deactivated: 0,
            displayname: "User Two",
          },
        ],
        next_token: "100",
        total: 200,
      })
    );

    const users = await dataProvider.getList("users", {
      pagination: { page: 1, perPage: 5 },
      sort: { field: "title", order: "ASC" },
      filter: { author_id: 12 },
    });

    expect(users["data"][0]["id"]).toEqual("user_id1");
    expect(users["total"]).toEqual(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("fetches one user", async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        name: "user_id1",
        password: "user_password",
        displayname: "User",
        threepids: [
          {
            medium: "email",
            address: "user@mail_1.com",
          },
          {
            medium: "email",
            address: "user@mail_2.com",
          },
        ],
        avatar_url: "mxc://localhost/user1",
        admin: false,
        deactivated: false,
      })
    );

    const user = await dataProvider.getOne("users", { id: "user_id1" });

    expect(user["data"]["id"]).toEqual("user_id1");
    expect(user["data"]["displayname"]).toEqual("User");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
