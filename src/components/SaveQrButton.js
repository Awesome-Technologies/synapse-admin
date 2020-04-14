import React, { useCallback } from "react";
import { SaveButton, useCreate, useRedirect, useNotify } from "react-admin";

const SaveQrButton = props => {
  const [create] = useCreate('users');
  const redirectTo = useRedirect();
  const notify = useNotify();
  const { basePath } = props;

  const handleSave = useCallback(
    (values, redirect) => {
      create(
        {
          payload: { data: { ...values } },
        },
        {
          onSuccess: ({ data: newRecord }) => {
            notify('ra.notification.created', 'info', {
              smart_count: 1,
            });
            redirectTo(redirect, basePath, newRecord.id, { password: values.password, ...newRecord });
          },
        }
      );
    },
    [create, notify, redirectTo, basePath]
  );

  return <SaveButton {...props} onSave={handleSave} />;
};

export default SaveQrButton;
