import { useState, useEffect } from "react";

import LockIcon from "@mui/icons-material/Lock";
import { Avatar, Box, Button, Card, CardActions, CircularProgress, MenuItem, Select, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
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
  useLocales,
} from "react-admin";
import { useFormContext } from "react-hook-form";

import { useAppContext } from "../AppContext";
import {
  getServerVersion,
  getSupportedFeatures,
  getSupportedLoginFlows,
  getWellKnownUrl,
  isValidBaseUrl,
  splitMxid,
} from "../synapse/synapse";
import storage from "../storage";

const FormBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "calc(100vh - 1rem)",
  alignItems: "center",
  justifyContent: "flex-start",
  background: "url(./images/floating-cogs.svg)",
  backgroundColor: "#f9f9f9",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",

  [`& .card`]: {
    width: "30rem",
    marginTop: "6rem",
    marginBottom: "6rem",
  },
  [`& .avatar`]: {
    margin: "1rem",
    display: "flex",
    justifyContent: "center",
  },
  [`& .icon`]: {
    backgroundColor: theme.palette.grey[500],
  },
  [`& .hint`]: {
    marginTop: "1em",
    marginBottom: "1em",
    display: "flex",
    justifyContent: "center",
    color: theme.palette.grey[600],
  },
  [`& .form`]: {
    padding: "0 1rem 1rem 1rem",
  },
  [`& .select`]: {
    marginBottom: "2rem",
  },
  [`& .actions`]: {
    padding: "0 1rem 1rem 1rem",
  },
  [`& .serverVersion`]: {
    color: theme.palette.grey[500],
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    marginLeft: "0.5rem",
  },
  [`& .matrixVersions`]: {
    color: theme.palette.grey[500],
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontSize: "0.8rem",
    marginBottom: "1rem",
    marginLeft: "0.5rem",
  },
}));

const LoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const { restrictBaseUrl } = useAppContext();
  const allowSingleBaseUrl = typeof restrictBaseUrl === "string";
  const allowMultipleBaseUrls = Array.isArray(restrictBaseUrl);
  const allowAnyBaseUrl = !(allowSingleBaseUrl || allowMultipleBaseUrls);
  const [loading, setLoading] = useState(false);
  const [supportPassAuth, setSupportPassAuth] = useState(true);
  const [locale, setLocale] = useLocaleState();
  const locales = useLocales();
  const translate = useTranslate();
  const base_url = allowSingleBaseUrl ? restrictBaseUrl : storage.getItem("base_url");
  const [ssoBaseUrl, setSSOBaseUrl] = useState("");
  const loginToken = /\?loginToken=([a-zA-Z0-9_-]+)/.exec(window.location.href);

  if (loginToken) {
    const ssoToken = loginToken[1];
    console.log("SSO token is", ssoToken);
    // Prevent further requests
    window.history.replaceState({}, "", window.location.href.replace(loginToken[0], "#").split("#")[0]);
    const baseUrl = storage.getItem("sso_base_url");
    storage.removeItem("sso_base_url");
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

  const validateBaseUrl = value => {
    if (!value.match(/^(http|https):\/\//)) {
      return translate("synapseadmin.auth.protocol_error");
    } else if (!value.match(/^(http|https):\/\/[a-zA-Z0-9\-.]+(:\d{1,5})?[^?&\s]*$/)) {
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
    storage.setItem("sso_base_url", ssoBaseUrl);
    const ssoFullUrl = `${ssoBaseUrl}/_matrix/client/r0/login/sso/redirect?redirectUrl=${encodeURIComponent(
      window.location.href
    )}`;
    window.location.href = ssoFullUrl;
  };

  const UserData = ({ formData }) => {
    const form = useFormContext();
    const [serverVersion, setServerVersion] = useState("");
    const [matrixVersions, setMatrixVersions] = useState("");

    const handleUsernameChange = () => {
      if (formData.base_url || allowSingleBaseUrl) return;
      // check if username is a full qualified userId then set base_url accordingly
      const domain = splitMxid(formData.username)?.domain;
      if (domain) {
        getWellKnownUrl(domain).then(url => {
          if (allowAnyBaseUrl || (allowMultipleBaseUrls && restrictBaseUrl.includes(url)))
            form.setValue("base_url", url);
        });
      }
    };

    useEffect(() => {
      if (formData.base_url === "" && allowMultipleBaseUrls) {
        form.setValue("base_url", restrictBaseUrl[0]);
      }
      if (!isValidBaseUrl(formData.base_url)) return;

      getServerVersion(formData.base_url)
        .then(serverVersion => setServerVersion(`${translate("synapseadmin.auth.server_version")} ${serverVersion}`))
        .catch(() => setServerVersion(""));

      getSupportedFeatures(formData.base_url)
        .then(features =>
          setMatrixVersions(`${translate("synapseadmin.auth.supports_specs")} ${features.versions.join(", ")}`)
        )
        .catch(() => setMatrixVersions(""));

      // Set SSO Url
      getSupportedLoginFlows(formData.base_url)
        .then(loginFlows => {
          const supportPass = loginFlows.find(f => f.type === "m.login.password") !== undefined;
          const supportSSO = loginFlows.find(f => f.type === "m.login.sso") !== undefined;
          setSupportPassAuth(supportPass);
          setSSOBaseUrl(supportSSO ? formData.base_url : "");
        })
        .catch(() => setSSOBaseUrl(""));
    }, [formData.base_url, form]);

    return (
      <>
        <Box>
          <TextInput
            autoFocus
            source="username"
            label="ra.auth.username"
            autoComplete="username"
            disabled={loading || !supportPassAuth}
            onBlur={handleUsernameChange}
            resettable
            validate={required()}
          />
        </Box>
        <Box>
          <PasswordInput
            source="password"
            label="ra.auth.password"
            type="password"
            autoComplete="current-password"
            disabled={loading || !supportPassAuth}
            resettable
            validate={required()}
          />
        </Box>
        <Box>
          <TextInput
            source="base_url"
            label="synapseadmin.auth.base_url"
            select={allowMultipleBaseUrls}
            autoComplete="url"
            disabled={loading}
            readOnly={allowSingleBaseUrl}
            resettable={allowAnyBaseUrl}
            validate={[required(), validateBaseUrl]}
          >
            {allowMultipleBaseUrls &&
              restrictBaseUrl.map(url => (
                <MenuItem key={url} value={url}>
                  {url}
                </MenuItem>
              ))}
          </TextInput>
        </Box>
        <Typography className="serverVersion">{serverVersion}</Typography>
        <Typography className="matrixVersions">{matrixVersions}</Typography>
      </>
    );
  };

  return (
    <Form defaultValues={{ base_url: base_url }} onSubmit={handleSubmit} mode="onTouched">
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
              onChange={e => setLocale(e.target.value)}
              fullWidth
              disabled={loading}
              className="select"
            >
              {locales.map(l => (
                <MenuItem key={l.locale} value={l.locale}>
                  {l.name}
                </MenuItem>
              ))}
            </Select>
            <FormDataConsumer>{formDataProps => <UserData {...formDataProps} />}</FormDataConsumer>
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
