import { useState, useEffect } from "react";

import LockIcon from "@mui/icons-material/Lock";
import { Avatar, Box, Button, Card, CardActions, CircularProgress, MenuItem, Select, Tab, Tabs, Typography } from "@mui/material";
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
import LoginFormBox from "../components/LoginFormBox";
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

export type LoginMethod = "credentials" | "accessToken";

const LoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const { restrictBaseUrl } = useAppContext();
  const allowSingleBaseUrl = typeof restrictBaseUrl === "string";
  const allowMultipleBaseUrls =
    Array.isArray(restrictBaseUrl) &&
    restrictBaseUrl.length > 0 &&
    restrictBaseUrl[0] !== "" &&
    restrictBaseUrl[0] !== null;
  const allowAnyBaseUrl = !(allowSingleBaseUrl || allowMultipleBaseUrls);
  const [loading, setLoading] = useState(false);
  const [supportPassAuth, setSupportPassAuth] = useState(true);
  const [locale, setLocale] = useLocaleState();
  const locales = useLocales();
  const translate = useTranslate();
  const base_url = allowSingleBaseUrl ? restrictBaseUrl : storage.getItem("base_url");
  const [ssoBaseUrl, setSSOBaseUrl] = useState("");
  const loginToken = /\?loginToken=([a-zA-Z0-9_-]+)/.exec(window.location.href);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("credentials");

  useEffect(() => {
    if (!loginToken) {
      return;
    }

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
  }, [loginToken]);

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
      if (formData.base_url || allowSingleBaseUrl) {
        return;
      }
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
      if (!formData.base_url) {
        form.setValue("base_url", "");
      }
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
        <Tabs
          value={loginMethod}
          onChange={(_, newValue) => setLoginMethod(newValue as LoginMethod)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label={translate("synapseadmin.auth.credentials")} value="credentials" />
          <Tab label={translate("synapseadmin.auth.access_token")} value="accessToken" />
        </Tabs>
        {loginMethod === "credentials" ? (
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
          </>
        ) : (
          <Box>
            <TextInput
              source="accessToken"
              label="synapseadmin.auth.access_token"
              disabled={loading}
              resettable
              validate={required()}
            />
          </Box>
        )}
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
      <LoginFormBox>
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
              fullWidth
              value={locale}
              onChange={e => setLocale(e.target.value)}
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
      </LoginFormBox>
      <Notification />
    </Form>
  );
};

export default LoginPage;
