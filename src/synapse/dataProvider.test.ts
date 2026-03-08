import dataProvider, {
  buildCollectionUrl,
  buildReferenceUrl,
  createResource,
  deleteMedia,
  deleteResource,
  filterNullValues,
  getCollectionResource,
  getReferenceResource,
  getResourceConfig,
  getResourceTotal,
  getSearchOrder,
  mapResourceData,
  mxcUrlToHttp,
} from "./dataProvider";
import storage from "../storage";

describe("dataProvider", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    storage.clear();
    storage.setItem("base_url", "http://localhost");
    storage.setItem("home_server", "matrix.example.com");
    storage.setItem("access_token", "access_token");
  });

  it("exposes small helper utilities", () => {
    expect(filterNullValues("displayname", null)).toBeUndefined();
    expect(filterNullValues("user_type", null)).toBeNull();
    expect(getSearchOrder("ASC")).toBe("f");
    expect(getSearchOrder("DESC")).toBe("b");
    expect(mxcUrlToHttp("mxc://server/media")).toBe(
      "http://localhost/_matrix/media/r0/thumbnail/server/media?width=24&height=24&method=scale"
    );
    expect(mxcUrlToHttp("not-an-mxc")).toBeNull();
  });

  it("resolves resource configs and rejects unsupported resource access", () => {
    expect(getResourceConfig("users")).toMatchObject({ data: "users" });
    expect(getCollectionResource("users")).toMatchObject({ path: "/_synapse/admin/v2/users" });
    expect(getReferenceResource("devices")).toMatchObject({ data: "devices" });
    expect(() => getResourceConfig("missing")).toThrow("Unknown resource: missing");
    expect(() => getCollectionResource("devices")).toThrow("Resource devices does not support collection requests");
    expect(() => getReferenceResource("users")).toThrow("Resource users does not support reference requests");
  });

  it("builds collection and reference URLs with query parameters", () => {
    expect(buildCollectionUrl("users")).toBe("http://localhost/_synapse/admin/v2/users");
    const collectionUrl = buildCollectionUrl("users", { from: 0, limit: 10, guests: true });
    const referenceUrl = buildReferenceUrl("devices", "@alice:example.com", { from: 5, limit: 5 });

    expect(collectionUrl).toContain("http://localhost/_synapse/admin/v2/users?");
    expect(collectionUrl).toContain("from=0");
    expect(collectionUrl).toContain("limit=10");
    expect(collectionUrl).toContain("guests=true");

    expect(buildCollectionUrl("users", {})).toBe("http://localhost/_synapse/admin/v2/users");
    expect(buildReferenceUrl("devices", "@alice:example.com", {})).toBe("http://localhost/_synapse/admin/v2/users/%40alice%3Aexample.com/devices");

    expect(referenceUrl).toContain("http://localhost/_synapse/admin/v2/users/%40alice%3Aexample.com/devices?");
    expect(referenceUrl).toContain("from=5");
    expect(referenceUrl).toContain("limit=5");
  });

  it("maps resource data and totals according to the resource config", () => {
    const config = getResourceConfig("registration_tokens");
    const json = {
      registration_tokens: [
        { token: "first", uses_allowed: 1, pending: 0, completed: 0 },
        { token: "second", uses_allowed: 2, pending: 1, completed: 1 },
      ],
    };

    expect(mapResourceData(config, json)).toEqual([
      expect.objectContaining({ id: "first" }),
      expect.objectContaining({ id: "second" }),
    ]);
    expect(getResourceTotal(config, json)).toBe(2);
    expect(getResourceTotal(getResourceConfig("servernotices"), { event_id: { id: "evt" } })).toBe(0);
  });

  it("returns defaults for non-array resource data", () => {
    const config = getResourceConfig("connections");
    const json = { connections: "not-an-array" };

    expect(mapResourceData(config, json)).toEqual([]);
    expect(getResourceTotal(config, json)).toBe(0);
  });

  it("fetches and maps different collection resources properly", () => {
    const usersConfig = getResourceConfig("users");
    expect(mapResourceData(usersConfig, {
      users: [{ name: "u1", is_guest: 1, admin: 1, deactivated: 1, creation_ts: 100, threepids: [], external_ids: [], erased: false, shadow_banned: 0, locked: false }]
    })).toEqual([expect.objectContaining({ id: "u1", is_guest: true, admin: true, deactivated: true, creation_ts_ms: 100000, avatar_src: undefined })]);

    const roomConfig = getResourceConfig("rooms");
    expect(mapResourceData(roomConfig, {
      rooms: [{ room_id: "room1", avatar_url: "mxc://server/media", encryption: "yes", federatable: true, public: true, joined_members: 1, joined_local_members: 1, version: 1, creator: "a", join_rules: "public", history_visibility: "shared", state_events: 1 }]
    })).toEqual([expect.objectContaining({
      id: "room1", avatar_src: "http://localhost/_matrix/media/r0/thumbnail/server/media?width=24&height=24&method=scale", is_encrypted: true, federatable: true, public: true
    })]);
    expect(getResourceTotal(roomConfig, { total_rooms: 10 })).toBe(10);

    const roomDirConfig = getResourceConfig("room_directory");
    expect(mapResourceData(roomDirConfig, {
      chunk: [{ room_id: "room1", public: true, guest_access: true, joined_members: 1, joined_local_members: 1, version: 1, creator: "a", join_rules: "public", history_visibility: "shared", state_events: 1 }]
    })).toEqual([expect.objectContaining({
      id: "room1", public: true, guest_access: true, avatar_src: undefined
    })]);
    expect(getResourceTotal(roomDirConfig, { total_room_count_estimate: 20 })).toBe(20);

    const pushersConfig = getResourceConfig("pushers");
    expect(mapResourceData(pushersConfig, { pushers: [{ pushkey: "pk1", app_display_name: "", app_id: "", data: { format: "" }, url: "", format: "", device_display_name: "", profile_tag: "", kind: "", lang: "" }] })).toEqual([expect.objectContaining({ id: "pk1" })]);

    const jrConfig = getResourceConfig("joined_rooms");
    expect(mapResourceData(jrConfig, { joined_rooms: ["room1"] })).toEqual([{ id: "room1" }]);

    const rmConfig = getResourceConfig("room_members");
    expect(mapResourceData(rmConfig, { members: ["member1"] })).toEqual([{ id: "member1" }]);

    const rsConfig = getResourceConfig("room_state");
    expect(mapResourceData(rsConfig, { state: [{ event_id: "ev1", age: 0, content: {}, origin_server_ts: 0, room_id: "", sender: "", state_key: "", type: "", user_id: "", unsigned: {} }] })).toEqual([expect.objectContaining({ id: "ev1" })]);
    expect(getResourceTotal(rsConfig, { state: [{}, {}] })).toBe(2);

    const feConfig = getResourceConfig("forward_extremities");
    expect(mapResourceData(feConfig, { results: [{ event_id: "ev1", state_group: 0, depth: 0, received_ts: 0 }] })).toEqual([expect.objectContaining({ id: "ev1" })]);

    const umConfig = getResourceConfig("users_media");
    expect(mapResourceData(umConfig, { media: [{ media_id: "m1", created_ts: 0, media_length: 0, media_type: "", safe_from_quarantine: false }] })).toEqual([expect.objectContaining({ id: "m1" })]);

    const umsConfig = getResourceConfig("user_media_statistics");
    expect(mapResourceData(umsConfig, { users: [{ user_id: "u1", displayname: "", media_count: 0, media_length: 0 }] })).toEqual([expect.objectContaining({ id: "u1" })]);

    const destConfig = getResourceConfig("destinations");
    expect(mapResourceData(destConfig, { destinations: [{ destination: "d1", retry_last_ts: 0, retry_interval: 0, failure_ts: 0 }] })).toEqual([expect.objectContaining({ id: "d1" })]);

    const drConfig = getResourceConfig("destination_rooms");
    expect(mapResourceData(drConfig, { rooms: [{ room_id: "r1", stream_ordering: 0 }] })).toEqual([expect.objectContaining({ id: "r1" })]);

    const connConfig = getResourceConfig("connections");
    expect(mapResourceData(connConfig, { connections: [{ user_id: "u1", devices: {} }] })).toEqual([expect.objectContaining({ id: "u1" })]);

    const reportsConfig = getResourceConfig("reports");
    expect(mapResourceData(reportsConfig, { event_reports: [{ id: 1, room_id: "r1", name: "n", event_id: "e1", user_id: "u1", sender: "s1", received_ts: 123 }] })).toEqual([{ id: 1, room_id: "r1", name: "n", event_id: "e1", user_id: "u1", sender: "s1", received_ts: 123 }]);
  });

  it("fetches list and one record for users", async () => {
    fetchMock
      .mockResponseOnce(
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
          total: 200,
        })
      )
      .mockResponseOnce(
        JSON.stringify({
          name: "user_id1",
          password: "user_password",
          displayname: "User",
          threepids: [],
          avatar_url: "mxc://localhost/user1",
          admin: false,
          deactivated: false,
        })
      );

    const users = await dataProvider.getList("users", {
      pagination: { page: 1, perPage: 5 },
      sort: { field: "title", order: "ASC" },
      filter: { author_id: 12 },
    });
    const user = await dataProvider.getOne("users", { id: "user_id1" });

    expect(users.data[0]).toMatchObject({ id: "user_id1", displayname: "User One" });
    expect(users.total).toEqual(200);
    expect(user.data).toMatchObject({
      id: "user_id1",
      avatar_src: "http://localhost/_matrix/media/r0/thumbnail/localhost/user1?width=24&height=24&method=scale",
    });
  });

  it("passes comprehensive filters to getList queries", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ destinations: [], total: 0 }));

    await dataProvider.getList("destinations", {
      pagination: { page: 2, perPage: 15 },
      sort: { field: "destination", order: "DESC" },
      filter: { destination: "example.com", valid: true, search_term: "ex", locked: false, deactivated: false, guests: false, name: "foo" },
    });

    expect(fetchMock.mock.calls[0]?.[0]).toContain("deactivated=false&destination=example.com&dir=b&from=15&guests=false&limit=15&locked=false&name=foo&order_by=destination&search_term=ex&valid=true");
  });

  it("passes comprehensive queries to getManyReference", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ devices: [], total: 0 }));

    await dataProvider.getManyReference("devices", {
      id: "user1",
      target: "user_id",
      pagination: { page: 3, perPage: 20 },
      sort: { field: "last_seen", order: "DESC" },
      filter: {},
    });

    expect(fetchMock.mock.calls[0]?.[0]).toContain("dir=b&from=40&limit=20&order_by=last_seen");
  });

  it("supports getMany and getManyReference", async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify({ name: "user_id1", threepids: [], external_ids: [], admin: 0, deactivated: 0, is_guest: 0, erased: false, shadow_banned: 0, creation_ts: 1, locked: false }))
      .mockResponseOnce(JSON.stringify({ name: "user_id2", threepids: [], external_ids: [], admin: 0, deactivated: 0, is_guest: 0, erased: false, shadow_banned: 0, creation_ts: 1, locked: false }))
      .mockResponseOnce(
        JSON.stringify({
          devices: [
            { device_id: "A", display_name: "Phone", user_id: "@alice:example.com" },
          ],
          total: 1,
        })
      );

    const many = await dataProvider.getMany("users", { ids: ["user_id1", "user_id2"] });
    const reference = await dataProvider.getManyReference("devices", {
      id: "@alice:example.com",
      target: "user_id",
      pagination: { page: 1, perPage: 10 },
      sort: { field: "device_id", order: "DESC" },
      filter: {},
    });

    expect(many.data).toHaveLength(2);
    expect(reference.data).toEqual([{ device_id: "A", display_name: "Phone", user_id: "@alice:example.com", id: "A" }]);
    expect(reference.total).toBe(1);
  });

  it("updates one or many records while filtering null values", async () => {
    fetchMock
      .mockResponseOnce(
        JSON.stringify({
          name: "user_id1",
          displayname: "Updated",
          threepids: [],
          external_ids: [],
          admin: 0,
          deactivated: 0,
          is_guest: 0,
          erased: false,
          shadow_banned: 0,
          creation_ts: 1,
          locked: false,
        })
      )
      .mockResponseOnce(JSON.stringify({ ok: true }))
      .mockResponseOnce(JSON.stringify({ ok: true }));

    const updated = await dataProvider.update("users", {
      id: "user_id1",
      previousData: { id: "user_id1" },
      data: { displayname: "Updated", user_type: null, avatar_url: null },
    });
    const many = await dataProvider.updateMany("users", {
      ids: ["user_id1", "user_id2"],
      data: { locked: true, avatar_url: null },
    });

    expect(updated.data).toMatchObject({ id: "user_id1", displayname: "Updated" });
    expect(many.data).toEqual([{ ok: true }, { ok: true }]);
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe('{"displayname":"Updated","user_type":null}');
    expect(fetchMock.mock.calls[1]?.[1]?.body).toBe('{"locked":true}');
  });

  it("creates resources through the helper and provider entry points", async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify({ event_id: "evt1" }))
      .mockResponseOnce(JSON.stringify({ token: "token-1", uses_allowed: 1, pending: 0, completed: 0 }))
      .mockResponseOnce(JSON.stringify({ event_id: "evt2" }))
      .mockResponseOnce(JSON.stringify({ event_id: "evt3" }));

    await expect(
      createResource("servernotices", { id: "@alice:example.com", body: "Hello" })
    ).resolves.toEqual({ data: { id: "evt1" } });

    await expect(
      dataProvider.create("registration_tokens", {
        data: { token: "token-1", uses_allowed: 1 },
      })
    ).resolves.toEqual({ data: expect.objectContaining({ id: "token-1" }) });

    await expect(
      dataProvider.createMany("servernotices", {
        ids: ["@alice:example.com", "@bob:example.com"],
        data: { id: "@ignored:example.com", body: "Broadcast" },
      })
    ).resolves.toEqual({ data: [{ event_id: "evt2" }, { event_id: "evt3" }] });

    await expect(createResource("reports", { id: 1 })).rejects.toThrow("Create reports is not allowed");
  });

  it("creates a room_directory resource using its custom PUT mapping", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}));
    await createResource("room_directory", { id: "!room:example.com" });
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/_matrix/client/r0/directory/list/room/!room:example.com");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("PUT");
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe('{"visibility":"public"}');
  });

  it("rejects createMany for unsupported resources", async () => {
    await expect(
      dataProvider.createMany("reports", {
        ids: ["1"], data: { id: "1" }
      })
    ).rejects.toThrow("Create reports is not allowed");
  });

  it("creates various resources using their custom configurations", async () => {
    fetchMock.mockResponse(JSON.stringify({ media_id: "media1" }));

    await dataProvider.create("protect_media", { data: { media_id: "media1" } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/_synapse/admin/v1/media/protect/media1",
      expect.objectContaining({ method: "POST" })
    );

    await dataProvider.create("quarantine_media", { data: { media_id: "media1" } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/_synapse/admin/v1/media/quarantine/matrix.example.com/media1",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("deletes single and multiple resources via custom and fallback flows", async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify({ id: "room-1" }))
      .mockResponseOnce(JSON.stringify({ id: "token-1" }))
      .mockResponseOnce(JSON.stringify({ id: "token-2" }));

    await expect(
      deleteResource("servernotices", { id: "evt1", previousData: { event_id: "deleted" } })
    ).rejects.toThrow("Resource servernotices does not support collection requests");

    await expect(
      dataProvider.delete("room_directory", { id: "!room:example.com", previousData: { id: "!room:example.com" } })
    ).resolves.toEqual({ data: { id: "room-1" } });

    await expect(
      dataProvider.deleteMany("servernotices", {
        ids: ["evt1", "evt2"],
      } as never)
    ).rejects.toThrow("Resource servernotices does not support collection requests");

    await expect(
      dataProvider.deleteMany("registration_tokens", {
        ids: ["token-1", "token-2"],
      } as never)
    ).resolves.toEqual({ data: [{ id: "token-1" }, { id: "token-2" }] });
  });

  it("deletes various resources using their custom configurations", async () => {
    fetchMock.mockResponse(JSON.stringify({}));

    await dataProvider.delete("rooms", { id: "room1", previousData: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/_synapse/admin/v2/rooms/room1",
      expect.objectContaining({ method: "DELETE", body: '{"block":false}' })
    );

    await dataProvider.delete("users_media", { id: "media1", previousData: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/_synapse/admin/v1/media/matrix.example.com/media1",
      expect.objectContaining({ method: "DELETE" })
    );

    await dataProvider.delete("protect_media", { id: "media1", previousData: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/_synapse/admin/v1/media/unprotect/media1",
      expect.objectContaining({ method: "POST" })
    );

    await dataProvider.delete("quarantine_media", { id: "media1", previousData: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/_synapse/admin/v1/media/unquarantine/matrix.example.com/media1",
      expect.objectContaining({ method: "POST" })
    );

    await dataProvider.delete("forward_extremities", { id: "room1", previousData: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/_synapse/admin/v1/rooms/room1/forward_extremities",
      expect.objectContaining({ method: "DELETE" })
    );

    await dataProvider.delete("destinations", { id: "dest1", previousData: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/_synapse/admin/v1/federation/destinations/dest1/reset_connection",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("deletes single resources using custom methods and fallback body logic", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}));
    await deleteResource("devices", { id: "D1", previousData: { user_id: "@u:example.com" } });
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBeNull();

    fetchMock.mockResponseOnce(JSON.stringify({ id: "deleted" }));
    await deleteResource("users", { id: "@user:matrix.example.com", previousData: {} });
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe("POST");
    expect(fetchMock.mock.calls[1]?.[1]?.body).toBe('{"erase":true}');
  });

  it("deletes single and multiple resources without custom delete definitions", async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify({ id: "1" }))
      .mockResponseOnce(JSON.stringify({ id: "2" }))
      .mockResponseOnce(JSON.stringify({ id: "3" }));

    await expect(dataProvider.delete("reports", { id: "1", previousData: { id: "1" } })).resolves.toEqual({
      data: { id: "1" }
    });
    await expect(dataProvider.deleteMany("reports", { ids: ["2", "3"] } as never)).resolves.toEqual({
      data: [{ id: "2" }, { id: "3" }]
    });
  });

  it("deletes multiple resources via custom delete definition with body", async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify({ id: "user1" }))
      .mockResponseOnce(JSON.stringify({ id: "user2" }));

    await expect(
      dataProvider.deleteMany("users", {
        ids: ["user1", "user2"],
      } as never)
    ).resolves.toEqual({ data: [{ id: "user1" }, { id: "user2" }] });

    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe('{"erase":true}');
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");

    expect(fetchMock.mock.calls[1]?.[1]?.body).toBe('{"erase":true}');
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe("POST");
  });

  it("calls the custom bulk media deletion endpoint", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ deleted_media: ["m1"], total: 1 }));

    await expect(deleteMedia({ before_ts: 123, size_gt: 5, keep_profiles: false })).resolves.toEqual({
      deleted_media: ["m1"],
      total: 1,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      "/_synapse/admin/v1/media/matrix.example.com/delete?before_ts=123&size_gt=5&keep_profiles=false"
    );
  });
});
