import { stringify } from "query-string";
import {
  DataProvider,
  DeleteParams,
  Identifier,
  PaginationPayload,
  RaRecord,
  SortPayload,
} from "react-admin";

import { buildUrl, fetchJsonFromAbsoluteUrl, requireStoredBaseUrl, requireStoredHomeServer } from "./synapse";

interface Room {
  room_id: string;
  name?: string;
  canonical_alias?: string;
  avatar_url?: string;
  joined_members: number;
  joined_local_members: number;
  version: number;
  creator: string;
  encryption?: string;
  federatable: boolean;
  public: boolean;
  join_rules: "public" | "knock" | "invite" | "private";
  guest_access?: "can_join" | "forbidden";
  history_visibility: "invited" | "joined" | "shared" | "world_readable";
  state_events: number;
  room_type?: string;
}

interface RoomState {
  age: number;
  content: {
    alias?: string;
  };
  event_id: string;
  origin_server_ts: number;
  room_id: string;
  sender: string;
  state_key: string;
  type: string;
  user_id: string;
  unsigned: {
    age?: number;
  };
}

interface ForwardExtremity {
  event_id: string;
  state_group: number;
  depth: number;
  received_ts: number;
}

interface EventReport {
  id: number;
  received_ts: number;
  room_id: string;
  name: string;
  event_id: string;
  user_id: string;
  reason?: string;
  score?: number;
  sender: string;
  canonical_alias?: string;
}

interface Threepid {
  medium: string;
  address: string;
  added_at: number;
  validated_at: number;
}

interface ExternalId {
  auth_provider: string;
  external_id: string;
}

interface User {
  name: string;
  displayname?: string;
  threepids: Threepid[];
  avatar_url?: string;
  is_guest: 0 | 1;
  admin: 0 | 1;
  deactivated: 0 | 1;
  erased: boolean;
  shadow_banned: 0 | 1;
  creation_ts: number;
  appservice_id?: string;
  consent_server_notice_sent?: string;
  consent_version?: string;
  consent_ts?: number;
  external_ids: ExternalId[];
  user_type?: string;
  locked: boolean;
}

interface Device {
  device_id: string;
  display_name?: string;
  last_seen_ip?: string;
  last_seen_user_agent?: string;
  last_seen_ts?: number;
  user_id: string;
}

interface Connection {
  ip: string;
  last_seen: number;
  user_agent: string;
}

interface Whois {
  user_id: string;
  devices: Record<
    string,
    {
      sessions: {
        connections: Connection[];
      }[];
    }
  >;
}

interface Pusher {
  app_display_name: string;
  app_id: string;
  data: {
    url?: string;
    format: string;
  };
  url: string;
  format: string;
  device_display_name: string;
  profile_tag: string;
  kind: string;
  lang: string;
  pushkey: string;
}

interface UserMedia {
  created_ts: number;
  last_access_ts?: number;
  media_id: string;
  media_length: number;
  media_type: string;
  quarantined_by?: string;
  safe_from_quarantine: boolean;
  upload_name?: string;
}

interface UserMediaStatistic {
  displayname: string;
  media_count: number;
  media_length: number;
  user_id: string;
}

interface RegistrationToken {
  token: string;
  uses_allowed: number;
  pending: number;
  completed: number;
  expiry_time?: number;
}

interface RaServerNotice {
  id: string;
  body: string;
}

interface Destination {
  destination: string;
  retry_last_ts: number;
  retry_interval: number;
  failure_ts: number;
  last_successful_stream_ordering?: number;
}

interface DestinationRoom {
  room_id: string;
  stream_ordering: number;
}

type JsonObject = Record<string, any>;
type ResourceMapper = (record: any) => RaRecord;
type TotalResolver = (json: JsonObject, from?: number, perPage?: number) => number;
type CreateRequest = (data: any) => {
  body?: JsonObject;
  endpoint: string;
  method: "POST" | "PUT";
};
type DeleteRequest = (params: DeleteParams) => {
  body?: JsonObject;
  endpoint: string;
  method?: "DELETE" | "POST" | "PUT";
};
type ReferenceRequest = (id: Identifier) => {
  endpoint: string;
};

interface ResourceConfigBase {
  create?: CreateRequest;
  data: string;
  delete?: DeleteRequest;
  map: ResourceMapper;
  total?: TotalResolver;
}

interface CollectionResourceConfig extends ResourceConfigBase {
  path: string;
}

interface ReferenceResourceConfig extends ResourceConfigBase {
  reference: ReferenceRequest;
}

interface ActionResourceConfig extends ResourceConfigBase {
  path?: never;
  reference?: never;
}

type ResourceConfig = CollectionResourceConfig | ReferenceResourceConfig | ActionResourceConfig;
type ResourceMap = Record<string, ResourceConfig>;

/** Parameters accepted by the custom bulk media-deletion admin action. */
export interface DeleteMediaParams {
  before_ts: number | string;
  keep_profiles: boolean;
  size_gt: number;
}

/** Result payload returned by Synapse after a bulk media-deletion request. */
export interface DeleteMediaResult {
  deleted_media: Identifier[];
  total: number;
}

/** Synapse-specific extension points layered on top of the standard react-admin data provider. */
export interface SynapseDataProvider extends DataProvider {
  createMany: (resource: string, params: { data: RaRecord; ids: Identifier[] }) => Promise<{ data: unknown[] }>;
  deleteMedia: (params: DeleteMediaParams) => Promise<DeleteMediaResult>;
}

/** Convert Synapse MXC URIs into thumbnail URLs that the admin UI can render directly. */
const mxcUrlToHttp = (mxcUrl: string): string | null => {
  const baseUrl = requireStoredBaseUrl();
  const match = /^mxc:\/\/([^/]+)\/(\w+)/.exec(mxcUrl);

  if (!match) {
    return null;
  }

  const [, serverName, mediaId] = match;
  return buildUrl(baseUrl, `/_matrix/media/r0/thumbnail/${serverName}/${mediaId}?width=24&height=24&method=scale`);
};

// Resource config groups keep the large provider split by domain while preserving one external API.
const userResourceConfigs = {
  users: {
    path: "/_synapse/admin/v2/users",
    map: (user: User) => ({
      ...user,
      id: user.name,
      avatar_src: user.avatar_url ? mxcUrlToHttp(user.avatar_url) : undefined,
      is_guest: !!user.is_guest,
      admin: !!user.admin,
      deactivated: !!user.deactivated,
      creation_ts_ms: user.creation_ts * 1000,
    }),
    data: "users",
    total: json => json.total,
    create: (data: RaRecord) => ({
      endpoint: `/_synapse/admin/v2/users/@${encodeURIComponent(data.id)}:${requireStoredHomeServer()}`,
      body: data,
      method: "PUT",
    }),
    delete: (params: DeleteParams) => ({
      endpoint: `/_synapse/admin/v1/deactivate/${encodeURIComponent(params.id)}`,
      body: { erase: true },
      method: "POST",
    }),
  },
  devices: {
    map: (device: Device) => ({
      ...device,
      id: device.device_id,
    }),
    data: "devices",
    total: json => json.total,
    reference: (id: Identifier) => ({
      endpoint: `/_synapse/admin/v2/users/${encodeURIComponent(id)}/devices`,
    }),
    delete: (params: DeleteParams) => ({
      endpoint: `/_synapse/admin/v2/users/${encodeURIComponent(params.previousData.user_id)}/devices/${params.id}`,
    }),
  },
  connections: {
    path: "/_synapse/admin/v1/whois",
    map: (connection: Whois) => ({
      ...connection,
      id: connection.user_id,
    }),
    data: "connections",
  },
  pushers: {
    map: (pusher: Pusher) => ({
      ...pusher,
      id: pusher.pushkey,
    }),
    reference: (id: Identifier) => ({
      endpoint: `/_synapse/admin/v1/users/${encodeURIComponent(id)}/pushers`,
    }),
    data: "pushers",
    total: json => json.total,
  },
  joined_rooms: {
    map: (roomId: string) => ({
      id: roomId,
    }),
    reference: (id: Identifier) => ({
      endpoint: `/_synapse/admin/v1/users/${encodeURIComponent(id)}/joined_rooms`,
    }),
    data: "joined_rooms",
    total: json => json.total,
  },
  servernotices: {
    map: (notice: { event_id: string }) => ({ id: notice.event_id }),
    create: (data: RaServerNotice) => ({
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
    data: "event_id",
  },
  registration_tokens: {
    path: "/_synapse/admin/v1/registration_tokens",
    map: (token: RegistrationToken) => ({
      ...token,
      id: token.token,
    }),
    data: "registration_tokens",
    total: json => json.registration_tokens.length,
    create: (data: RaRecord) => ({
      endpoint: "/_synapse/admin/v1/registration_tokens/new",
      body: data,
      method: "POST",
    }),
    delete: (params: DeleteParams) => ({
      endpoint: `/_synapse/admin/v1/registration_tokens/${params.id}`,
    }),
  },
} satisfies ResourceMap;

const roomResourceConfigs = {
  rooms: {
    path: "/_synapse/admin/v1/rooms",
    map: (room: Room) => ({
      ...room,
      id: room.room_id,
      alias: room.canonical_alias,
      members: room.joined_members,
      local_members: room.joined_local_members,
      avatar_src: room.avatar_url ? mxcUrlToHttp(room.avatar_url) : undefined,
      is_encrypted: !!room.encryption,
      federatable: !!room.federatable,
      public: !!room.public,
    }),
    data: "rooms",
    total: json => json.total_rooms,
    delete: (params: DeleteParams) => ({
      endpoint: `/_synapse/admin/v2/rooms/${params.id}`,
      body: { block: false },
    }),
  },
  reports: {
    path: "/_synapse/admin/v1/event_reports",
    map: (eventReport: EventReport) => ({ ...eventReport }),
    data: "event_reports",
    total: json => json.total,
  },
  room_members: {
    map: (member: string) => ({
      id: member,
    }),
    reference: (id: Identifier) => ({
      endpoint: `/_synapse/admin/v1/rooms/${id}/members`,
    }),
    data: "members",
    total: json => json.total,
  },
  room_state: {
    map: (roomState: RoomState) => ({
      ...roomState,
      id: roomState.event_id,
    }),
    reference: (id: Identifier) => ({
      endpoint: `/_synapse/admin/v1/rooms/${id}/state`,
    }),
    data: "state",
    total: json => json.state.length,
  },
  forward_extremities: {
    map: (extremity: ForwardExtremity) => ({
      ...extremity,
      id: extremity.event_id,
    }),
    reference: (id: Identifier) => ({
      endpoint: `/_synapse/admin/v1/rooms/${id}/forward_extremities`,
    }),
    data: "results",
    total: json => json.count,
    delete: (params: DeleteParams) => ({
      endpoint: `/_synapse/admin/v1/rooms/${params.id}/forward_extremities`,
    }),
  },
  room_directory: {
    path: "/_matrix/client/r0/publicRooms",
    map: (room: Room) => ({
      ...room,
      id: room.room_id,
      public: !!room.public,
      guest_access: !!room.guest_access,
      avatar_src: room.avatar_url ? mxcUrlToHttp(room.avatar_url) : undefined,
    }),
    data: "chunk",
    total: json => json.total_room_count_estimate,
    create: (data: RaRecord) => ({
      endpoint: `/_matrix/client/r0/directory/list/room/${data.id}`,
      body: { visibility: "public" },
      method: "PUT",
    }),
    delete: (params: DeleteParams) => ({
      endpoint: `/_matrix/client/r0/directory/list/room/${params.id}`,
      body: { visibility: "private" },
      method: "PUT",
    }),
  },
} satisfies ResourceMap;

const mediaResourceConfigs = {
  users_media: {
    map: (media: UserMedia) => ({
      ...media,
      id: media.media_id,
    }),
    reference: (id: Identifier) => ({
      endpoint: `/_synapse/admin/v1/users/${encodeURIComponent(id)}/media`,
    }),
    data: "media",
    total: json => json.total,
    delete: (params: DeleteParams) => ({
      endpoint: `/_synapse/admin/v1/media/${requireStoredHomeServer()}/${params.id}`,
    }),
  },
  protect_media: {
    map: (media: UserMedia) => ({ id: media.media_id }),
    create: (data: UserMedia) => ({
      endpoint: `/_synapse/admin/v1/media/protect/${data.media_id}`,
      method: "POST",
    }),
    delete: (params: DeleteParams) => ({
      endpoint: `/_synapse/admin/v1/media/unprotect/${params.id}`,
      method: "POST",
    }),
    data: "media_id",
  },
  quarantine_media: {
    map: (media: UserMedia) => ({ id: media.media_id }),
    create: (data: UserMedia) => ({
      endpoint: `/_synapse/admin/v1/media/quarantine/${requireStoredHomeServer()}/${data.media_id}`,
      method: "POST",
    }),
    delete: (params: DeleteParams) => ({
      endpoint: `/_synapse/admin/v1/media/unquarantine/${requireStoredHomeServer()}/${params.id}`,
      method: "POST",
    }),
    data: "media_id",
  },
  user_media_statistics: {
    path: "/_synapse/admin/v1/statistics/users/media",
    map: (statistic: UserMediaStatistic) => ({
      ...statistic,
      id: statistic.user_id,
    }),
    data: "users",
    total: json => json.total,
  },
} satisfies ResourceMap;

const federationResourceConfigs = {
  destinations: {
    path: "/_synapse/admin/v1/federation/destinations",
    map: (destination: Destination) => ({
      ...destination,
      id: destination.destination,
    }),
    data: "destinations",
    total: json => json.total,
    delete: (params: DeleteParams) => ({
      endpoint: `/_synapse/admin/v1/federation/destinations/${params.id}/reset_connection`,
      method: "POST",
    }),
  },
  destination_rooms: {
    map: (destinationRoom: DestinationRoom) => ({
      ...destinationRoom,
      id: destinationRoom.room_id,
    }),
    reference: (id: Identifier) => ({
      endpoint: `/_synapse/admin/v1/federation/destinations/${id}/rooms`,
    }),
    data: "rooms",
    total: json => json.total,
  },
} satisfies ResourceMap;

const resourceMap = {
  ...userResourceConfigs,
  ...roomResourceConfigs,
  ...mediaResourceConfigs,
  ...federationResourceConfigs,
} satisfies ResourceMap;

/* eslint-disable  @typescript-eslint/no-explicit-any */
/** Preserve explicit `null` only for `user_type`, which Synapse uses as a reset signal. */
function filterNullValues(key: string, value: any) {
  // Filtering out null properties
  // to reset user_type from user, it must be null
  if (value === null && key !== "user_type") {
    return undefined;
  }
  return value;
}

const hasPath = (resource: ResourceConfig): resource is CollectionResourceConfig => "path" in resource;

const hasReference = (resource: ResourceConfig): resource is ReferenceResourceConfig => "reference" in resource;

const supportsCreate = (resource: ResourceConfig): resource is ResourceConfig & { create: CreateRequest } =>
  typeof resource.create === "function";

const supportsDelete = (resource: ResourceConfig): resource is ResourceConfig & { delete: DeleteRequest } =>
  typeof resource.delete === "function";

const isJsonArray = (value: unknown): value is unknown[] => Array.isArray(value);

const getSearchOrder = (order: "ASC" | "DESC") => (order === "DESC" ? "b" : "f");

/** Resolve a resource config once so provider methods can fail fast on unsupported resources. */
const getResourceConfig = (resourceName: string): ResourceConfig => {
  const config = resourceMap[resourceName];

  if (!config) {
    throw new Error(`Unknown resource: ${resourceName}`);
  }

  return config;
};

/** Narrow a resource to collection semantics like `getList`, `getOne`, or `update`. */
const getCollectionResource = (resourceName: string): CollectionResourceConfig => {
  const config = getResourceConfig(resourceName);

  if (!hasPath(config)) {
    throw new Error(`Resource ${resourceName} does not support collection requests`);
  }

  return config;
};

/** Narrow a resource to reference semantics used by nested react-admin lists. */
const getReferenceResource = (resourceName: string): ReferenceResourceConfig => {
  const config = getResourceConfig(resourceName);

  if (!hasReference(config)) {
    throw new Error(`Resource ${resourceName} does not support reference requests`);
  }

  return config;
};

/** Calculate `total` from explicit resource metadata or fall back to array length. */
const getResourceTotal = (config: ResourceConfig, json: JsonObject, from?: number, perPage?: number): number => {
  if (typeof config.total === "function") {
    return config.total(json, from, perPage);
  }

  const data = json[config.data];
  return isJsonArray(data) ? data.length : 0;
};

/** Map the array payload selected by a resource config into react-admin records. */
const mapResourceData = (config: ResourceConfig, json: JsonObject): RaRecord[] => {
  const data = json[config.data];
  return isJsonArray(data) ? data.map(item => config.map(item)) : [];
};

/** Build a list endpoint URL including pagination, filtering, and sort query parameters. */
const buildCollectionUrl = (resourceName: string, query?: Record<string, unknown>): string => {
  const config = getCollectionResource(resourceName);
  const endpointUrl = buildUrl(requireStoredBaseUrl(), config.path);

  if (!query) {
    return endpointUrl;
  }

  const search = stringify(query);
  return search ? `${endpointUrl}?${search}` : endpointUrl;
};

/** Build a reference endpoint URL for nested resources like devices or room members. */
const buildReferenceUrl = (resourceName: string, id: Identifier, query?: Record<string, unknown>): string => {
  const config = getReferenceResource(resourceName);
  const endpointUrl = buildUrl(requireStoredBaseUrl(), config.reference(id).endpoint);

  if (!query) {
    return endpointUrl;
  }

  const search = stringify(query);
  return search ? `${endpointUrl}?${search}` : endpointUrl;
};

/** Fetch a single collection-backed record and normalize it through the resource mapper. */
const fetchResourceRecord = async (resourceName: string, id: Identifier) => {
  const config = getCollectionResource(resourceName);
  const { json } = await fetchJsonFromAbsoluteUrl(buildUrl(requireStoredBaseUrl(), `${config.path}/${encodeURIComponent(id)}`));
  return config.map(json);
};

/** Execute a resource-specific create request while keeping provider method bodies small. */
const createResource = async (resourceName: string, data: Partial<RaRecord>) => {
  const config = getResourceConfig(resourceName);

  if (!supportsCreate(config)) {
    throw new Error(`Create ${resourceName} is not allowed`);
  }

  const request = config.create(data);
  const { json } = await fetchJsonFromAbsoluteUrl(buildUrl(requireStoredBaseUrl(), request.endpoint), {
    method: request.method,
    body: JSON.stringify(request.body, filterNullValues),
  });

  return { data: config.map(json) };
};

/** Execute either custom deletion logic or the default REST-style delete request. */
const deleteResource = async (resourceName: string, params: DeleteParams) => {
  const config = getResourceConfig(resourceName);

  if (supportsDelete(config)) {
    const request = config.delete(params);
    const { json } = await fetchJsonFromAbsoluteUrl(buildUrl(requireStoredBaseUrl(), request.endpoint), {
      method: request.method ?? "DELETE",
      body: request.body ? JSON.stringify(request.body) : null,
    });

    return { data: json };
  }

  const collectionConfig = getCollectionResource(resourceName);
  const { json } = await fetchJsonFromAbsoluteUrl(
    buildUrl(requireStoredBaseUrl(), `${collectionConfig.path}/${params.id}`),
    {
      method: "DELETE",
      body: JSON.stringify(params.previousData, filterNullValues),
    }
  );

  return { data: json };
};

/** Custom provider method used by the media maintenance UI. */
const deleteMedia = async ({
  before_ts,
  size_gt = 0,
  keep_profiles = true,
}: DeleteMediaParams): Promise<DeleteMediaResult> => {
  const endpoint =
    `/_synapse/admin/v1/media/${requireStoredHomeServer()}/delete` +
    `?before_ts=${before_ts}&size_gt=${size_gt}&keep_profiles=${keep_profiles}`;

  const { json } = await fetchJsonFromAbsoluteUrl(buildUrl(requireStoredBaseUrl(), endpoint), { method: "POST" });
  return json as DeleteMediaResult;
};

/** Main react-admin data provider plus Synapse-specific helper methods. */
const dataProvider = {
  getList: async (resource, params) => {
    const { user_id, name, guests, deactivated, locked, search_term, destination, valid } = params.filter;
    const { page, perPage } = params.pagination as PaginationPayload;
    const { field, order } = params.sort as SortPayload;
    const from = (page - 1) * perPage;
    const query = {
      from,
      limit: perPage,
      user_id,
      search_term,
      name,
      destination,
      guests,
      deactivated,
      locked,
      valid,
      order_by: field,
      dir: getSearchOrder(order),
    };

    const config = getCollectionResource(resource);
    const { json } = await fetchJsonFromAbsoluteUrl(buildCollectionUrl(resource, query));

    return {
      data: mapResourceData(config, json),
      total: getResourceTotal(config, json, from, perPage),
    };
  },

  getOne: async (resource, params) => ({
    data: await fetchResourceRecord(resource, params.id),
  }),

  getMany: async (resource, params) => {
    const responses = await Promise.all(params.ids.map(id => fetchResourceRecord(resource, id)));

    return {
      data: responses,
      total: responses.length,
    };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const from = (page - 1) * perPage;
    const query = {
      from,
      limit: perPage,
      order_by: field,
      dir: getSearchOrder(order),
    };

    const config = getReferenceResource(resource);
    const { json } = await fetchJsonFromAbsoluteUrl(buildReferenceUrl(resource, params.id, query));

    return {
      data: mapResourceData(config, json),
      total: getResourceTotal(config, json, from, perPage),
    };
  },

  update: async (resource, params) => {
    const config = getCollectionResource(resource);
    const { json } = await fetchJsonFromAbsoluteUrl(
      buildUrl(requireStoredBaseUrl(), `${config.path}/${encodeURIComponent(params.id)}`),
      {
        method: "PUT",
        body: JSON.stringify(params.data, filterNullValues),
      }
    );

    return { data: config.map(json) };
  },

  updateMany: async (resource, params) => {
    const config = getCollectionResource(resource);
    const responses = await Promise.all(
      params.ids.map(id =>
        fetchJsonFromAbsoluteUrl(buildUrl(requireStoredBaseUrl(), `${config.path}/${encodeURIComponent(id)}`), {
          method: "PUT",
          body: JSON.stringify(params.data, filterNullValues),
        })
      )
    );

    return { data: responses.map(({ json }) => json) };
  },

  create: async (resource, params) => createResource(resource, params.data),

  createMany: async (resource: string, params: { data: RaRecord; ids: Identifier[] }) => {
    const config = getResourceConfig(resource);

    if (!supportsCreate(config)) {
      throw new Error(`Create ${resource} is not allowed`);
    }

    const responses = await Promise.all(
      params.ids.map(id => {
        const request = config.create({ ...params.data, id });
        return fetchJsonFromAbsoluteUrl(buildUrl(requireStoredBaseUrl(), request.endpoint), {
          method: request.method,
          body: JSON.stringify(request.body, filterNullValues),
        });
      })
    );

    return { data: responses.map(({ json }) => json) };
  },

  delete: async (resource, params) => deleteResource(resource, params),

  deleteMany: async (resource, params) => {
    const config = getResourceConfig(resource);

    if (supportsDelete(config)) {
      const responses = await Promise.all(
        params.ids.map(id => {
          const request = config.delete({ ...params, id });
          return fetchJsonFromAbsoluteUrl(buildUrl(requireStoredBaseUrl(), request.endpoint), {
            method: request.method ?? "DELETE",
            body: request.body ? JSON.stringify(request.body) : null,
          });
        })
      );

      return {
        data: responses.map(({ json }) => json),
      };
    }

    const collectionConfig = getCollectionResource(resource);
    const responses = await Promise.all(
      params.ids.map(id =>
        fetchJsonFromAbsoluteUrl(buildUrl(requireStoredBaseUrl(), `${collectionConfig.path}/${id}`), {
          method: "DELETE",
        })
      )
    );

    return { data: responses.map(({ json }) => json) };
  },

  deleteMedia,
} as SynapseDataProvider;

export default dataProvider;
