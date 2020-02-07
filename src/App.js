import React from "react";
import { Admin, Resource, resolveBrowserLocale } from "react-admin";
import polyglotI18nProvider from "ra-i18n-polyglot";
import authProvider from "./synapse/authProvider";
import dataProvider from "./dataProvider";
import LoginPage from "./components/LoginPage";
import germanMessages from "./i18n/de";
import englishMessages from "./i18n/en";

// TODO: Can we use lazy loading together with browser locale?
const messages = {
  de: germanMessages,
  en: englishMessages,
};
const i18nProvider = polyglotI18nProvider(
  locale => (messages[locale] ? messages[locale] : messages.en),
  resolveBrowserLocale()
);

const App = () => (
  <Admin
    loginPage={LoginPage}
    authProvider={authProvider}
    dataProvider={dataProvider}
    i18nProvider={i18nProvider}
  >
    <Resource name="data" />
  </Admin>
);

export default App;
