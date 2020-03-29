import React, { useState } from "react";
import {
  Notification,
  useLogin,
  useNotify,
  useLocale,
  useSetLocale,
  useTranslate,
  BooleanInput,
} from "react-admin";
import { Field, Form } from "react-final-form";
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
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "flex-start",
    background: "url(./images/floating-cogs.svg)",
    backgroundColor: "#f9f9f9",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
  card: {
    minWidth: 300,
    marginTop: "6em",
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
}));

const LoginPage = ({ theme }) => {
  const classes = useStyles({ theme });
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  var locale = useLocale();
  const setLocale = useSetLocale();
  const translate = useTranslate();
  const homeserver = localStorage.getItem("base_url");
  const force_server = localStorage.getItem("force_server");

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
    if (!values.homeserver) {
      errors.homeserver = translate("ra.validation.required");
    }
    if (!values.username) {
      errors.username = translate("ra.validation.required");
    }
    if (!values.password) {
      errors.password = translate("ra.validation.required");
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

  return (
    <Form
      initialValues={{ homeserver: homeserver, force_server: force_server }}
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
                  </Select>
                </div>
                <div className={classes.input}>
                  <Field
                    autoFocus
                    name="homeserver"
                    component={renderInput}
                    label={translate("synapseadmin.auth.homeserver")}
                    disabled={loading}
                  />
                </div>
                <div className={classes.input}>
                  <BooleanInput
                    autoFocus
                    name="force_server"
                    label={translate("synapseadmin.auth.force_server")}
                    disabled={loading}
                  />
                </div>
                <div className={classes.input}>
                  <Field
                    name="username"
                    component={renderInput}
                    label={translate("ra.auth.username")}
                    disabled={loading}
                  />
                </div>
                <div className={classes.input}>
                  <Field
                    name="password"
                    component={renderInput}
                    label={translate("ra.auth.password")}
                    type="password"
                    disabled={loading}
                  />
                </div>
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
