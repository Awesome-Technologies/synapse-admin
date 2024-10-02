import storage from "../storage";

export const getServerAndMediaIdFromMxcUrl = (mxcUrl: string): { serverName: string, mediaId: string } => {
    const re = /^mxc:\/\/([^/]+)\/(\w+)/;
    const ret = re.exec(mxcUrl);
    console.log("mxcClient " + ret);
    if (ret == null) {
      throw new Error("Invalid mxcUrl");
    }
    const serverName = ret[1];
    const mediaId = ret[2];
    return { serverName, mediaId };
};

export type MediaType = "thumbnail" | "original";

export const fetchAuthenticatedMedia = async (mxcUrl: string, type: MediaType): Promise<Response> => {
  const homeserver = storage.getItem("base_url");
  const accessToken = storage.getItem("access_token");

  const { serverName, mediaId } = getServerAndMediaIdFromMxcUrl(mxcUrl);
  if (!serverName || !mediaId) {
    throw new Error("Invalid mxcUrl");
  }

  let url = "";
  if (type === "thumbnail") {
    // ref: https://spec.matrix.org/latest/client-server-api/#thumbnails
    url = `${homeserver}/_matrix/client/v1/media/thumbnail/${serverName}/${mediaId}?width=320&height=240&method=scale`;
  } else if (type === "original") {
    url = `${homeserver}/_matrix/client/v1/media/download/${serverName}/${mediaId}`;
  } else {
    throw new Error("Invalid authenticated media type");
  }

  const response = await fetch(`${url}`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
};