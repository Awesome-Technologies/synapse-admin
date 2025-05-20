import React, { useCallback } from "react";
import { SaveButton, useCreate, useRedirect, useNotify } from "react-admin";

const localPart = mxid => {
  const parts = mxid.split(":");
  return parts.length > 1 ? parts[0].slice(1) : mxid;
}

const SaveQrButton = props => {
  // Create and update is the same for users, so we can always use create
  const [create] = useCreate("users");
  const redirectTo = useRedirect();
  const notify = useNotify();
  const { basePath } = props;

  const handleSave = useCallback(
    (values) => {
      create(
        {
          payload: { data: { ...values, id: localPart(values.id) } },
        },
        {
          onSuccess: ({ data: newRecord }) => {
            notify("ra.notification.created", "info", {
              smart_count: 1,
            });
            redirectTo("/showPdf", basePath, newRecord.id, {}, {
              password: values.password,
              ...newRecord,
            });
          },
        }
      );
    },
    [create, notify, redirectTo, basePath]
  );

  return <SaveButton {...props} onSave={handleSave} />;
};

export default SaveQrButton;
