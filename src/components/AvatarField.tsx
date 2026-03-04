import { get } from "lodash";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@mui/material";
import { useRecordContext } from "react-admin";

import { fetchWithAuth } from "../synapse/synapse";
import storage from "../storage";

const AvatarField = ({ source, ...rest }) => {
  const record = useRecordContext(rest);
  const src = get(record, source)?.toString();
  const [imgSrc, setImgSrc] = useState(src ?? "");
  const blobUrlRef = useRef<string | null>(null);
  const { alt, classes, sizes, sx, variant } = rest;

  useEffect(() => {
    if (!src) {
      setImgSrc("");
      return;
    }
    const token = storage.getItem("access_token");
    if (!token) {
      setImgSrc(src);
      return;
    }
    let cancelled = false;
    fetchWithAuth(src)
      .then(res => (res.ok ? res.blob() : Promise.reject(new Error("Failed to load"))))
      .then(blob => {
        if (cancelled) return;
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = URL.createObjectURL(blob);
        setImgSrc(blobUrlRef.current);
      })
      .catch(() => {
        if (!cancelled) setImgSrc(src);
      });
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src]);

  const displaySrc = imgSrc || src;
  return <Avatar alt={alt} classes={classes} sizes={sizes} src={displaySrc} sx={sx} variant={variant} />;
};

export default AvatarField;
