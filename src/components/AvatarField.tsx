import { get } from "lodash";
import { Avatar, AvatarProps } from "@mui/material";
import { useRecordContext } from "react-admin";
import { useState, useEffect, useCallback } from "react";
import { fetchAuthenticatedMedia } from "../utils/fetchMedia";

const AvatarField = ({ source, ...rest }: AvatarProps & { source: string, label?: string }) => {
  const { alt, classes, sizes, sx, variant } = rest;

  const record = useRecordContext(rest);
  const mxcURL = get(record, source)?.toString();

  const [src, setSrc] = useState<string>("");

  const fetchAvatar = useCallback(async (mxcURL: string) => {
    const response = await fetchAuthenticatedMedia(mxcURL, "thumbnail");
    const blob = await response.blob();
    const blobURL = URL.createObjectURL(blob);
    setSrc(blobURL);
  }, []);

  useEffect(() => {
    if (mxcURL) {
      fetchAvatar(mxcURL);
    }

    // Cleanup function to revoke the object URL
    return () => {
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [mxcURL, fetchAvatar]);

  return <Avatar alt={alt} classes={classes} sizes={sizes} src={src} sx={sx} variant={variant} />;
};

export default AvatarField;
