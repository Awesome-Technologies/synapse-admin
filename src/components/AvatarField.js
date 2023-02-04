import React from "react";
import get from "lodash/get";
import { Avatar } from "@mui/material";
import { useRecordContext } from "react-admin";

const AvatarField = ({ source, ...rest }) => {
  const record = useRecordContext(rest);
  const src = get(record, source)?.toString();
  return <Avatar src={src} {...rest} />;
};

export default AvatarField;
