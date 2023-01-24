import { fetchUtils } from "react-admin";
import { stringify } from "query-string";

// Adds the access token to all requests
const jsonClient = (url, options = {}) => {
  const token = localStorage.getItem("access_token");
  console.log("httpClient " + url);
  if (token != null) {
    options.user = {
      authenticated: true,
      token: `Bearer ${token}`,
    };
  }
  return fetchUtils.fetchJson(url, options);
};

const mxcUrlToHttp = mxcUrl => {
  const homeserver = localStorage.getItem("base_url");
  const re = /^mxc:\/\/([^/]+)\/(\w+)/;
  var ret = re.exec(mxcUrl);
  console.log("mxcClient " + ret);
  if (ret == null) return null;
  const serverName = ret[1];
  const mediaId = ret[2];
  return `${homeserver}/_matrix/media/r0/thumbnail/${serverName}/${mediaId}?width=24&height=24&method=scale`;
};

const resourceMap = {
  users: {
    path: "/_synapse/admin/v2/users",
    map: u => ({
      ...u,
      id: u.name,
      avatar_src: mxcUrlToHttp(u.avatar_url),
      is_guest: !!u.is_guest,
      admin: !!u.admin,
      deactivated: !!u.deactivated,
      // need timestamp in milliseconds
      creation_ts_ms: u.creation_ts * 1000,
    }),
    data: "users",
    total: json => json.total,
    create: data => ({
      endpoint: `/_synapse/admin/v2/users/@${encodeURIComponent(
        data.id
      )}:${localStorage.getItem("home_server")}`,
      body: data,
      method: "PUT",
    }),
    delete: params => ({
      endpoint: `/_synapse/admin/v1/deactivate/${encodeURIComponent(
        params.id
      )}`,
      body: { erase: true },
      method: "POST",
    }),
  },
  rooms: {
    path: "/_synapse/admin/v1/rooms",
    map: r => ({
      ...r,
      id: r.room_id,
      alias: r.canonical_alias,
      members: r.joined_members,
      is_encrypted: !!r.encryption,
      federatable: !!r.federatable,
      public: !!r.public,
    }),
    data: "rooms",
    total: json => {
      return json.total_rooms;
    },
    delete: params => ({
      endpoint: `/_synapse/admin/v2/rooms/${params.id}`,
      body: { block: false },
    }),
  },
  reports: {
    path: "/_synapse/admin/v1/event_reports",
    map: er => ({
      ...er,
      id: er.id,
    }),
    data: "event_reports",
    total: json => json.total,
  },
  devices: {
    map: d => ({
      ...d,
      id: d.device_id,
    }),
    data: "devices",
    total: json => {
      return json.total;
    },
    reference: id => ({
      endpoint: `/_synapse/admin/v2/users/${encodeURIComponent(id)}/devices`,
    }),
    delete: params => ({
      endpoint: `/_synapse/admin/v2/users/${encodeURIComponent(
        params.user_id
      )}/devices/${params.id}`,
    }),
  },
  connections: {
    path: "/_synapse/admin/v1/whois",
    map: c => ({
      ...c,
      id: c.user_id,
    }),
    data: "connections",
  },
  room_members: {
    map: m => ({
      id: m,
    }),
    reference: id => ({
      endpoint: `/_synapse/admin/v1/rooms/${id}/members`,
    }),
    data: "members",
    total: json => {
      return json.total;
    },
  },
  room_state: {
    map: rs => ({
      ...rs,
      id: rs.event_id,
    }),
    reference: id => ({
      endpoint: `/_synapse/admin/v1/rooms/${id}/state`,
    }),
    data: "state",
    total: json => {
      return json.state.length;
    },
  },
  pushers: {
    map: p => ({
      ...p,
      id: p.pushkey,
    }),
    reference: id => ({
      endpoint: `/_synapse/admin/v1/users/${encodeURIComponent(id)}/pushers`,
    }),
    data: "pushers",
    total: json => {
      return json.total;
    },
  },
  joined_rooms: {
    map: jr => ({
      id: jr,
    }),
    reference: id => ({
      endpoint: `/_synapse/admin/v1/users/${encodeURIComponent(
        id
      )}/joined_rooms`,
    }),
    data: "joined_rooms",
    total: json => {
      return json.total;
    },
  },
  users_media: {
    map: um => ({
      ...um,
      id: um.media_id,
    }),
    reference: id => ({
      endpoint: `/_synapse/admin/v1/users/${encodeURIComponent(id)}/media`,
    }),
    data: "media",
    total: json => {
      return json.total;
    },
    delete: params => ({
      endpoint: `/_synapse/admin/v1/media/${localStorage.getItem(
        "home_server"
      )}/${params.id}`,
    }),
  },
  delete_media: {
    delete: params => ({
      endpoint: `/_synapse/admin/v1/media/${localStorage.getItem(
        "home_server"
      )}/delete?before_ts=${params.before_ts}&size_gt=${
        params.size_gt
      }&keep_profiles=${params.keep_profiles}`,
      method: "POST",
    }),
  },
  protect_media: {
    map: pm => ({ id: pm.media_id }),
    create: params => ({
      endpoint: `/_synapse/admin/v1/media/protect/${params.media_id}`,
      method: "POST",
    }),
    delete: params => ({
      endpoint: `/_synapse/admin/v1/media/unprotect/${params.media_id}`,
      method: "POST",
    }),
  },
  quarantine_media: {
    map: qm => ({ id: qm.media_id }),
    create: params => ({
      endpoint: `/_synapse/admin/v1/media/quarantine/${localStorage.getItem(
        "home_server"
      )}/${params.media_id}`,
      method: "POST",
    }),
    delete: params => ({
      endpoint: `/_synapse/admin/v1/media/unquarantine/${localStorage.getItem(
        "home_server"
      )}/${params.media_id}`,
      method: "POST",
    }),
  },
  servernotices: {
    map: n => ({ id: n.event_id }),
    create: data => ({
      endpoint: "/_synapse/admin/v1/send_server_notice",
      body: {
        user_id: data.id,
        content: {
          msgtype: "m.text",
          body: data.body,
        },
      },
      method: "POST",
    }),
  },
  user_media_statistics: {
    path: "/_synapse/admin/v1/statistics/users/media",
    map: usms => ({
      ...usms,
      id: usms.user_id,
    }),
    data: "users",
    total: json => {
      return json.total;
    },
  },
  forward_extremities: {
    map: fe => ({
      ...fe,
      id: fe.event_id,
    }),
    reference: id => ({
      endpoint: `/_synapse/admin/v1/rooms/${id}/forward_extremities`,
    }),
    data: "results",
    total: json => {
      return json.count;
    },
    delete: params => ({
      endpoint: `/_synapse/admin/v1/rooms/${params.id}/forward_extremities`,
    }),
  },
  room_directory: {
    path: "/_matrix/client/r0/publicRooms",
    map: rd => ({
      ...rd,
      id: rd.room_id,
      public: !!rd.public,
      guest_access: !!rd.guest_access,
      avatar_src: mxcUrlToHttp(rd.avatar_url),
    }),
    data: "chunk",
    total: json => {
      return json.total_room_count_estimate;
    },
    create: params => ({
      endpoint: `/_matrix/client/r0/directory/list/room/${params.id}`,
      body: { visibility: "public" },
      method: "PUT",
    }),
    delete: params => ({
      endpoint: `/_matrix/client/r0/directory/list/room/${params.id}`,
      body: { visibility: "private" },
      method: "PUT",
    }),
  },
  destinations: {
    path: "/_synapse/admin/v1/federation/destinations",
    map: dst => ({
      ...dst,
      id: dst.destination,
    }),
    data: "destinations",
    total: json => {
      return json.total;
    },
    delete: params => ({
      endpoint: `/_synapse/admin/v1/federation/destinations/${params.id}/reset_connection`,
      method: "POST",
    }),
  },
  destination_rooms: {
    map: dstroom => ({
      ...dstroom,
      id: dstroom.room_id,
    }),
    reference: id => ({
      endpoint: `/_synapse/admin/v1/federation/destinations/${id}/rooms`,
    }),
    data: "rooms",
    total: json => {
      return json.total;
    },
  },
  registration_tokens: {
    path: "/_synapse/admin/v1/registration_tokens",
    map: rt => ({
      ...rt,
      id: rt.token,
    }),
    data: "registration_tokens",
    total: json => {
      return json.registration_tokens.length;
    },
    create: params => ({
      endpoint: "/_synapse/admin/v1/registration_tokens/new",
      body: params,
      method: "POST",
    }),
    delete: params => ({
      endpoint: `/_synapse/admin/v1/registration_tokens/${params.id}`,
    }),
  },
};

function filterNullValues(key, value) {
  // Filtering out null properties
  // to reset user_type from user, it must be null
  if (value === null && key !== "user_type") {
    return undefined;
  }
  return value;
}

function getSearchOrder(order) {
  if (order === "DESC") {
    return "b";
  } else {
    return "f";
  }
}

const dataProvider = {
  getList: (resource, params) => {
    console.log("getList " + resource);
    const {
      user_id,
      name,
      guests,
      deactivated,
      search_term,
      destination,
      valid,
    } = params.filter;
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const from = (page - 1) * perPage;
    const query = {
      from: from,
      limit: perPage,
      user_id: user_id,
      search_term: search_term,
      name: name,
      destination: destination,
      guests: guests,
      deactivated: deactivated,
      valid: valid,
      order_by: field,
      dir: getSearchOrder(order),
    };
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const endpoint_url = homeserver + res.path;
    const url = `${endpoint_url}?${stringify(query)}`;

    return jsonClient(url).then(({ json }) => ({
      data: json[res.data].map(res.map),
      total: res.total(json, from, perPage),
    }));
  },

  getOne: (resource, params) => {
    console.log("getOne " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const endpoint_url = homeserver + res.path;
    return jsonClient(`${endpoint_url}/${encodeURIComponent(params.id)}`).then(
      ({ json }) => ({
        data: res.map(json),
      })
    );
  },

  getMany: (resource, params) => {
    console.log("getMany " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const endpoint_url = homeserver + res.path;
    return Promise.all(
      params.ids.map(id =>
        jsonClient(`${endpoint_url}/${encodeURIComponent(id)}`)
      )
    ).then(responses => ({
      data: responses.map(({ json }) => res.map(json)),
      total: responses.length,
    }));
  },

  getManyReference: (resource, params) => {
    console.log("getManyReference " + resource);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const from = (page - 1) * perPage;
    const query = {
      from: from,
      limit: perPage,
      order_by: field,
      dir: getSearchOrder(order),
    };

    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const ref = res["reference"](params.id);
    const endpoint_url = `${homeserver}${ref.endpoint}?${stringify(query)}`;

    return jsonClient(endpoint_url).then(({ headers, json }) => ({
      data: json[res.data].map(res.map),
      total: res.total(json, from, perPage),
    }));
  },

  update: (resource, params) => {
    console.log("update " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const endpoint_url = homeserver + res.path;
    return jsonClient(`${endpoint_url}/${encodeURIComponent(params.data.id)}`, {
      method: "PUT",
      body: JSON.stringify(params.data, filterNullValues),
    }).then(({ json }) => ({
      data: res.map(json),
    }));
  },

  updateMany: (resource, params) => {
    console.log("updateMany " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const endpoint_url = homeserver + res.path;
    return Promise.all(
      params.ids.map(
        id => jsonClient(`${endpoint_url}/${encodeURIComponent(id)}`),
        {
          method: "PUT",
          body: JSON.stringify(params.data, filterNullValues),
        }
      )
    ).then(responses => ({
      data: responses.map(({ json }) => json),
    }));
  },

  create: (resource, params) => {
    console.log("create " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];
    if (!("create" in res)) return Promise.reject();

    const create = res["create"](params.data);
    const endpoint_url = homeserver + create.endpoint;
    return jsonClient(endpoint_url, {
      method: create.method,
      body: JSON.stringify(create.body, filterNullValues),
    }).then(({ json }) => ({
      data: res.map(json),
    }));
  },

  createMany: (resource, params) => {
    console.log("createMany " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];
    if (!("create" in res)) return Promise.reject();

    return Promise.all(
      params.ids.map(id => {
        params.data.id = id;
        const cre = res["create"](params.data);
        const endpoint_url = homeserver + cre.endpoint;
        return jsonClient(endpoint_url, {
          method: cre.method,
          body: JSON.stringify(cre.body, filterNullValues),
        });
      })
    ).then(responses => ({
      data: responses.map(({ json }) => json),
    }));
  },

  delete: (resource, params) => {
    console.log("delete " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    if ("delete" in res) {
      const del = res["delete"](params);
      const endpoint_url = homeserver + del.endpoint;
      return jsonClient(endpoint_url, {
        method: "method" in del ? del.method : "DELETE",
        body: "body" in del ? JSON.stringify(del.body) : null,
      }).then(({ json }) => ({
        data: json,
      }));
    } else {
      const endpoint_url = homeserver + res.path;
      return jsonClient(`${endpoint_url}/${params.id}`, {
        method: "DELETE",
        body: JSON.stringify(params.data, filterNullValues),
      }).then(({ json }) => ({
        data: json,
      }));
    }
  },

  deleteMany: (resource, params) => {
    console.log("deleteMany " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    if ("delete" in res) {
      return Promise.all(
        params.ids.map(id => {
          const del = res["delete"]({ ...params, id: id });
          const endpoint_url = homeserver + del.endpoint;
          return jsonClient(endpoint_url, {
            method: "method" in del ? del.method : "DELETE",
            body: "body" in del ? JSON.stringify(del.body) : null,
          });
        })
      ).then(responses => ({
        data: responses.map(({ json }) => json),
      }));
    } else {
      const endpoint_url = homeserver + res.path;
      return Promise.all(
        params.ids.map(id =>
          jsonClient(`${endpoint_url}/${id}`, {
            method: "DELETE",
            body: JSON.stringify(params.data, filterNullValues),
          })
        )
      ).then(responses => ({
        data: responses.map(({ json }) => json),
      }));
    }
  },
};

export default dataProvider;
