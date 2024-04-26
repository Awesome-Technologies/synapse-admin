import { get } from "lodash";

import { Avatar, AvatarProps } from "@mui/material";
import { useRecordContext } from "react-admin";

const AvatarField = ({ source, ...rest }: AvatarProps & { source: string }) => {
  const record = useRecordContext(rest);
  const src = get(record, source, "") as string;
  const { alt, classes, sizes, sx, variant } = rest;
  return <Avatar alt={alt} classes={classes} sizes={sizes} src={src} sx={sx} variant={variant} />;
};

export default AvatarField;
