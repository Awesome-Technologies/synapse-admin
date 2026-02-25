import { get } from "lodash";

import { Avatar } from "@mui/material";
import { useRecordContext } from "react-admin";
import { useEffect, useRef, useState } from "react";

const AvatarField = ({ source, ...rest }) => {
  const record = useRecordContext(rest);
  const _src = get(record, source);
  const { alt, classes, sizes, sx, variant } = rest;

  const [src, setSrc] = useState('');
  useEffect(() => {
    (async () => {
      const raw = await _src;
      if(!raw)
        return;

      if(typeof raw === 'string'){
        setSrc(raw);
      } else { // Blob
        const url = window.URL.createObjectURL(raw);
        setSrc(url);
      }
    })();
  }, [_src]);
  return <Avatar alt={alt} classes={classes} sizes={sizes} src={src} sx={sx} variant={variant} />;
};

export default AvatarField;
