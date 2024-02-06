import React, { useState, useEffect } from "react";
import {
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
import { useFormContext } from "react-hook-form";
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
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LockIcon from "@mui/icons-material/Lock";
import {
  getServerVersion,
  getSupportedLoginFlows,
  getWellKnownUrl,
  isValidBaseUrl,
  splitMxid,
} from "../synapse/synapse";

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
    backgroundColor: theme.palette.grey[500],
  },
  [`& .hint`]: {
    marginTop: "1em",
    display: "flex",
    justifyContent: "center",
    color: theme.palette.grey[600],
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
    color: theme.palette.grey[500],
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    marginBottom: "1em",
    marginLeft: "0.5em",
  },
}));

const LoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const [supportPassAuth, setSupportPassAuth] = useState(true);
  const [locale, setLocale] = useLocaleState();
  const translate = useTranslate();
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

  const UserData = ({ formData }) => {
    const form = useFormContext();
    const [serverVersion, setServerVersion] = useState("");

    const handleUsernameChange = _ => {
      if (formData.base_url || cfg_base_url) return;
      // check if username is a full qualified userId then set base_url accordingly
      const domain = splitMxid(formData.username)?.domain;
      if (domain) {
        getWellKnownUrl(domain).then(url => form.setValue("base_url", url));
      }
    };

    useEffect(() => {
      if (!isValidBaseUrl(formData.base_url)) return;

      getServerVersion(formData.base_url)
        .then(serverVersion =>
          setServerVersion(
            `${translate("synapseadmin.auth.server_version")} ${serverVersion}`
          )
        )
        .catch(() => setServerVersion(""));

      // Set SSO Url
      getSupportedLoginFlows(formData.base_url)
        .then(loginFlows => {
          const supportPass =
            loginFlows.find(f => f.type === "m.login.password") !== undefined;
          const supportSSO =
            loginFlows.find(f => f.type === "m.login.sso") !== undefined;
          setSupportPassAuth(supportPass);
          setSSOBaseUrl(supportSSO ? formData.base_url : "");
        })
        .catch(() => setSSOBaseUrl(""));
    }, [formData.base_url]);

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
        <Typography className="serverVersion">{serverVersion}</Typography>
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
            {loading ? (
              <CircularProgress size={25} thickness={2} />
            ) : (
              <Avatar className="icon">
                <LockIcon />
              </Avatar>
            )}
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
                {translate("ra.auth.sign_in")}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSSO}
                disabled={loading || ssoBaseUrl === ""}
                fullWidth
              >
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
