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

const resourceMap = {
  users: {
    path: "/_synapse/admin/v2/users",
    map: u => ({
      ...u,
      id: u.name,
      is_guest: !!u.is_guest,
      admin: !!u.admin,
      deactivated: !!u.deactivated,
    }),
    data: "users",
    total: (json, from, perPage) => {
      return json.next_token
        ? parseInt(json.next_token, 10) + perPage
        : from + json.users.length;
    },
    delete: id => ({
      endpoint: `/_synapse/admin/v1/deactivate/${id}`,
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
    }),
    data: "rooms",
    total: json => {
      return json.total_rooms;
    },
  },
  connections: {
    path: "/_synapse/admin/v1/whois",
    map: c => ({
      ...c,
      id: c.user_id,
    }),
    data: "connections",
  },
  servernotices: {
    data: "servernotices",
    sendMessage: (id, params) => ({
      endpoint: "/_synapse/admin/v1/send_server_notice",
      body: {
        user_id: `${id}`,
        content: {
          msgtype: "m.text",
          body: `${params.body}`,
        },
      },
      method: "POST",
    }),
  },
};

function filterNullValues(key, value) {
  // Filtering out null properties
  if (value === null) {
    return undefined;
  }
  return value;
}

const dataProvider = {
  getList: (resource, params) => {
    console.log("getList " + resource);
    const { user_id, guests, deactivated } = params.filter;
    const { page, perPage } = params.pagination;
    const from = (page - 1) * perPage;
    const query = {
      from: from,
      limit: perPage,
      user_id: user_id,
      guests: guests,
      deactivated: deactivated,
    };
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const homeserver_url = homeserver + res.path;
    const url = `${homeserver_url}?${stringify(query)}`;

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

    const homeserver_url = homeserver + res.path;
    return jsonClient(`${homeserver_url}/${params.id}`).then(({ json }) => ({
      data: res.map(json),
    }));
  },

  getMany: (resource, params) => {
    console.log("getMany " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const homeserver_url = homeserver + res.path;
    return Promise.all(
      params.ids.map(id => jsonClient(`${homeserver_url}/${id}`))
    ).then(responses => ({
      data: responses.map(({ json }) => res.map(json)),
    }));
  },

  getManyReference: (resource, params) => {
    // FIXME
    console.log("getManyReference " + resource);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };

    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const homeserver_url = homeserver + res.path;
    const url = `${homeserver_url}?${stringify(query)}`;

    return jsonClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(
        headers
          .get("content-range")
          .split("/")
          .pop(),
        10
      ),
    }));
  },

  update: (resource, params) => {
    console.log("update " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const homeserver_url = homeserver + res.path;
    return jsonClient(`${homeserver_url}/${params.data.id}`, {
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

    const homeserver_url = homeserver + res.path;
    return Promise.all(
      params.ids.map(id => jsonClient(`${homeserver_url}/${id}`), {
        method: "PUT",
        body: JSON.stringify(params.data, filterNullValues),
      })
    ).then(responses => ({
      data: responses.map(({ json }) => json),
    }));
  },

  create: (resource, params) => {
    console.log("create " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const homeserver_url = homeserver + res.path;
    return jsonClient(`${homeserver_url}/${params.data.id}`, {
      method: "PUT",
      body: JSON.stringify(params.data, filterNullValues),
    }).then(({ json }) => ({
      data: res.map(json),
    }));
  },

  delete: (resource, params) => {
    console.log("delete " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    if ("delete" in res) {
      const del = res["delete"](params.id);
      const homeserver_url = homeserver + del.endpoint;
      return jsonClient(homeserver_url, {
        method: del.method,
        body: JSON.stringify(del.body),
      }).then(({ json }) => ({
        data: json,
      }));
    } else {
      const homeserver_url = homeserver + res.path;
      return jsonClient(`${homeserver_url}/${params.id}`, {
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
          const del = res["delete"](id);
          const homeserver_url = homeserver + del.endpoint;
          return jsonClient(homeserver_url, {
            method: del.method,
            body: JSON.stringify(del.body),
          });
        })
      ).then(responses => ({
        data: responses.map(({ json }) => json),
      }));
    } else {
      const homeserver_url = homeserver + res.path;
      return Promise.all(
        params.ids.map(id =>
          jsonClient(`${homeserver_url}/${id}`, {
            method: "DELETE",
            body: JSON.stringify(params.data, filterNullValues),
          })
        )
      ).then(responses => ({
        data: responses.map(({ json }) => json),
      }));
    }
  },

  sendMessage: (resource, params) => {
    console.log("sendMessage " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    const sendmsg = res["sendMessage"](params.id, params.data);
    const homeserver_url = homeserver + sendmsg.endpoint;
    return jsonClient(homeserver_url, {
      method: sendmsg.method,
      body: JSON.stringify(sendmsg.body),
    }).then(({ json }) => ({
      data: json,
    }));
  },

  sendMessageMany: (resource, params) => {
    console.log("sendMessageMany " + resource);
    const homeserver = localStorage.getItem("base_url");
    if (!homeserver || !(resource in resourceMap)) return Promise.reject();

    const res = resourceMap[resource];

    return Promise.all(
      params.ids.map(id => {
        const sendmsg = res["sendMessage"](id, params.data);
        const homeserver_url = homeserver + sendmsg.endpoint;
        return jsonClient(homeserver_url, {
          method: sendmsg.method,
          body: JSON.stringify(sendmsg.body),
        });
      })
    ).then(responses => ({
      data: responses.map(({ json }) => json),
    }));
  },
};

export default dataProvider;
