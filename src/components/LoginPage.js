import React, { useState, useEffect } from "react";
import {
  fetchUtils,
  Form,
  FormDataConsumer,
  Notification,
  required,
  useLogin,
  useNotify,
  useLocaleState,
  useTranslate,
  PasswordInput,
  TextInput,
} from "react-admin";
import { useForm } from "react-hook-form";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LockIcon from "@mui/icons-material/Lock";

const FormBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "calc(100vh - 1em)",
  alignItems: "center",
  justifyContent: "flex-start",
  background: "url(./images/floating-cogs.svg)",
  backgroundColor: "#f9f9f9",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",

  [`& .card`]: {
    minWidth: "30em",
    marginTop: "6em",
    marginBottom: "6em",
  },
  [`& .avatar`]: {
    margin: "1em",
    display: "flex",
    justifyContent: "center",
  },
  [`& .icon`]: {
    backgroundColor: theme.palette.grey[400],
  },
  [`& .hint`]: {
    marginTop: "1em",
    display: "flex",
    justifyContent: "center",
    color: theme.palette.grey[500],
  },
  [`& .form`]: {
    padding: "0 1em 1em 1em",
  },
  [`& .input`]: {
    marginTop: "1em",
  },
  [`& .actions`]: {
    padding: "0 1em 1em 1em",
  },
  [`& .serverVersion`]: {
    color: "#9e9e9e",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    marginBottom: "1em",
    marginLeft: "0.5em",
  },
}));

const LoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();
  const [loading, setLoading] = useState(false);
  const [supportPassAuth, setSupportPassAuth] = useState(true);
  const [locale, setLocale] = useLocaleState();
  const base_url = localStorage.getItem("base_url");
  const cfg_base_url = process.env.REACT_APP_SERVER;
  const [ssoBaseUrl, setSSOBaseUrl] = useState("");
  const loginToken = /\?loginToken=([a-zA-Z0-9_-]+)/.exec(window.location.href);

  if (loginToken) {
    const ssoToken = loginToken[1];
    console.log("SSO token is", ssoToken);
    // Prevent further requests
    window.history.replaceState(
      {},
      "",
      window.location.href.replace(loginToken[0], "#").split("#")[0]
    );
    const baseUrl = localStorage.getItem("sso_base_url");
    localStorage.removeItem("sso_base_url");
    if (baseUrl) {
      const auth = {
        base_url: baseUrl,
        username: null,
        password: null,
        loginToken: ssoToken,
      };
      console.log("Base URL is:", baseUrl);
      console.log("SSO Token is:", ssoToken);
      console.log("Let's try token login...");
      login(auth).catch(error => {
        alert(
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
            ? "ra.auth.sign_in_error"
            : error.message
        );
        console.error(error);
      });
    }
  }

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

  const validateBaseUrl = value => {
    if (!value.match(/^(http|https):\/\//)) {
      return translate("synapseadmin.auth.protocol_error");
    } else if (
      !value.match(/^(http|https):\/\/[a-zA-Z0-9\-.]+(:\d{1,5})?[^?&\s]*$/)
    ) {
      return translate("synapseadmin.auth.url_error");
    } else {
      return undefined;
    }
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
        { type: "warning" }
      );
    });
  };

  const handleSSO = () => {
    localStorage.setItem("sso_base_url", ssoBaseUrl);
    const ssoFullUrl = `${ssoBaseUrl}/_matrix/client/r0/login/sso/redirect?redirectUrl=${encodeURIComponent(
      window.location.href
    )}`;
    window.location.href = ssoFullUrl;
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
          !formData.base_url.match(
            /^(http|https):\/\/[a-zA-Z0-9\-.]+(:\d{1,5})?$/
          )
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

        // Set SSO Url
        const authMethodUrl = `${formData.base_url}/_matrix/client/r0/login`;
        let supportPass = false,
          supportSSO = false;
        fetchUtils
          .fetchJson(authMethodUrl, { method: "GET" })
          .then(({ json }) => {
            json.flows.forEach(f => {
              if (f.type === "m.login.password") {
                supportPass = true;
              } else if (f.type === "m.login.sso") {
                supportSSO = true;
              }
            });
            setSupportPassAuth(supportPass);
            if (supportSSO) {
              setSSOBaseUrl(formData.base_url);
            } else {
              setSSOBaseUrl("");
            }
          })
          .catch(_ => {
            setSSOBaseUrl("");
          });
      },
      [formData.base_url]
    );

    return (
      <>
        <Box>
          <TextInput
            autoFocus
            name="username"
            component={renderInput}
            label="ra.auth.username"
            disabled={loading || !supportPassAuth}
            onBlur={handleUsernameChange}
            resettable
            fullWidth
            className="input"
            validate={required()}
          />
        </Box>
        <Box>
          <PasswordInput
            name="password"
            component={renderInput}
            label="ra.auth.password"
            type="password"
            disabled={loading || !supportPassAuth}
            resettable
            fullWidth
            className="input"
            validate={required()}
          />
        </Box>
        <Box>
          <TextInput
            name="base_url"
            component={renderInput}
            label="synapseadmin.auth.base_url"
            disabled={cfg_base_url || loading}
            resettable
            fullWidth
            className="input"
            validate={[required(), validateBaseUrl]}
          />
        </Box>
        <Box className="serverVersion">{serverVersion}</Box>
      </>
    );
  };

  return (
    <Form
      defaultValues={{ base_url: cfg_base_url || base_url }}
      onSubmit={handleSubmit}
      mode="onTouched"
    >
      <FormBox>
        <Card className="card">
          <Box className="avatar">
            <Avatar className="icon">
              <LockIcon />
            </Avatar>
          </Box>
          <Box className="hint">{translate("synapseadmin.auth.welcome")}</Box>
          <Box className="form">
            <Select
              value={locale}
              onChange={e => {
                setLocale(e.target.value);
              }}
              fullWidth
              disabled={loading}
              className="input"
            >
              <MenuItem value="de">Deutsch</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="it">Italiano</MenuItem>
              <MenuItem value="zh">简体中文</MenuItem>
            </Select>
            <FormDataConsumer>
              {formDataProps => <UserData {...formDataProps} />}
            </FormDataConsumer>
            <CardActions className="actions">
              <Button
                variant="contained"
                type="submit"
                color="primary"
                disabled={loading || !supportPassAuth}
                fullWidth
              >
                {loading && <CircularProgress size={25} thickness={2} />}
                {translate("ra.auth.sign_in")}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSSO}
                disabled={loading || ssoBaseUrl === ""}
                fullWidth
              >
                {loading && <CircularProgress size={25} thickness={2} />}
                {translate("synapseadmin.auth.sso_sign_in")}
              </Button>
            </CardActions>
          </Box>
        </Card>
      </FormBox>
      <Notification />
    </Form>
  );
};

export default LoginPage;
