import React, { useState, useEffect } from "react";
import {
  fetchUtils,
  FormDataConsumer,
  Notification,
  useLogin,
  useNotify,
  useLocale,
  useSetLocale,
  useTranslate,
  PasswordInput,
  TextInput,
} from "react-admin";
import { Form, useForm } from "react-final-form";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LockIcon from "@material-ui/icons/Lock";

const useStyles = makeStyles(theme => ({
  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 1em)",
    alignItems: "center",
    justifyContent: "flex-start",
    background: "url(./images/floating-cogs.svg)",
    backgroundColor: "#f9f9f9",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
  card: {
    minWidth: "30em",
    marginTop: "6em",
    marginBottom: "6em",
  },
  avatar: {
    margin: "1em",
    display: "flex",
    justifyContent: "center",
  },
  icon: {
    backgroundColor: theme.palette.secondary.main,
  },
  hint: {
    marginTop: "1em",
    display: "flex",
    justifyContent: "center",
    color: theme.palette.grey[500],
  },
  form: {
    padding: "0 1em 1em 1em",
  },
  input: {
    marginTop: "1em",
  },
  actions: {
    padding: "0 1em 1em 1em",
  },
  serverVersion: {
    color: "#9e9e9e",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    marginBottom: "1em",
    marginLeft: "0.5em",
  },
}));

const LoginPage = ({ theme }) => {
  const classes = useStyles({ theme });
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  var locale = useLocale();
  const setLocale = useSetLocale();
  const translate = useTranslate();
  const base_url = localStorage.getItem("base_url");
  const cfg_base_url = process.env.REACT_APP_SERVER;

  const renderInput = ({
    meta: { touched, error } = {},
    input: { ...inputProps },
    ...props
  }) => (
    <TextField
      error={!!(touched && error)}
      helperText={touched && error}
      {...inputProps}
      {...props}
      fullWidth
    />
  );

  const validate = values => {
    const errors = {};
    if (!values.username) {
      errors.username = translate("ra.validation.required");
    }
    if (!values.password) {
      errors.password = translate("ra.validation.required");
    }
    if (!values.base_url) {
      errors.base_url = translate("ra.validation.required");
    } else {
      if (!values.base_url.match(/^(http|https):\/\//)) {
        errors.base_url = translate("synapseadmin.auth.protocol_error");
      } else if (
        !values.base_url.match(
          /^(http|https):\/\/[a-zA-Z0-9\-.]+(:\d{1,5})?[^?&\s]*$/
        )
      ) {
        errors.base_url = translate("synapseadmin.auth.url_error");
      }
    }
    return errors;
  };

  const handleSubmit = auth => {
    setLoading(true);
    login(auth).catch(error => {
      setLoading(false);
      notify(
        typeof error === "string"
          ? error
          : typeof error === "undefined" || !error.message
          ? "ra.auth.sign_in_error"
          : error.message,
        "warning"
      );
    });
  };

  const extractHomeServer = username => {
    const usernameRegex = /@[a-zA-Z0-9._=\-/]+:([a-zA-Z0-9\-.]+\.[a-zA-Z]+)/;
    if (!username) return null;
    const res = username.match(usernameRegex);
    if (res) return res[1];
    return null;
  };

  const UserData = ({ formData }) => {
    const form = useForm();
    const [serverVersion, setServerVersion] = useState("");

    const handleUsernameChange = _ => {
      if (formData.base_url || cfg_base_url) return;
      // check if username is a full qualified userId then set base_url accordially
      const home_server = extractHomeServer(formData.username);
      const wellKnownUrl = `https://${home_server}/.well-known/matrix/client`;
      if (home_server) {
        // fetch .well-known entry to get base_url
        fetchUtils
          .fetchJson(wellKnownUrl, { method: "GET" })
          .then(({ json }) => {
            form.change("base_url", json["m.homeserver"].base_url);
          })
          .catch(_ => {
            // if there is no .well-known entry, try the home server name
            form.change("base_url", `https://${home_server}`);
          });
      }
    };

    useEffect(
      _ => {
        if (
          !formData.base_url ||
          !formData.base_url.match(/^(http|https):\/\/[a-zA-Z0-9\-.]+$/)
        )
          return;
        const versionUrl = `${formData.base_url}/_synapse/admin/v1/server_version`;
        fetchUtils
          .fetchJson(versionUrl, { method: "GET" })
          .then(({ json }) => {
            setServerVersion(
              `${translate("synapseadmin.auth.server_version")} ${
                json["server_version"]
              }`
            );
          })
          .catch(_ => {
            setServerVersion("");
          });
      },
      [formData.base_url]
    );

    return (
      <div>
        <div className={classes.input}>
          <TextInput
            autoFocus
            name="username"
            component={renderInput}
            label={translate("ra.auth.username")}
            disabled={loading}
            onBlur={handleUsernameChange}
            resettable
            fullWidth
          />
        </div>
        <div className={classes.input}>
          <PasswordInput
            name="password"
            component={renderInput}
            label={translate("ra.auth.password")}
            type="password"
            disabled={loading}
            resettable
            fullWidth
          />
        </div>
        <div className={classes.input}>
          <TextInput
            name="base_url"
            component={renderInput}
            label={translate("synapseadmin.auth.base_url")}
            disabled={cfg_base_url || loading}
            resettable
            fullWidth
          />
        </div>
        <div className={classes.serverVersion}>{serverVersion}</div>
      </div>
    );
  };

  return (
    <Form
      initialValues={{ base_url: cfg_base_url || base_url }}
      onSubmit={handleSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit} noValidate>
          <div className={classes.main}>
            <Card className={classes.card}>
              <div className={classes.avatar}>
                <Avatar className={classes.icon}>
                  <LockIcon />
                </Avatar>
              </div>
              <div className={classes.hint}>
                {translate("synapseadmin.auth.welcome")}
              </div>
              <div className={classes.form}>
                <div className={classes.input}>
                  <Select
                    value={locale}
                    onChange={e => {
                      setLocale(e.target.value);
                    }}
                    fullWidth
                    disabled={loading}
                  >
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="zh">简体中文</MenuItem>
                  </Select>
                </div>
                <FormDataConsumer>
                  {formDataProps => <UserData {...formDataProps} />}
                </FormDataConsumer>
              </div>
              <CardActions className={classes.actions}>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                  disabled={loading}
                  className={classes.button}
                  fullWidth
                >
                  {loading && <CircularProgress size={25} thickness={2} />}
                  {translate("ra.auth.sign_in")}
                </Button>
              </CardActions>
            </Card>
            <Notification />
          </div>
        </form>
      )}
    />
  );
};

export default LoginPage;
